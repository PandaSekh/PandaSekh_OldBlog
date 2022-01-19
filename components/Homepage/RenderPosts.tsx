import { HomepagePost } from "src/fileUtils";
import { stringToDate } from "src/utils";
import Link from "next/link"

export default function RenderPosts({
  posts,
}: {
  posts: HomepagePost[];
}): JSX.Element {
  return (
    <div className="flex flex-col items-start justify-center mx-auto text-left max-w-2xl">
	<h2 className="text-3xl font-light place-self-center mb-3">Blog</h2>
	{posts.map((post, i) => (
        <Link key={post.title} passHref href={post.url}>
			<a className="my-2">
				<h3 className="font-semibold text-2xl hover:underline">{post.title}</h3>
				<div className="flex flex-row gap-x-2 items-start  text-gray text-lg mb-2">
					<span>{stringToDate(post.publishedDate)}</span>
					-
					<span>{post.readtime}</span>
				</div>
			</a>
        </Link>
      ))}
    </div>
  );
}