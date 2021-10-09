---
title: NextJS Free Commenting System using Github [Part 1/2]
layout: post
categories: [Next.js, Javascript, React, Github, Comments]
description: "How to build a fully functional commenting system hosted on Github for free."
---

In a recent project of mine built with NextJS I wanted to implement a simple but functional commenting system. While I [already did a commenting system](https://alessiofranceschi.me/blog/react-commenting-system), it was using an external CMS (Sanity.io). Sanity is great, but for this project I had two different goals: 
- I wanted it to be totally free, without limits
- I wanted total control over the data

The solution I came up with was using Github as a database for the comments. Github's API allows us to make commits (save comments) and retrieve files from a repository (get the comments). Please note that this is a great solution for a cheap and low-traffic website, otherwise it's just better to use a database. Anyway, this was a fun little challenge. 

The features of this commenting system are:
- It's totally free
- Infinite child comments
- Can have any parameters you want (Profile pictures, date of comment, etc)
- Privacy is maintained even if the repo is public
- Data is yours and easily manageable (it's just a JSON)

It this series of articles I'll illustrate how I managed to use Github as my comments database for a NextJS - and typescript - commenting system.

## Basic Utils
First of all, we need to create some basic utils that we'll use later on.

### Email Encryption
In this series of articles I'll build a commenting systems that requires an email, and as such I'll encrypt just that. You can skip this step if you don't need to encrypt sensitive data.
To protect the users' privacy, I'll use the `crypto` library of Node.js with the AES-256 algorithm.

```js
import crypto from "crypto";
const algorithm = "aes-256-ctr";
const iv = crypto.randomBytes(16);

const encrypt = (text: string): Hash => {
	const secretKey = process.env.CRYPTO_SECRET_KEY; // Random secret key
	if (!secretKey) throw new Error("No secret");
	const cipher = crypto.createCipheriv(
		algorithm,
		crypto
			.createHash("sha256")
			.update(String(secretKey))
			.digest("base64")
			.substr(0, 32),
		iv
	);
	
	const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
	return {
		iv: iv.toString("hex"),
		content: encrypted.toString("hex"),
	};
};

const decrypt = (hash: Hash): string => {
	const secretKey = process.env.CRYPTO_SECRET_KEY;
	if (secretKey) {
		const decipher = crypto.createDecipheriv(
			algorithm,
			crypto
				.createHash("sha256")
				.update(String(secretKey))
				.digest("base64")
				.substr(0, 32),
			Buffer.from(hash.iv, "hex")
		);
		const decrpyted = Buffer.concat([
		decipher.update(Buffer.from(hash.content, "hex")),
		decipher.final(),
	]);
	return decrpyted.toString();
	}
	throw Error("No secret key");
};

export { encrypt, decrypt };

export interface Hash {
	iv: string;
	content: string;
}
```

The details of the crypto library can be found [in the official docs](https://nodejs.org/api/crypto.html#crypto_crypto_createcipheriv_algorithm_key_iv_options).
The important thing to understand is that we pass to the `encrypt` method a string (the email) and it returns an `Hash` object, which we'll save in the comment JSON instead of the email itself. 
When we need the user's email, we call the `decrypt` method.

### Interfaces
As we're working with Typescript We first need to create the interfaces of the objects we'll be using.

**Comment Interface**
```js
// IComment.ts
import { Hash } from "@lib/encryption/crypto"; // That's the Hash interface we created before

export default interface Comment {
	// Mandatory parameters
	id: string; // Unique id of the comment
	content: string; // The comment itself
	children: Array<Comment>; // Children of this comment
	parentCommentId?: string; // Optional parent comment id
	
	// These are optionals, based on one's needs
	username: string;
	date: Date;
	email: Hash
}
```

## Design the Comments Section
Starting from the basics, we need a simple comments section. I won't cover css as it's out of the scope of this articles.

### Single Comment Component
In our `components` folder, let's create a folder `Comments` and a component called `Comment.tsx`. This component will render a single comment and its children.
This structure is based on what I needed, but can be changed accordingly.

```js
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import IComment from "@interfaces/Comment";
import { decrypt, Hash } from "@lib/encryption/crypto";

export default function Comment({
  comment,
  slug,
}: {
  comment: IComment;
  slug: string;
}): JSX.Element {
  const [reply, setReply] = useState(false); // This state will manage the reply form
  const AddComment = dynamic(() => import("./AddComment")); // No need to import this component if the user won't click on "Reply"

  return (
    <div
			// If this is a child component, we apply a custom class. This is useful to offset child comments from the parent and make a hierachy effect
      className={`${comment.parentCommentId ? "child" : ""}`}> 
      <div>
        <div>
          <span>{comment.date}</span>
          <span>{comment.username}</span>
        </div>
      </div>
      <p>{comment.content}</p>{" "}
      <button
        type="button"
        onClick={() => setReply(!reply)}
      >
        Reply
      </button>
			// If the reply button is clicked, render the <AddComment /> form (that we'll build next)
      {reply && <AddComment slug={slug} parentCommentId={comment.id} />}
      // If there is any child comment, render those too
			{comment.children &&
        comment.children.map((child, index) => (
          <Comment comment={child} slug={slug} key={index} />
        ))}
    </div>
  );
}
```

### Add Comment Form
Then, we need to create the AddComment component that will render a form to create new comments or replies.

```js
import { useEffect, useState } from "react";
import {
  DeepMap,
  FieldError,
  SubmitHandler,
  useForm,
  UseFormHandleSubmit,
  UseFormRegister,
} from "react-hook-form";
import { getKey } from "@lib/utils";
import IComment from "@interfaces/Comment";

export default function AddComment({
  slug,
  parentCommentId,
}: {
  slug: string;
  parentCommentId?: string;
}): JSX.Element {
  const [commentSent, setCommentSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  function sendData(data: FormData) {
    setIsLoading(true);

		// Prepare the new comment data
		const newComment: IComment = {
			date: new Date().toLocaleDateString("en-US"), // p
			parentCommentId: parentCommentId || undefined, // If this new comment has a parent, put the id here
			id: generateUUID(), // generate the unique id here however you want
			username: data.username || "Anonymous",
			email: data.email,
			content: data.content,
			children: [],
		};

		// Send the new comment to an API endpoint we'll build later. It's important to pass the slug parameter and I'm doing that with a path parameter
		fetch(`/api/comments/save/${slug}`, {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify(newComment),
		})
			.then((res) => {
				if (res.ok) {
					// Comment was sent
					setCommentSent(true);
					setIsLoading(false);
					reset({ username: "", email: "", content: "" });
				}
			})
			.catch(() => {
				setCommentSent(true);
				setIsLoading(false);
				// handle the error
			});
  }

  const onSubmit: SubmitHandler<FormData> = (data) => sendData(data);

  return (
    <>
      {!isLoading && !commentSent && (
        <CommentForm
          onSubmit={onSubmit}
          register={register}
          handleSubmit={handleSubmit}
          errors={errors}
        />
      )}
      {isLoading && (
       	<p>Loading...</p>
      )}
    </p>
  );
}
```

The <CommentForm /> component is a basic `react-hook-form` form and it can be done however you want depending on your specific needs.

### Full Comment Block
This component is the one that will be imported in every post.
`CommentBlock` will require two props: `slug` and `comments`. 
`slug` is the slug of the post we're in and will be used to create new comments, while `comments` is an array of comments retrieved in the page using `GetStaticProps` or `GetServerSideProps`, depending on our preference.

```js
import dynamic from "next/dynamic";
import { useState } from "react";
import IComment from "@interfaces/Comment";

export default function CommentBlock({
  slug,
  comments,
}: {
  slug: string;
  comments: Array<IComment> | null;
}): JSX.Element {
	// Dynamically import everything to reduce the first load of a page. Also, there might be no comments at all.
  const Comment = dynamic(() => import("./Comment"));
  const AddComment = dynamic(() => import("./AddComment"));
  const [showAddComment, setShowAddComment] = useState(false);

  return (
		<div>
			<p>Comments</p>
			{comments ? (
				comments.map((c) => (
					<Comment comment={c} key={getKey()} slug={slug} />
				))
			) : (
				<p>
					There are no comments.
				</p>
			)}
			{showAddComment ? (
				<AddComment slug={slug} />
			) : (
				<div>
					<button
						type="submit"
						onClick={() => setShowAddComment(true)}
					>
						Comment
					</button>
				</div>
			)}
		</div>
  );
}
```

## Conclusions

We just finished preparing the basic React structure of the commenting systems. Right now we just need to import the CommentBlock component where we want to display comments.
In the next article we'll build the APIs that will interface with Github in order to store and retrieve the comments.

Full Series:
- 1/2 [NextJS Free Commenting System using Github]({% post_url 2022-08-10-nextjs-free-commenting-system-part-1 %})
- 2/2 [NextJS Free Commenting System using Github]({% post_url 2022-08-10-nextjs-free-commenting-system-part-2 %})