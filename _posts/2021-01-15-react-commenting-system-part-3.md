---
title: Emoji Reactions to Comments - Building a Real-Time Commenting System in React [Part 3/?]
layout: post
categories: [Next.js, Javascript, React, Sanity.io]
description: "A series on how to build a fully features Commenting System in Next.js (React)"
---

In the [first part]({% post_url 2021-01-12-react-commenting-system %}) of this series we built the basics of a commenting system while in the [second one]({% post_url 2021-01-13-react-commenting-system-part-2 %}) we finally added nested comments. In this third and final article we'll add Emoji Reactions. This is going to be useful because people can interact with your content without the need to write a comment. An alternative would be a Reddit-like voting system, but I think that emojis will add a bit of color to our comments, so I decided to go for them.

* hello
{:toc}

{% include gif.html filename = "/react-commenting/reactions-example" %}

## Features
The emojis should update real-time and be lightweight, as we don't want to slow down everything just for a bunch of smiley faces. I tried various libraries, but they all were too heavy (we're talking megabytes) or slow. We need reactions for each comment and if the library isn't fast and efficient we can break the site quite easily. Because of that, I decided to create my own emoji picker, with some limitations of course:
- Limited selection of Emojis (which is a great thing tbh, I'm going to explain why soon)
- No skin color alternatives, everyone is a Simpson (again, great)

This limitations are actually useful because every emoji is renderer with it's own counter and displayed near the comment and with 3,304 emojis currently existing it will become impossibile to render them all. Also, we can just use themed emojis. You want to use this in you cooking blog? Just add some cooking-related emojis to make your blog more fun.

## Data Schema
We already created our data schema in the first article, so I'm just going to explain it's structure quickly. 
`commentId` is the id or key (they're usually different parameters, but in our case they're the same) of the comment, no matter if it's a parent or a child. 
`reactions` is an array containing all the Reactions relative to that comment. A Reaction is composed of:
- `emoji`, the emoji itself
- `counter` of every time that emoji was clicked/selected
- `label`, for accessibility reasons

![The Emoji Reaction Block](/assets/img/react-commenting/emoji-block.jpg)

## Components
Let's start making some components, starting from the basic ones and adding something to them in each step. Create a new folder in the `components` one to keep things tidy. I called mine simply `Emoji`.

### Emoji Component
Basic component which will render an emoji with the correct attributes for accessibility, `role="img"` and `aria-label`.

```jsx
// components/Emoji/Emoji.js

export default function Emoji({ emoji, label, className, onClickCallback }) {
	return (
		<span
			className={
				className ? className + " emoji" : "emoji"
			}
			role="img"
			aria-label={label ? label : ""}
			aria-hidden={label ? "false" : "true"}
			onClick={onClickCallback}
		>
			{emoji}
		</span>
	);
}
```

This component will simply render an emoji. The props `emoji` and `label` are those we'll get from Sanity, `className` is an optional extra class, `onClickCallback` is an optional callback for the `onClick` event. Later on we'll do some basic styling, so this time I'm going to define classes too.

### Emoji With Counter
An Emoji with a Counter showing how many times it was selected.

```jsx
// components/Emoji/EmojiWithCounter.js
import Emoji from "./Emoji";

export default function EmojiWithCounter({emoji, emojiLabel, initialCounter, onIncrease}) {
	return (
		<span
			className="emoji-container"
			id={emojiLabel}
			onClick={() => onIncrease(emoji)}
		>
			<Emoji emoji={emoji} label={emojiLabel} />
			<div className="emoji-counter-div">
				<span className="emoji-counter">{initialCounter}</span>
			</div>
		</span>
	);
}
```

Pretty self-explanatory, this will render an Emoji with a counter on top of it. `onIncrease` is a callback for the `onClick` event.

Before continuing I feel the need to explain the difference between these two components, because there might be some confusion on why I had to pass and call two different callbacks both for the `onClick` event.
The difference is quite simple. As you saw in the screenshot in the beginning of the article, there will be a box with "unselected" emojis, and a row of selected emojis with a counter on them (see [the demo](https://react-commenting-system.vercel.app/) if this isn't clear). So, we'll use the `Emoji` component for the unselected emojis. It's callback will create a new object in the database and start it's counter at 1. Also, it will remove the emoji from the unselected box and move it to the row of selected ones. 
The `EmojiWithCounter` is the component used to render the selected emojis.

![The Different Emojis](/assets/img/react-commenting/difference.png)

### Emoji Adder
This component will handle the opening and closing of the unselected emojis. We don't want to clutter the comments with emojis everywhere, so by default only the selected ones should be visible. Also, it renders the unselected emojis menu.

```jsx
// components/Emoji/EmojiAdder.js

import Emoji from "./Emoji";
import { Fragment, useState } from "react";
import { nanoid } from 'nanoid'

export default function EmojiAdder({selectedEmojis, updateEmojiCount, EMOJI_OPTIONS}) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

	// We have an array of already selected emojis
	const alreadySelectedEmojis = selectedEmojis.map(e => e.emoji);

	// We create an array of Emoji components that are not already selected
	const emojiOptions = EMOJI_OPTIONS.filter(
		e => !alreadySelectedEmojis.includes(e.emoji)
	).map(singleEmoji => (
		<Emoji
			key={nanoid()}
			emoji={singleEmoji.emoji}
			label={singleEmoji.label}
			onClickCallback={() => {
				updateEmojiCount(singleEmoji.emoji); // We pass a callback which will add the emoji to the selected ones on click
				toggleMenu();
			}}
		/>
	));

	return (
		<Fragment>
			{emojiOptions.length > 0 && (
				<span className="reaction-adder-emoji">
					<Emoji
						onClickCallback={toggleMenu}
						emoji={"+"}
						label="emoji-adder"
					/>
					<EmojiMenu />
				</span>
			)}
		</Fragment>
	);

	function EmojiMenu() {
		return (
			<div
				className={
					isMenuOpen
						? "emoji-adder-menu-open"
						: "emoji-adder-menu-closed"
				}
			>
				{emojiOptions}
			</div>
		);
	}
}
```


We now have to stitch all of these components together, but before we do that we need something else.

## Emoji Context
[useContext](https://reactjs.org/docs/hooks-reference.html#usecontext) is a React Hook that can provide something like a global state. Explaining it is out of the scope of this articles, if you want to know more the React Documentation is a good place to start. 
We're going to create a Context to hold every reaction added to every comment. I decided to do this to reduce the calls to Sanity backend, because with this method we request everything at once when loading comments.

So, let's open the `components/Comments/AllComments.js` file.

```jsx
import { useState, useEffect, createContext } from "react";
[...]

const ReactionsContext = createContext(undefined);

export default function AllComments() {
	const [reactions, setReactions] = useState();
	[...]

	useEffect(async () => {
		[...]

		client
			.fetch(`*[_type == "commentReactions"]`)
			.then(r => setReactions(r));
	}

	[...]

	return (
		<ReactionsContext.Provider value={reactions}>
			<ul>{commentList}</ul>
		</ReactionsContext.Provider>
	);
}
```

With these additions we now can access the `ReactionsContext` and the value of `reactions` from everywhere in our application.
For the full code of this file see [the repo](https://github.com/PandaSekh/React-Commenting-System/blob/main/components/Comments/AllComments.js).

## Emoji Selection
As said in the beginning of this article, we need to define ourselves the available emojis.

Wherever you want create a file to hold an array of emojis that you want to use in your reactions.
I created a `lib` folder and inside a `emojiConfig.js` file.

```js
const DEFAULT_EMOJI_OPTIONS = [
	{
		emoji: "😄",
		label: "happy",
	},
	{
		emoji: "📚",
		label: "books",
	},
	{
		emoji: "😟",
		label: "suprised",
	},
	{
		emoji: "🐱",
		label: "cat",
	},
	{
		emoji: "🐼",
		label: "panda",
	},
];

export { DEFAULT_EMOJI_OPTIONS };
```


Now we can go back and finish our Reactions Block.

## Full Reaction Block
Time to assemble everything!

First, import everything we need and create some global variables that we'll need later on.
```jsx
import EmojiWithCounter from "./EmojiWithCounter";
import EmojiAdder from "./EmojiAdder";
import { ReactionsContext } from "../Comments/AllComments";
import { DEFAULT_EMOJI_OPTIONS } from "../../lib/emojiConfig";
import {nanoid} from "nanoid";
import { useState, useEffect, useContext } from "react";
import { client } from "../../lib/sanityClient";

let dbDebouncerTimer;
let querySub;
```

Now prepare the state.
```jsx
export default function ReactionBlock({ commentId }) {
	// We get the initial reactions we previously fetched from the Context
	// and filter them so we only have the ones for this comment.
	// Also, I wanted to sort them by their amount.
	const contextReactions = useContext(ReactionsContext)
		?.filter(r => r.commentId === commentId)
		.map(r => r.reactions)
		?.sort((a, b) => (a.counter < b.counter ? 1 : -1))[0];
	const [reactions, setReactions] = useState([]);
	const [shouldUpdateDb, setShouldUpdateDb] = useState(false);
```

Now we use the `useEffect` hook to subscribe to the query and get real-time updates.
```jsx
useEffect(() => {
	// If there are reactions in the context, set them
	if (contextReactions) setReactions(contextReactions);

	// Subscribe to the query Observable and update the state on each update
	const query = `*[_type == "commentReactions" && commentId=="${commentId}"]`;
	querySub = client.listen(query).subscribe(update => {
		if (update) {
			setReactions([
				...update.result.reactions.sort((a, b) =>
					a.counter < b.counter ? 1 : -1
				),
			]);
		}
	});

	// Unsubscribe on Component unmount
	return () => {
		querySub.unsubscribe();
	};
}, []);
```

Now we need a function to update the database whenever we click an emoji.
```jsx
const updateEmojiCount = emoji => {
	setShouldUpdateDb(false);
	let emojiFromState = reactions.filter(em => em.emoji === emoji)[0];
	// If the selected emoji wasn't in the state, it's a new one
	if (!emojiFromState) {
		emojiFromState = DEFAULT_EMOJI_OPTIONS.filter(
			em => em.emoji === emoji
		)[0];
		emojiFromState.counter = 1;
		setReactions(reactions =>
			[...reactions, emojiFromState].sort((a, b) =>
				a.counter < b.counter ? 1 : -1
			)
		);
	} else {
		emojiFromState.counter++;
		setReactions(reactions =>
			[
				...reactions.filter(
					rea => rea.emoji !== emojiFromState.emoji
				),
				emojiFromState,
			].sort((a, b) => (a.counter < b.counter ? 1 : -1))
		);
	}
	setShouldUpdateDb(true);
};
```

This function toggles the `shouldUpdateDb` state and we can listen to that change to call another function.
```jsx
useEffect(() => {
	if (shouldUpdateDb) updateReactionsOnDatabase();
	setShouldUpdateDb(false);
}, [shouldUpdateDb]);

function updateReactionsOnDatabase() {
	clearTimeout(dbDebouncerTimer);
	dbDebouncerTimer = setTimeout(() => {
		fetch("/api/addReaction", {
			method: "POST",
			body: JSON.stringify({
				commentId: commentId,
				reactions: reactions,
			}),
		});
		dbDebouncerTimer = null;
	}, 1000 * 1);
}
```	

All of this is needed to debounce the database update. Our Reactions Block will now update the database one second after the last click, meaning that 10 click won't perform 10 database updates.

Finally, we map the reactions and render everything.

```jsx
const mappedReactions = reactions.map(reaction => (
	<EmojiWithCounter
		key={nanoid()}
		emoji={reaction.emoji}
		emojiLabel={reaction}
		initialCounter={reaction.counter}
		onIncrease={updateEmojiCount}
	/>
));

return (
	<div className="reaction-block">
		{mappedReactions}
		<EmojiAdder
			selectedEmojis={reactions}
			updateEmojiCount={updateEmojiCount}
			EMOJI_OPTIONS={DEFAULT_EMOJI_OPTIONS}
		/>
	</div>
);
```

The full code (not in the same order) is as follows:
```jsx
import EmojiWithCounter from "./EmojiWithCounter";
import {nanoid} from "nanoid";
import EmojiAdder from "./EmojiAdder";
import { useState, useEffect, useContext } from "react";
import { ReactionsContext } from "../Comments/AllComments";
import { client } from "../../lib/sanityClient";
import { DEFAULT_EMOJI_OPTIONS } from "../../lib/emojiConfig";

let dbDebouncerTimer;
export default function ReactionBlock({ commentId }) {
	// We get the initial reactions we previously fetched from the Context
	const contextReactions = useContext(ReactionsContext)
		?.filter(r => r.commentId === commentId)
		.map(r => r.reactions)
		?.sort((a, b) => (a.counter < b.counter ? 1 : -1))[0];
	const [reactions, setReactions] = useState([]);
	const [shouldUpdateDb, setShouldUpdateDb] = useState(false);

	let querySub = undefined;

	useEffect(() => {
		// If there are reactions in the context, set them
		if (contextReactions) setReactions(contextReactions);

		// Subscribe to the query Observable and update the state on each update
		const query = `*[_type == "commentReactions" && commentId=="${commentId}"]`;
		querySub = client.listen(query).subscribe(update => {
			if (update) {
				setReactions([
					...update.result.reactions.sort((a, b) =>
						a.counter < b.counter ? 1 : -1
					),
				]);
			}
		});

		// Unsubscribe on Component unmount
		return () => {
			querySub.unsubscribe();
		};
	}, []);

	useEffect(() => {
		if (shouldUpdateDb) updateReactionsOnDatabase();
		setShouldUpdateDb(false);
	}, [shouldUpdateDb]);

	// Onclick, update the emoji counter and start a timer to update the database
	const updateEmojiCount = emoji => {
		setShouldUpdateDb(false);
		let emojiFromState = reactions.filter(em => em.emoji === emoji)[0];
		if (!emojiFromState) {
			emojiFromState = DEFAULT_EMOJI_OPTIONS.filter(
				em => em.emoji === emoji
			)[0];
			emojiFromState.counter = 1;
			setReactions(reactions =>
				[...reactions, emojiFromState].sort((a, b) =>
					a.counter < b.counter ? 1 : -1
				)
			);
		} else {
			emojiFromState.counter++;
			setReactions(reactions =>
				[
					...reactions.filter(
						rea => rea.emoji !== emojiFromState.emoji
					),
					emojiFromState,
				].sort((a, b) => (a.counter < b.counter ? 1 : -1))
			);
		}
		setShouldUpdateDb(true);
	};

	// Debouncer to avoid updating the database on every click
	function updateReactionsOnDatabase() {
		clearTimeout(dbDebouncerTimer);
		dbDebouncerTimer = setTimeout(() => {
			fetch("/api/addReaction", {
				method: "POST",
				body: JSON.stringify({
					commentId: commentId,
					reactions: reactions,
				}),
			});
			dbDebouncerTimer = null;
		}, 1000 * 1);
	}

	const mappedReactions = reactions.map(reaction => (
		<EmojiWithCounter
			key={nanoid()}
			emoji={reaction.emoji}
			emojiLabel={reaction}
			initialCounter={reaction.counter}
			onIncrease={updateEmojiCount}
		/>
	));

	return (
		<div className="reaction-block">
			{mappedReactions}
			<EmojiAdder
				selectedEmojis={reactions}
				updateEmojiCount={updateEmojiCount}
				EMOJI_OPTIONS={DEFAULT_EMOJI_OPTIONS}
			/>
		</div>
	);
}
```

## Backend
Last but not least, we need a serverless function to update our database. This is way easier than the comment creation function.

```js
// pages/api/addReaction.js

import { writeClient } from "../../lib/sanityClient";

export default (req, res) => {
	return new Promise(resolve => {
		const body = JSON.parse(req.body);
		const _id = body.commentId;
		const reactions = body.reactions;
		reactions.forEach(r => (r._key = r.label));

		const query = `*[_type == "commentReactions" && commentId == "${_id}"]{_id}[0]`;
		writeClient.fetch(query).then(comment => {
			if (comment) {
				writeClient
					.patch(comment._id)
					.set({ reactions: reactions })
					.commit()
					.then(() => {
						resolve(res.status(200).end());
					});
			} else {
				writeClient
					.create({
						_type: "commentReactions",
						commentId: _id,
						reactions: reactions,
					})
					.then(() => {
						resolve(res.status(200).end());
					});
			}
		});
	});
};
```

## Styling

As promised, here's some basic styling:
```css
.emoji {
	margin: 10px;
	font-size: 25px;
	display: flex;
	align-items: center;
	cursor: pointer;
	vertical-align: middle;
	transform: translateZ(0);
	box-shadow: 0 0 1px rgba(0, 0, 0, 0);
	backface-visibility: hidden;
	-moz-osx-font-smoothing: grayscale;
	transition-duration: 0.1s;
	transition-property: transform;
}

.reaction-div {
	margin-top: 5px;
	display: inline-flex;
	flex-flow: wrap;
}

.emoji-container {
	position: relative;
	user-select: none;
	display: flex;
}

.emoji-counter-div {
	position: absolute;
	top: -2px;
	right: 3px;
	z-index: -5;
}

.emoji-counter {
	font-weight: bold;
	padding: 2px 5px;
	border-radius: 30%;
	background-color: #f55742;
	color: #fefefe;
}
.emoji:hover,
emoji:focus,
emoji:active {
	transform: scale(1.1);
}

.comment-info {
	margin: auto 0px;
}

.comment-info-container {
	height: 40px;
	display: flex;
}

.reaction-block {
	display: inline-flex;
	flex-flow: wrap;
}

.reaction-adder-emoji {
	user-select: none;
	position: relative;
	display: inline-block;
}

.emoji-adder-menu-open {
	position: absolute;
	display: flex;
	top: 0px;
	left: 35px;
	border-radius: 10px;
	box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
	background-color: #fefefe;
	flex-wrap: wrap;
	z-index: 10;
	width: 400%;
}

.emoji-adder-menu-closed {
	display: none;
}
```

## Conclusion
This series is now finished. I hoped it was useful for someone and that everything was -mostly- clear.
If you have any doubts you can comment here or write me on my social media.

Full repo: [GitHub](https://github.com/PandaSekh/React-Commenting-System).
Demo [here](https://react-commenting-system.vercel.app/).