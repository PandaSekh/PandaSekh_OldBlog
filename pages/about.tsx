import { NextSeo } from "next-seo";

export default function About(): JSX.Element {
  return (
    <div className="prose prose-lg mx-auto">
	<NextSeo 
		title="About"
		openGraph={{
			title: "About",
			url: "/about",
			type: "website",
		}}
	/>
	<h2>About</h2>
	<p>
		I spend most of my time programming and reading. Other than that, I'm passionate about:
	</p>
		<ul>
			<li>Writing</li>
			<li>Self-hosting (I have a server that I use for various stuff)</li>
			<li>Cryptocurrency/Blockchain Technology</li>
		</ul>
	<p>
		On this blog I mostly write about programming stuff. On <a href="https://www.artedellalettura.it/">Arte della Lettura</a> I write about the books I read (in italian).
	</p>
    </div>
  );
}