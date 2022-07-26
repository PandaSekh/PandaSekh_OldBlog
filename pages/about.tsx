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
		I spend most of my time programming or reading. Other than that, I&apos;m passionate about:
	</p>
		<ul>
			<li>Gardening</li>
			<li>Writing</li>
			<li>Self-hosting (I have a server that I use for various stuff)</li>
			<li>Cryptocurrency/Blockchain Technology</li>
			<li>Drawing (still learning)</li>
		</ul>
	<p>
		On this blog I mostly write about programming stuff. On <a href="https://www.artedellalettura.it/">Arte della Lettura</a> I write about the books I read (in italian).
	</p>
    </div>
  );
}
