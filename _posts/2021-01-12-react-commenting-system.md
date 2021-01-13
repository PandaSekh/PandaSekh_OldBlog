---
title: Building a Real-Time Commenting System in React [Part 1/?]
layout: post
categories: [Next.js, Javascript, React, Sanity.io]
description: "A series on how to build a fully features Commenting System in Next.js (React)"
---

One of my latest projects is an entire blog built with Next.js, a framework based on React. One of the features I wanted was a commenting system, but none of those already available were interesting for me and I wanted full control on the features and the data. Because of that, I decided to create my own commenting system. This article is meant to show the process of creating it and there’s a [repo on GitHub](https://github.com/PandaSekh/React-Commenting-System) with the full code for reference.

* hello
{:toc}

## Features
First of all, let’s talk about what features I wanted to implement:
- Easy for the end user to comment, anonymous-first
- Nested comments 
- Reactions (or upvote system like Reddit, but I prefer emoticons over that)
- Real-Time: new comments and reaction shown without reloading the page
- Markdown support (for nicely formatted comments
- ReCaptcha v3 (I don’t want to manually approve comments)

For this project I used Next.js and Sanity.io, but they’re not a must for this commenting system. I used both because that’s what I’m using for my blog project, but here’s a brief explanation on why I’m using them and what else can you use.

### Why Next.js
Next.js is “an open-source React front-end development web framework that enables functionality such as server-side rendering and generating static websites for React based web applications.”. While this is great, we don’t need server-side rendering for the commenting system, but Next.js also automatically supports serverless functions. Anything under the “pages/api” folder is a serverless function and we’re going to use them to handle the creation of new comments. If you don’t want to use Next.js, you can simply move the serverless functions elsewhere, for example on AWS Lambda.

### Why Sanity.io
Sanity is a CMS with quite a lot of interesting features. In this project I’m going to use it mostly as a NoSQL database, but the Javascript client includes the possibility to create an RxJS subscription to a query which will come handy when making the commenting system real-time. If you want to use a different NoSQL database and keep the real time features, you need to create an RxJS subscription yourself.


After all this introductions, we can start our project. 

## Project Setup
With `npx create-next-app` we create the basic project structure. If you don’t know how Next.JS works, the [Getting Started](https://nextjs.org/docs) guide is amazing, but here’s a short introduction. Everything under the `pages` folder will be an actual page with the slug being the filename, while the files under `pages/api` will be serverless functions listening at `website.com/api/[name_of_file]`. To test your app, run the command ```npm run dev``` That’s all we need to know for this project.

In the project folder, run the command `npm i -save @sanity/client` to install the Javascript Sanity Client, which will help us make queries to the dataset. Follow the on-screen prompts to create a new dataset. In the client folder, under the `schemas` folder we’ll create our two schemas, one for the comments and one for the reactions.

### Data Schemas
The Comment Schema will include a name, an email, an image (more on that later), the comment itself and a boolean for it’s approved state. I previously said that all comments are approved by default, but I think that comments with urls should not, so I added this flag.
For more information about the schemas for Sanity.io, check out [their documentation](https://www.sanity.io/docs/content-modelling).

```js
export default {
	name: "comment",
	title: "Comment",
	type: "document",
	fields: [
		{
			name: "name",
			title: "User Name",
			type: "string",
		},
		{
			name: "email",
			title: "Email",
			type: "string",
		},
		{
			name: "userImage",
			title: "User Image",
			type: "image",
			options: {
				hotspot: true,
			},
		},
		{
			name: "comment",
			title: "Comment",
			type: "text",
		},
		{
			name: "childComments",
			title: "Child Comments",
			type: "array",
			of: [{ type: "comment" }],
		},
		{
			name: "approved",
			title: "Approved",
			type: "boolean",
		},
	],
	preview: {
		select: {
			title: "name",
			subtitle: "comment",
		},
	},
};
```

For the reactions, the schema must include a comment id (I went for a string instead of a reference because in this use case, where object are linked programmatically, I felt it was a better choice), and an array of reaction objects, which include the emoji itself, a counter and a label.

```js
export default {
	name: "commentReactions",
	title: "Comment Reactions",
	type: "document",
	fields: [
		{
			name: "commentId",
			title: "Comment Id",
			type: "string",
		},
		{
			name: "reactions",
			title: "Reactions",
			type: "array",
			of: [
				{
					type: "object",
					fields: [
						{
							name: "emoji",
							type: "string",
							title: "Emoji",
						},
						{
							name: "counter",
							type: "number",
							title: "Counter",
						},
						{
							name: "label",
							type: "string",
							title: "Label",
						},
					],
				},
			],
		},
	],
	preview: {
		select: {
			title: "commentId",
		},
	},
};
```

## Create Comments
### Front-end Component
In the root folder create a new folder, `components`, and inside that create another folder called `AddCommentForm` to keep things tidy. Create a new component called `AddCommentForm.js` and create a Form for new comments. The component itself isn’t anything special and you can do it however you want, I used React Hook Form and you can see it [here](https://github.com/PandaSekh/React-Commenting-System/blob/main/components/AddComment/AddCommentForm.js). The important part is the submission handler, but for now we’ll keep things simple and we’ll come back later to make some adjustments when we add nested comments. Now we’ll just make a fetch in POST to our soon-to-be-made API, like this:

```js
fetch("/api/addComment", {method: "POST", body: JSON.stringify(data)})
```
Where data is the data from the form (with React Hook Form, it’s the parameter automatically passed to the handleSubmit callback).

The full code should look like this:

```jsx
import { useForm } from "react-hook-form";
import { Fragment, useState } from "react";

export default function AddCommentForm(){
	const [isSending, setIsSending] = useState(false);
	const { register, errors, handleSubmit, reset } = useForm();

	const onSubmit = data => {
		setIsSending(true);

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

	return (
			<form onSubmit={handleSubmit(onSubmit)}>
				<input
					type="text"
					placeholder="Name (Optional)"
					name="name"
					ref={register({ required: false, maxLength: 80 })}
				/>
				<input
					type="text"
					placeholder="Email (Optional)"
					name="email"
					ref={register({ required: false, pattern: /^\S+@\S+$/i })}
				/>
				{errors.email && <span>Invalid email</span>}
				<textarea
					name="comment"
					placeholder="Your Comment"
					rows="5"
					ref={register({ required: true, maxLength: 5000 })}
				/>
				{errors.comment && (
					<span>You need to write something</span>
				)}
				<input
					type="submit"
					disabled={isSending}
					value={isSending ? "Sending Comment..." : "Send Comment"}
				/>
			</form>
	);
}
```

Import and add this Component in your `pages/index.js` file to use it. 

### Serverless Backend
In `pages/api`, create a new file and call it `addComment.js`. Here we’ll create and add the new comment to Sanity. First of call, create a Sanity Client.

```js
const sanityClient = require("@sanity/client");
const client = sanityClient({
	projectId: YOUR_SANITY_PROJECT_ID,
	dataset: YOUR_SANITY_DATASET,
	token: WRITE_TOKEN,
});
```
You can get all those infos in your Sanity Dashboard. For the token see [here](https://www.sanity.io/docs/keeping-your-data-safe#take-good-care-of-your-access-tokens-a99296355dc1).

Now let’s add some helpers:

```js
// We need this to generate random keys both here and later when we’ll map React Components
import { nanoid } from 'nanoid'

// Sanitize the html for security reasons
import sanitizeHtml from "sanitize-html";

// RegEx to identify urls and set the comment as unapproved 
const urlRegEx = new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?([^ ])+");
```

Create a handler for the serverless function, which will be the default export.

```js
export default (req, res) => {}
```

This will return a new Promise (otherwise it will give warnings in dev and will not work in production)

```js
export default (req, res) => {
	return new Promise((resolve, reject) => {
	}
}
```

Inside, we’ll create a new object with the values required by the dataset and those we got from the request.

```js
export default (req, res) => {
	return new Promise((resolve, reject) => {
		const document = JSON.parse(req.body);
		document ._type = "comment";
		document ._key = nanoid();
		document ._id = document ._key;
		document ._createdAt = new Date();
		document .comment = sanitizeHtml(document .comment, {
			allowedTags: ["b", "i", "em", "strong", "a", "li", "ul"],
			allowedAttributes: {
				a: ["href"],
			},
		});
		if (!doc.name) doc.name = "Anonymous";
		try {
			client.create(document).then(() => {
					resolve(
						res.status(200).json({ message: "Comment Created" })
					);
				});

		} catch (err) {
			reject(res.status(500).json({ message: String(err) }));
}
	}
}
```

The new comment section is now complete! We can successfully create and save new comments.

## Displaying the Comments
To show comments, create a new folder in the `components` folder and call it `Comments`. Inside, we'll first create the component to show a single comment, so create a new file and call it `SingleComment.js`.
This component will take a comment object from its parent and render it, simple as that. 
```jsx
import { useState } from "react";

export default function Comment({ comment }) {

	return (
		<li
			key={comment._id}
			id={comment._id}
		>
			<span>
				<span>
					Comment by <strong>{comment.name}</strong> on{" "}
					<strong>{comment._createdAt}</strong>
				</span>
			</span>
			<p>
			{comment.comment.trim()}
			</p>
		</li>
	);
}
```

In the `Comments` folder, create a new component and call it `AllComments.js`. This will render all of our comments. 
First of all, we'll set in the state all comments using the `useEffect` hook, like so:

```jsx
import { useState, useEffect } from "react";
import Comment from "./SingleComment"

const query = `*[_type == "comment" && approved==true]{_id, comment, name, _createdAt, childComments} | order (_createdAt)`;

export default function AllComments() {
	const [comments, setComments] = useState();

	useEffect(async () => {
		setComments(await client.fetch(query));
	}
}
```
The query asks for every approved comment ordered by creation date. We can already make the comments real-time thanks to Sanity integration of RxJS:

```jsx
import { useState, useEffect } from "react";
import Comment from "./SingleComment"

const query = `*[_type == "comment" && approved==true]{_id, comment, name, _createdAt, childComments} | order (_createdAt)`;

// Create a new globally scoped variable
let querySub = undefined;

export default function AllComments() {
	const [comments, setComments] = useState();

	useEffect(async () => {
		setComments(await client.fetch(query));

		// Subscribe to the query, listening to new updates
		// If there's an update, add it to the comments state and sort it again
		// The update might occur on a comment we already have in the state,
		// so we should filter out that comment from the previous state
		querySub = client.listen(query).subscribe(update => {
			if (update) {
				setComments(comments =>
					[
						...comments.filter(
							comment => comment._id !== update.result._id
						),
						update.result,
					].sort((a, b) => (a._createdAt > b._createdAt ? 1 : -1))
				);
			}
		});

		// Unsubscribe on Component unmount
		return () => {
			querySub.unsubscribe();
		};
	}
}
```

Now that we have all the comments in our state, we can easily render them

```jsx
const commentList = comments?.map(comment => {
	return <Comment key={comment._id} comment={comment} />;
});

return (
	<ul>{commentList}</ul>
);
```

That's it! Add the `AllComments` component in the `index.js` file and now you can add and see comments with real-time updates!

In the next part, we'll add the nested comments functionality and some other small features, like ReCaptcha v3 and Markdown support.
