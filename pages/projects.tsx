import { NextSeo } from "next-seo";

export default function Projects(): JSX.Element {
  return (
    <div className="prose prose-lg mx-auto">
	<NextSeo 
		title="Projects"
		openGraph={{
			title: "Projects",
			url: "/projects",
			type: "website",
		}}
	/>
     <h2>Projects</h2>
	 <p>
		All of my projects are publicy available on my <a href="https://github.com/PandaSekh">Github Page</a>.    

		Below a showcase of some of them.
	 </p>
	 <p className="italic">Work in Progress</p>
    </div>
  );
}