import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { getTimeToRead } from "./utils";

const POSTS_PATH = path.join(process.cwd(), "posts");

export function getPostPaths(): string[] {
    return fs
      .readdirSync(POSTS_PATH)
      .filter((filePath) => new RegExp(/\.mdx?$/, "ig").test(filePath));
}

export function getPostSlugs(): string[]{
	return getPostPaths().map((postPath) => postPath.replace(new RegExp(/\.mdx?$/, "ig"), ""))
}

export function getPostContent(slug: string): Buffer {
	const postFilePath = path.join(POSTS_PATH, `${slug}.mdx`);
	return fs.readFileSync(postFilePath);
}

export function getHomepagePosts(): Array<HomepagePost>{
	return getPostPaths()
      .map((filePath) => {
        const source = fs.readFileSync(path.join(POSTS_PATH, filePath));
        const { data } = matter(source);

        return {
          title: data.title,
		  publishedDate: data.publishedDate,
		  url: `/blog/${filePath.replace(new RegExp(/\.mdx?$/, "ig"), "")}`,
		  readtime: getTimeToRead(source.toString())
        };
      })
      .filter((post) => post)
      .sort(
        (a: HomepagePost, b: HomepagePost) =>
          getDateFromStringDDMMYYYY(b.publishedDate).getTime() -
          getDateFromStringDDMMYYYY(a.publishedDate).getTime()
      );
}

function getDateFromStringDDMMYYYY(date: string): Date {
	const parts = date.split("-");
  	return new Date(`${parts[1]}-${parts[0]}-${parts[2]}`);
}

export interface HomepagePost {
	title: string,
	publishedDate: string,
	readtime: string,
	url: string
}