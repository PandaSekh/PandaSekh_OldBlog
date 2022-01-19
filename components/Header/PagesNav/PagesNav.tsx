import webconfig from "website.config";
import Link from "next/link";

export default function PagesNav(){
	const pages = webconfig.pages.map(page => <Link passHref href={page.url} key={page.url}><a className="text-xl text-gray hover:text-black hover:underline">{page.title}</a></Link>);
	return (
		<nav className="flex flex-row space-x-2">{pages}</nav>
	)
}