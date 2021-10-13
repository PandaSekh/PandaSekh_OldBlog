---
title: My First Game Jam Post-Mortem
layout: post
categories: [Unity, C#, Game Design]
description: "A Post-Mortem analysis on my first game jam experience."
---

Few years ago I partecipated in the Ludum Dare Game Jam for the first (and only) time. I wanted to learn some game development and after discovering the concept of Game Jam I thought it would be a good goal to achieve. I had one month before Ludum Dare 46 started.
In this post I'd like to do an analysis of the mistakes I made developing my first "game".

Github Repo: [Link](https://github.com/PandaSekh/LudumDare_46)
Play online: [Link](https://pandasekh.itch.io/the-flame-of-life)

## What's a Game Jam?
[Wikipedia](https://en.wikipedia.org/wiki/Game_jam) has a great explanation:
*A **game jam** is a contest where participants try to make a [video game](https://en.wikipedia.org/wiki/Video_game "Video game") from scratch. Depending on the format, participants might work independently, or in teams. The contest duration usually ranges from 24 to 72 hours.*

Rules vary depending on the actual contest. In Ludum Dare, a theme is chosen by vote and participants have 72 hours to submit the game. 
The theme for Ludum Dare 46 was "Keep it alive".

## Code, Art, Sound, Music
If you want to partecipate in a game jam without a team it might be hard to do all the above yourself. I can code and I enjoy it, but I dread anything artistic. Luckily, you can use assets created by other people (of course only if the game jam and the original author allows it), and I suggest that you take advantage of that. 
At first I tried to create my own assets, but It's really hard and time consuming creating original music for a game if you have no idea what you're doing.
Luckily I didn't waste too much time and after a few hours of trying I gave up creating my own assets and just used something already done by others. It's not a bad thing to use something created by someone else.

Suggestion: Don't be afraid to use assets created by others (if they allow it).

## Make It Enjoyable
Before even knowing the theme, I knew I wanted to create a game with an high level of difficulty. 
I don't know why, but I love to create hard games (I previusly did some basic level design on other games and I loved to make my levels as hard as possible).
Problem is, in a game jam games are evaluated by other participants, so it wasn't a great idea to make a game so difficult that only a fraction of the players would enjoy it.
Also, making hard games is... hard. You need to correctly balance the game so that it's difficult, but not unfair. You have to give the chance to players to learn it and beat it with ease, you can't just massacre them in the tutorial level.
Well, I didn't think too much about that. In my game the flame of your torch fades with time and if it goes off you're dead. In the first level I put some text to create a basic story and to do a quick tutorial.
Unfortunately, I didn't test it by actually reading and comprehending the texts, because I already knew what I wrote, so It didn't came to mind that I should've stopped the flame fading during that first tutorial. Basically players would die while reading why they were dying. Not a great game design.

Suggestion: Make sure that your game is enjoyable.