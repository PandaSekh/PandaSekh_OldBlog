---
title: Making Nested Comments - Building a Real-Time Commenting System in React [Part 2/3]
layout: post
categories: [Next.js, Javascript, React, Sanity.io]
description: "A series on how to build a fully features Commenting System in Next.js (React)"
---

In the [previous part of this series]({% post_url 2021-01-12-react-commenting-system %}) we created the foundations of this project and now we have a basic commenting system where we can create and display comments in real time. This time we're going to add some extra functionalities, like nested comments and markdown support.

* hello
{:toc}

## Nested Comments
There are a lot of ways to do nested comments and some of them may work better than my method, but for what we need and use (real time updates and Sanity.io as dataset), I found this to be the best approach.

### How to do Nested Comments
In the previous post we created a `Comment` schema which included an array of comments that we called `childComments`. To add a child comment, we're going to update the parent by appending the child to the array. If we want a nephew comment (never heard of this, but I'm going to use these words together anyway), we will update his parent comment same as before, and then we're going to update the parent comment (the granddad comment) with the updated child. I am confused too just by writing this, but I promise it's going to be easier when we actually start programming this. Long story short, when we add a child comment, we need to update its parent, then its grandparent and so on. This may seem inefficient, and it probably is for huge amounts of comments, but my objective wasn't building the new Facebook commenting system. My approach has some advantages: 
 - We greatly reduce calls to the backend, because with a single query we get all the comments;
 - The comments are already nested in the backend, we only need to iterate them, not sort them;
 - Cleaner data in the backend, no need to have references everywhere.

Again, this might seem confusing but it's going to be clearer soon.

### Create a Child Comment
#### Front-End - SingleComment Component
Finally we can code something. First of all, we need to add a *Reply* button to every comment, so open the `SingleComment` component. We can simply add the `AddComment` component, but it's going to be pretty ugly, so we'll add a basic toggle.
Let's add a state for the reply box and a toggle function.
```jsx
const [showReplyBox, setShowReplyBox] = useState(false);
const toggleReplyBox = () => setShowReplyBox(!showReplyBox);
```

Then a button to activate the toggle
```jsx
<button onClick={toggleReplyBox}>Reply</button>
```

And now just add the `AddComment` component, but with some extra props. As said in the previous section, whenever we add a new child we need to update its parent and its "first parent", basically the first comment in the hierarchy that isn't a child comment. This is needed because of how Sanity.io works. I explain this better and the end of the chapter, just know that if you are using a different dataset you might not need this prop.
```jsx
{showReplyBox && (
	<AddComment
		parentCommentId={comment._id}
		firstParentId={firstParentId || comment._id}
	/>
)}
```
`parentCommentId` is the id of the current comment from where we're generating the child, while we've never seen `firstParentId`. Basically, this is going to be the id of the "first parent" we mentioned before. We're going to get it from the `SingleComment` component props, like so:
```jsx
export  default  function  Comment({  comment,  firstParentId  })  { ... }
```
We pass this "first parent" id as prop when rendering the children, like so: 
```jsx
{comment.childComments && (
	<ul>
		{comment.childComments.map(childComment => (
			<Comment
				comment={childComment}
				key={childComment._id}
				firstParentId={firstParentId || comment._id}
			/>
		))}
	</ul>
)}
```

How does this work? Basically, when we have to render the first layer of comments (those that are not children comments), we do it in the `AllComments` component we created in the previous post: 
```jsx
const commentList = comments?.map(comment => {
	return <Comment key={comment._id} comment={comment} />;
});
```

Here we pass no `firstParentId`, meaning that those components have the variable undefined. Because of that, when we render the `AddComment` or all the child comments, we pass the comment id: `firstParentId={firstParentId || comment._id}`. Those child comments will have the `firstParentId` defined and will use that when creating new comments or showing children. This means that no matter how many children there are, they all have the `firstCommentId` props setted to the id of the first comment in the hierarchy. This sounds complicated, but it's just needed to perform an update in the database when we create new comments, because Sanity.io can perform queries only on first level documents. If we have nested documents, like we do, even if those documents have an `_id`, a `_key` and a `_type`, they still can't be "searchable". That's why we have to do all of this "first parent" thing.

One last thing, let's add a custom class in case the comment is a child, so that later we can style it accordingly.
```jsx
<li
	key={comment._id}
	id={comment._id}
	className={firstParentId ? "child" : ""}
>
```

#### Front-End - AddCommentForm Component
We now need to modify the form to create comments by adding the parent comment id and the first parent id. We can get them from the props and then add them to the data we send to the API endpoint.
```jsx
export default function AddCommentForm({parentCommentId, firstParentId}){
	...
	
	const onSubmit = data => {
		setIsSending(true);

		if (parentCommentId) {
			data.parentCommentId = parentCommentId;
			data.firstParentId = firstParentId;
		}

		fetch("/api/addComment", {
			method: "POST", 
			body: JSON.stringify(data)
			}
		).then(r => {
			if (r.status === 200) {
				setIsSending(false);
			} else // handle errors;
		})
	}
	
	...
}
```

That's all for this component.

#### Backend - addComment API
In this serverless function we'll handle the creation of child comments. 
As child comments are created differently from parent ones, let's add an if-else statement inside the try block.
```jsx
try {
	if (doc.parentCommentId) {
		// Remove these values from the document, as they're not expected in the database
		const firstParentId = doc.firstParentId;
		const parentCommentId = doc.parentCommentId;
		delete doc.parentCommentId;
		delete doc.firstParentId;

		appendChildComment(firstParentId, parentCommentId, doc).then(
			() => {
				resolve(
					res.status(200).json({ message: "Comment Created" })
				);
			}
		);
	} else {
		// If there's no parentCommentId, just create a new comment like before
		writeClient.create(doc).then(() => {
			resolve(
				res.status(200).json({ message: "Comment Created" })
			);
		});
	}
} catch (err) {
	reject(res.status(500).json({ message: String(err) }));
}
```

If there's a parent comment id, then it is a child comment. We remove those two variables from the document, otherwise Sanity.io will have problems, and then call a function to append the child comment to the parent comment. The remaining code is the same as before.

Now we need to create the function to actually append child comment. This function will require 3 parameters: the id of the first parent, the id of the parent comment and the child comment itself.
Inside we get the first parent comment and append the child accordingly.

```jsx
function appendChildComment(firstParentId, parentCommentId, childComment) {
	return new Promise(async resolve => {
		// Get the first level parent comment
		const query = `*[_type == "comment" && _id == "${firstParentId}"][0]`;
		const parentComment = await writeClient.fetch(query);

		if (!parentComment.childComments) {
			// Parent Comment has no children, just create a new Array with the child comment
			parentComment.childComments = [childComment];
		} else if (parentComment._id === parentCommentId) {
			// Parent Comment is a first level comment, so just append the comment
			parentComment.childComments = [
				...parentComment.childComments.filter(c => c._id !== childComment._id),
				childComment,
			];
			// The filter is not necessary right now, but in case you want to add an Edit
			// functionality, you'll need this.
		} else {
			// Parent comment is a level two or more nested comment
			// We need to find the actual parent comment in all nested comments
			const childToUpdate = getChildComment(parentComment, parentCommentId);

			if (!childToUpdate.childComments) {
				// Parent comment has no children, create new Array with the new child
				childToUpdate.childComments = [childComment];
			} else {
				// Parent comment already has some children
				// Append the new childComment
				childToUpdate.childComments = [
					...childToUpdate.childComments.filter(
						c => c._id !== childComment._id
					),
					childComment
				];
			}
		}

		// Patch the document
		writeClient
			.patch(parentComment._id)
			.set(parentComment)
			.commit()
			.then(() => resolve());
	});
}

```

Let's analyze the code block by block. 
```jsx
if (!parentComment.childComments) {
	parentComment.childComments = [childComment];
}
```
If the first parent comment has no children, just append the new children in a new array.

```jsx
else if (parentComment._id === parentCommentId) {
	parentComment.childComments = [...parentComment.childComments, childComment];
}
```
If the parent is a first parent, meaning that it is not a child itself, append the comment to the other children.

```jsx
else {
	const childToUpdate = getChildComment(parentComment, parentCommentId);

	if (!childToUpdate.childComments) {
		childToUpdate.childComments = [childComment];
	} else {
		childToUpdate.childComments = [
			...childToUpdate.childComments.filter(
				c => c._id !== childComment._id
			),
			childComment
		];
	}
}
```

If we arrive here, the parent is a child itself and so we need to get this parent comment, update it and then patch the first parent comment in the database.
The function `getChildComment` iterates all children to find the comment we need to update, then the remainder of the code is basically the same as the previous part.

To patch the document we just follow Sanity.io [documentation](https://www.sanity.io/docs/js-client).

The `getChildComment` function is recursive and will return the comment that needs to be updated.

```jsx
function getChildComment(firstParentComment, childCommentId) {
	let returnComment = null;
	firstParentComment?.childComments?.forEach(c => {
		if (c._id == childCommentId) {
			returnComment = c;
		} else if (c.childComments) {
			returnComment = getChildComment(c, childCommentId);
		} else {
			return returnComment;
		}
	});
	return returnComment;
}
```

And with that done, we finally have nested comments. Styling is out of scope for this articles, but a quick tip is that you can add a `margin-left` property to the `child` class to have the child comment slighty moved to the right. As this property is relative to the parent DOM element, we can get a "nested comments" style pretty easily.


## Markdown Support
I wanted to add markdown support because I like to make comments readable and walls of text are not great for that, but I didn't want anything too heavy or complicated for the end user.
 I ended up using a library called [snarkdown](https://github.com/developit/snarkdown). I simply copy-pasted the source code in my project under `lib/snarkdown.js` to remove support for images and headings because we don't need that.

The final code is as follows:
```js
const TAGS = {
	"": ["<em>", "</em>"],
	_: ["<strong>", "</strong>"],
	"*": ["<strong>", "</strong>"],
	"~": ["<s>", "</s>"],
	"\n": ["<br />"],
	" ": ["<br />"],
	"-": ["<hr />"],
};

/** Outdent a string based on the first indented line's leading whitespace
 *	@private
 */
function outdent(str) {
	return str.replace(
		RegExp("^" + (str.match(/^(\t| )+/) || "")[0], "gm"),
		""
	);
}

/** Encode special attribute characters to HTML entities in a String.
 *	@private
 */
function encodeAttr(str) {
	return (str + "")
		.replace(/"/g, "&quot;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

/** Parse Markdown into an HTML String. */
export default function parse(md, prevLinks) {
	let tokenizer = /((?:^|\n+)(?:\n---+|\* \*(?: \*)+)\n)|(?:^``` *(\w*)\n([\s\S]*?)\n```$)|((?:(?:^|\n+)(?:\t|  {2,}).+)+\n*)|((?:(?:^|\n)([>*+-]|\d+\.)\s+.*)+)|(?:!\[([^\]]*?)\]\(([^)]+?)\))|(\[)|(\](?:\(([^)]+?)\))?)|(?:(?:^|\n+)([^\s].*)\n(-{3,}|={3,})(?:\n+|$))|(?:(?:^|\n+)(#{1,6})\s*(.+)(?:\n+|$))|(?:`([^`].*?)`)|(  \n\n*|\n{2,}|__|\*\*|[_*]|~~)/gm,
		context = [],
		out = "",
		links = prevLinks || {},
		last = 0,
		chunk,
		prev,
		token,
		inner,
		t;

	function tag(token) {
		let desc = TAGS[token[1] || ""];
		let end = context[context.length - 1] == token;
		if (!desc) return token;
		if (!desc[1]) return desc[0];
		if (end) context.pop();
		else context.push(token);
		return desc[end | 0];
	}

	function flush() {
		let str = "";
		while (context.length) str += tag(context[context.length - 1]);
		return str;
	}

	md = md
		.replace(/^\[(.+?)\]:\s*(.+)$/gm, (s, name, url) => {
			links[name.toLowerCase()] = url;
			return "";
		})
		.replace(/^\n+|\n+$/g, "");

	while ((token = tokenizer.exec(md))) {
		prev = md.substring(last, token.index);
		last = tokenizer.lastIndex;
		chunk = token[0];
		if (prev.match(/[^\\](\\\\)*\\$/)) {
			// escaped
		}
		// Code/Indent blocks:
		else if ((t = token[3] || token[4])) {
			chunk =
				'<pre class="code ' +
				(token[4] ? "poetry" : token[2].toLowerCase()) +
				'"><code' +
				(token[2]
					? ` class="language-${token[2].toLowerCase()}"`
					: "") +
				">" +
				outdent(encodeAttr(t).replace(/^\n+|\n+$/g, "")) +
				"</code></pre>";
		}
		// > Quotes, -* lists:
		else if ((t = token[6])) {
			if (t.match(/\./)) {
				token[5] = token[5].replace(/^\d+/gm, "");
			}
			inner = parse(outdent(token[5].replace(/^\s*[>*+.-]/gm, "")));
			if (t == ">") t = "blockquote";
			else {
				t = t.match(/\./) ? "ol" : "ul";
				inner = inner.replace(/^(.*)(\n|$)/gm, "<li>$1</li>");
			}
			chunk = "<" + t + ">" + inner + "</" + t + ">";
		}
		// Links:
		else if (token[10]) {
			out = out.replace(
				"<a>",
				`<a href="${encodeAttr(
					token[11] || links[prev.toLowerCase()]
				)}">`
			);
			chunk = flush() + "</a>";
		} else if (token[9]) {
			chunk = "<a>";
		}
		// `code`:
		else if (token[16]) {
			chunk = "<code>" + encodeAttr(token[16]) + "</code>";
		}
		// Inline formatting: *em*, **strong** & friends
		else if (token[17] || token[1]) {
			chunk = tag(token[17] || "--");
		}
		out += prev;
		out += chunk;
	}

	return (out + md.substring(last) + flush()).replace(/^\n+|\n+$/g, "");
}
```

Now, in `components/Comments/SingleComment.js` we can parse the comment.

```jsx
import parser from "../../lib/snarkdown";

...

<p
	className="comment-content"
	dangerouslySetInnerHTML={/{ //remove the slash
		__html: parser(comment.comment.trim()),
	}}
/>
```

## reCAPTCHA
We're going to interate Google reCAPTCHA to avoid any spammy comments. 
First, get an API key from [here](https://www.google.com/recaptcha/admin) and add it to your env (this is my suggested method and the most secure one, you can use what you prefer).
Usually we should load the reCAPTCHA javascript in the head of our document, but I prefer to lazy-load things when possible. To do so, install a library I wrote to load the JS file only when e're loading the comments.
```sh
npm i @pandasekh/dynamic-script-loader
```

Now open the `/components/Comments/AllComments.js` file. We need to import the library and load reCAPTCHA's javascript in the `useEffect` hook.
```jsx
import load from "@pandasekh/dynamic-script-loader";

[...]

	useEffect(async () => {
		
		[...]

		// Dynamically import Google reCAPTCHA
		load(`https://www.google.com/recaptcha/api.js?render=YOUR_API_KEY`);
		
		[...]
	}, []);
```

Now we have reCAPTCHA ready. Let's modify our `AddCommentForm.js` so that it generates a token for reCAPTCHA to verify in the backend.
```jsx
// components/AddComment/AddCommentForm.js

[...]

	const onSubmit = data => {
		setIsSending(true);

		if (parentCommentId) {
			data.parentCommentId = parentCommentId;
			data.firstParentId = firstParentId;
		}

		grecaptcha.ready(() => {
			grecaptcha
				.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, {
					action: "submit",
				})
				.then(token => {
					data.token = token;
					fetch("/api/addComment", {
						method: "POST", 
						body: JSON.stringify(data)
						}
					).then(r => {
						if (r.status === 200) {
							setIsSending(false);
						} else // handle errors;
					})
				}
		}
	}

[...]
```

And finally, we just have to verify this token in the backend.

```js
// pages/api/sendComment.js

[...]

	const doc = JSON.parse(req.body);

	// Check ReCaptcha Token
	verifyRecaptchaToken(doc.token).then(isValidToken => {
		if (!isValidToken) {
			reject(res.status(406).end());
		}
	});

	delete doc.token;

[...]

function verifyRecaptchaToken(token) {
	return fetch("https://www.google.com/recaptcha/api/siteverify", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: `secret=${YOUR_SECRET_LEY}&response=${token}`,
	})
		.then(r => r.json())
		.then(j => {
			return j.success;
		});
}

```


That's all for this post. In the next one we'll finally add some reactions to our comments!

Full Series:
- 1/3 [Building a Real-Time Commenting System in React]({% post_url 2021-01-12-react-commenting-system %})
- 2/3 [Making Nested Comments]({% post_url 2021-01-13-react-commenting-system-part-2 %})
- 3/3 [Emoji Reactions for Comments]({% post_url 2021-01-15-react-commenting-system-part-3 %})