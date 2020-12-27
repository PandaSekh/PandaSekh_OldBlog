---
title: Building a CMS for a Blog to Learn Spring and ReactJS [Part 1]
categories:
- Java
- Spring
- Javascript
- ReactJS
description: Why relaxing at home when you can learn new technologies?
layout: post
---

I recently had the pleasure to start learning ReactJS that, for those who don't know, is "*A JavaScript library for building user interfaces*". I spent a day reading the docs and trying their tutorials, but I don't quite like them and at the end of the day I still did not understand much.

So, I decided to start this wonderful project: building a CMS for a Blog. Why? Because It's a project which will test my abilities and maybe, but probably not, I will use it for my blog. 

I want to write about my project here, so that in 10 years I can come back and cringe at how bad of a programmer I was/am. So, in this first post we'll create da basic project structure and get a basic http request working. 

The project will be structured as such:
* The backend will be handled by a Spring Boot server on Heroku, which is free;
* The frontend will be a single-page made entirely in ReactJS and hosted on GitHub Pages, which is free too.

I won't bundle the frontend into the Spring Boot app as I tried for days to get It working but in the end I decided that in the end it wasn't worth the trouble. I'll keep them separate, which isn't great but this is a project made for learning, not to eradicate Wordpress.

That said, let's finally begin.

* hello
{:toc}

###  The Backend
We'll start with the backend. I decided to use Java and Spring Boot because that's what I know and use at work and so I thought It would be nice to improve my skills with it.
#### Basic Application Structure
At [start.spring.io](https://start.spring.io/) we can create our Spring Boot basic structure. I'm using Spring Boot 2.4.0, Maven and Java 8, as It's the default Java installed on Heroku and I don't need any of the features of newer Java versions. 
These are the dependencies that I decided to start with:
* Developer tools to make my life easier;
* Spring Web for the basic structure of the application;
* Rest Repositories to get an handful of HTTP methods already available (expecially for the Pagination);
* Spring Data JPA;
* PostgreSQL Driver, because it's Heroku's default.

![]({{ 'assets/img/building-a-cms-springboot-dependencies.jpg' | relative_url }})
