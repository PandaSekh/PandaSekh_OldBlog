---
title: NextJS Free Commenting System using Github [Part 2/2]
layout: post
categories: [Next.js, Javascript, React, Github, Comments]
description: "How to build a fully functional commenting system hosted on Github for free."
---

In the previous article we built the basic interface for our commenting system. Now we need to program the API endpoints to communicate with Github's API in order to save and retrieve the comments.

## Save Comments
Let's start by saving some comment. In the `pages/api` path, let's create a new folder named `comments`, inside of which we'll create another folder named `save` and finally inside that a file named `[slug].ts`. Of course you can change the naming as you wish. You can also create a single path (for example, `/api/comment`) and then call different functions depending on the method used.
To save a comment, we need to:
1. Check if the comment has a parent or not.
2. If it has a parent, then we need to append this comment to the parent
3. Else, we can insert this comment into the array of comments we might already have 

In both cases, we first need to request the data we already have, modify it and then update the repo.

### Prepare the data
Let's start from a basic NextJS API function.
```js
import type { NextApiRequest, NextApiResponse } from "next";

export default (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
	return new Promise(async (resolve) => {
		// Our code here
	})
}
```

Inside this function, we'll first prepare the data sent to the API.
```js
// Import the modules we need
import { encrypt } from "@lib/encryption/crypto";
import Comment from "@interfaces/Comment";

const newComment: Comment = {
	date: req.body.date,
	parentCommentId: req.body.parentCommentId,
	id: req.body.id,
	username: req.body.username,
	email: encrypt(req.body.email as string),
	content: req.body.content,
	children: req.body.children,
};

const { slug } = req.query;
```

### Merge parent and child comments
We need a function that will merge a child comment with its parent. Because we work with a basic Javascript object, we'll need
to use recursion to find the actual parent.

```js
function appendToParent(comments: Array<Comment>, newComment: Comment): Array<Comment> {
  comments.forEach((comment) => {
    if (comment.id === newComment.parentCommentId) {
      comment.children.push(newComment);
    } else if (comment.children && comment.children.length > 0) {
      comment.children = appendToParent(comment.children, newComment);
    }
  });
  return comments;
}
```

### Update the data
Now we have the new comment data, so we need to get the previous data and modify it.
To communicate with Github's API I used the official library `@octokit/request`. From now on we'll work inside a `try` block.
```js
import { request } from "@octokit/request";

try {
	// Here we request the document in JSON (vnd.github.v3+json) because
	// with raw we don't have the file sha
	const prevComments = await request(
		// we request a GET on this path
		"GET /repos/{owner}/{repo}/contents/{path}",
		{
			headers: {
				// github private token
				authorization: `token ${process.env.GITHUB_TOKEN}`,
				// how we want the file. In this case, we want a JSON
				accept: "application/vnd.github.v3+json",
			},
			// Owner of the repo
			owner: "PandaSekh",
			// Name of the repo
			repo: "my-blog-repo",
			// the path. I save the comments in a folder named comments in the root
			path: `comments/${slug}.json`,
			// the branch
			ref: "prod",
		}
	).catch((e) => {
		// We accept and will handle a 404 because not every post will have
		// comments. For any other error statusCode, throw an error.
		if (e.status !== 404) throw new Error(e);
	});
	// [...] We'll add more code here
}
```

Now that we have the new comment and, if present, the previous comments we can merge them and save the updated data. How we do this depends on the presence of previous comments.
```js
// Still in the try block
 			// if prevComments is undefined, there are no previous comments. This is the first possibility.
      if (prevComments) {
        // get the data from the base64 encoded content and parse it as JSON.
        let data = JSON.parse(
          Buffer.from(prevComments.data.content, "base64").toString("ascii")
        );
        // Save the sha. We need it to update the file later on
        const { sha } = prevComments.data;

        // Merge the new comment to the parent if it has one. Else, simply add it to the array.
        if (newComment.parentCommentId) {
          data = appendToParent(data, newComment); // Merge the parent and the child comment
        } else {
          data.push(newComment);
        }

        // Save the updated comments to Github
        const update = await request(
          "PUT /repos/{owner}/{repo}/contents/{path}",
          {
							headers: {
							// github private token
							authorization: `token ${process.env.GITHUB_TOKEN}`,
							// how we want the file. In this case, we want a JSON
							accept: "application/vnd.github.v3+json",
						},
						// Owner of the repo
						owner: "PandaSekh",
						// Name of the repo
						repo: "my-blog-repo",
						// the path. I save the comments in a folder named comments in the root
						path: `comments/${slug}.json`,
            branch: "prod",
            message: `Updated comment on post ${slug}`, // Git commit message
            sha, // The sha we saved before
            content: Buffer.from(JSON.stringify(data), "ascii").toString("base64"),
          }
        );
        res.status(200).json(JSON.stringify(update));
        resolve();
```

And now we write the else in case there were no comments before the new one.

```js
	else {
			const data = [newComment];
			// Save the new comment to Github
			const update = await request(
				"PUT /repos/{owner}/{repo}/contents/{path}",
				{
						headers: {
						// github private token
						authorization: `token ${process.env.GITHUB_TOKEN}`,
						// how we want the file. In this case, we want a JSON
						accept: "application/vnd.github.v3+json",
					},
					// Owner of the repo
					owner: "PandaSekh",
					// Name of the repo
					repo: "my-blog-repo",
					// the path. I save the comments in a folder named comments in the root
					path: `comments/${slug}.json`,
					branch: "prod",
					message: `New comment on post ${slug}`, // Git commit message
					content: Buffer.from(JSON.stringify(data), "ascii").toString("base64"),
				}
			);
			res.status(200).json(JSON.stringify(update));
			resolve();
		}
	} catch (e) {
		res.status(500).json(e);
		resolve();
	}
```

### Full API method
Below the complete API method for reference.

```js
import { request } from "@octokit/request";
import type { NextApiRequest, NextApiResponse } from "next";
import Comment from "@interfaces/Comment";
import { encrypt } from "@lib/encryption/crypto";

function appendToParent( comments: Array<Comment>, newComment: Comment ): Array<Comment> {
  comments.forEach((comment) => {
    if (comment.id === newComment.parentCommentId) {
      comment.children.push(newComment);
    } else if (comment.children && comment.children.length > 0) {
      comment.children = appendToParent(comment.children, newComment);
    }
  });
  return comments;
}

export default (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  return new Promise(async (resolve) => {
    const newComment: Comment = {
			date: req.body.date,
			parentCommentId: req.body.parentCommentId,
			id: req.body.id,
			username: req.body.username,
			email: encrypt(req.body.email as string),
			content: req.body.content,
			children: req.body.children,
		};

		const { slug } = req.query;

    try {
      const prevComments = await request(
        "GET /repos/{owner}/{repo}/contents/{path}",
        {
          headers: {
            authorization: `token ${process.env.GITHUB_TOKEN}`,
            accept: "application/vnd.github.v3+json",
          },
          owner: "PandaSekh",
          repo: "my-blog-repo",
          path: `comments/${slug}.json`,
          ref: "prod",
        }
      ).catch((e) => {
        if (e.status !== 404) throw new Error(e);
      });

      if (prevComments) {
        let data = JSON.parse(Buffer.from(prevComments.data.content, "base64").toString("ascii"));

        const { sha } = prevComments.data;

        if (newComment.parentCommentId) {
          data = appendToParent(data, newComment);
        } else {
          data.push(newComment);
        }

        const update = await request(
          "PUT /repos/{owner}/{repo}/contents/{path}",
          {
            headers: {
              authorization: `token ${process.env.GITHUB_TOKEN}`,
              accept: "application/vnd.github.v3+json",
            },
            owner: "PandaSekh",
            repo: "my-blog-repo",
            path: `comments/${slug}.json`,
            branch: "prod",
            message: `Updated comment on post ${slug}`,
            sha,
            content: Buffer.from(JSON.stringify(data), "ascii").toString(
              "base64"
            ),
          }
        );

        res.status(200).json(JSON.stringify(update));
        resolve();
      } else {
        const data = [newComment];

        const update = await request(
          "PUT /repos/{owner}/{repo}/contents/{path}",
          {
            headers: {
              authorization: `token ${process.env.GITHUB_TOKEN}`,
              accept: "application/vnd.github.v3+json",
            },
            owner: "PandaSekh",
            repo: "my-blog-repo",
            path: `comments/${slug}.json`,
            branch: "prod",
            message: `New comment on post ${slug}`,
            content: Buffer.from(JSON.stringify(data), "ascii").toString(
              "base64"
            ),
          }
        );
       
        res.status(200).json(JSON.stringify(update));
        resolve();
      }
    } catch (e) {
      res.status(500).json(e);
      resolve();
    }
  });
};
```

## Get Comments

The method to retrieve comments depends on how you want to build your website. As I expected very few comments and I wanted the website to be fully static, I get the comments in a `GetStaticProps` method inside the `[slug].tsx` page. Every new comment triggers a re-deploy and rebuild the site. This is not the best approach if you expect a moderate amount of comments, in that case it might be a better idea to use `GetServerSideProps`.

```js
// This method will vary depending on your needs
export async function getStaticProps({ params }: { params: { slug: string }}): Promise<{ props: Props }> {
  const comments = await getComments(params.slug);

  return {
    props: {
 			comments,
    },
  };
}

async function getComments( slug: string ): Promise<Array<Comment> | null> {
  try {
    const comments = await request(
      "GET /repos/{owner}/{repo}/contents/{path}",
      {
        headers: {
          authorization: `token ${process.env.GITHUB_TOKEN}`,
          accept: "application/vnd.github.v3.raw",
        },
        owner: "PandaSekh",
        repo: "your-blog-repo",
        path: `../../comments/${slug}.json`,
        ref: "prod",
      }
    );
    return JSON.parse(comments.data as unknown as string);
  } catch (e) {
    return null;
  }
}
```

That's all! This is how I built my free static commenting system.
If you have any doubts you can comment here or write me on my social media.

Full Series:
- 1/2 [NextJS Free Commenting System using Github]({% post_url 2022-08-10-nextjs-free-commenting-system-part-1 %})
- 2/2 [NextJS Free Commenting System using Github]({% post_url 2022-08-10-nextjs-free-commenting-system-part-2 %})