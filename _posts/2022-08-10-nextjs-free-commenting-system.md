---
title: NextJS Free Commenting System using Github [Part 1/x]
layout: post
categories: [Next.js, Javascript, React, Github, Comments]
description: "How to build a fully functional commenting system hosted on Github for free."
---

In a recent project of mine built with NextJS I wanted to implement a simple but functional commenting system. While I [already did a commenting system](https://alessiofranceschi.me/blog/react-commenting-system), it was using an external CMS (Sanity.io). While Sanity is great, for this project I had two different goals: 
- I wanted it to be totally free, without limits
- I wanted total control over the data

The solution I came up with was using Github as a database for the comments. Github's API allows us to make commits (save comments) and retrieve files from a repository (get the comments). Please note that this is a great solution for cheap and low-traffic website, otherwise it's just better to use a database. Anyway, this was a fun little challenge. 

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
To protect the privacy of your commenters, we need to encrypt their email. If you don't need the user email (for example if you don't want to send the commenter an email in case of a reply), then you can just not ask the user for the email. Or maybe you want to ask your users other sensitive informations that you don't want to showcase in your repo. In this articles I'll build a commenting systems that requires an email, and as such I'll encrypt just that. To do that, we'll use the `crypto` library of Node.js with the AES-256 algorithm.
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

In our `components` folder, let's create a folder `Comments` and a parent component that I'll call `CommentBlock.tsx`. This component is the one that will be imported in every post.
`CommentBlock` will require two props: `slug` and `comments`. 
`slug` is the slug of the post we're in and will be used to create new comments, while `comments` is an array of comments retrieved in the page using `GetStaticProps` or `GetServerSideProps`, depending on our preference.