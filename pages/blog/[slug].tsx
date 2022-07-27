import { GetStaticPaths } from "next";
import { getPostContent, getPostSlugs } from "src/fileUtils";
import { serialize } from "next-mdx-remote/serialize";
import matter from "gray-matter";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import remarkSlug from "remark-slug";
import prism from 'remark-prism';
import { NextSeo } from "next-seo";
import { useRouter } from "next/dist/client/router";
import UnderPost from "@components//Post/Underpost";
import { getTimeToRead } from "src/utils";
import { useEffect, useState } from "react";
import TableOfContents from "@components//Post/TableOfContents";
import Link from "next/link";
import Image from "../../components/Post/Image";

const components = {
  TableOfContents: TableOfContents,
  Link: Link,
  Image: Image
};

export default function Page({source, frontMatter, ttr}: Props){
	const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  useEffect(() => setLoaded(true), [])

	return (
    <>
			<NextSeo 
				title={frontMatter.title}
				openGraph={{
				title: frontMatter.title,
				url: router.asPath,
				type: "article",
				article: {
					publishedTime: frontMatter.publishedDate,
					modifiedTime: frontMatter.publishedDate,
					authors: ["Alessio Franceschi"],
				},
				}}
			/>
			<article className="mx-auto">
				<h1 className="text-center text-4xl font-bold mb-2">{frontMatter.title}</h1>
				<UnderPost publishedDate={frontMatter.publishedDate} ttr={ttr}/>
        <div className="prose prose-lg mx-auto" >
					<MDXRemote {...source} components={components} />
          {loaded && (
            <script src="https://utteranc.es/client.js"
              //@ts-ignore
              repo="PandaSekh/PandaSekh"
              issue-term="url"
              label="💬 Comment"
              theme="github-light"
              crossOrigin="anonymous"
              async 
            />
          )}
        </div>
      </article>
      {/* Import the css like this because I only want to import it in posts and we can't make a css module file */}
      <style jsx global>
        {`
          h2, h3 {
            scroll-margin-top: 16px;
          }

          /* Safari-only */
          @supports (-webkit-hyphens:none) {
            h2, h3 {
                padding-top: 16px;
                margin-top: -16px;
            }
          }
          // https://raw.githubusercontent.com/PrismJS/prism-themes/master/themes/prism-vsc-dark-plus.css
          pre[class*="language-"],
          code[class*="language-"] {
            color: #d4d4d4;
            font-size: 13px;
            text-shadow: none;
            font-family: Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace;
            direction: ltr;
            text-align: left;
            white-space: pre;
            word-spacing: normal;
            word-break: normal;
            line-height: 1.5;
            -moz-tab-size: 4;
            -o-tab-size: 4;
            tab-size: 4;
            -webkit-hyphens: none;
            -moz-hyphens: none;
            -ms-hyphens: none;
            hyphens: none;
          }
          
          pre[class*="language-"]::selection,
          code[class*="language-"]::selection,
          pre[class*="language-"] *::selection,
          code[class*="language-"] *::selection {
            text-shadow: none;
            background: #264F78;
          }
          
          @media print {
            pre[class*="language-"],
            code[class*="language-"] {
              text-shadow: none;
            }
          }
          
          pre[class*="language-"] {
            padding: 1em;
            margin: .5em 0;
            overflow: auto;
            background: #1e1e1e;
          }
          
          :not(pre) > code[class*="language-"] {
            padding: .1em .3em;
            border-radius: .3em;
            color: #db4c69;
            background: #1e1e1e;
          }
          /*********************************************************
          * Tokens
          */
          .namespace {
            opacity: .7;
          }
          
          .token.doctype .token.doctype-tag {
            color: #569CD6;
          }
          
          .token.doctype .token.name {
            color: #9cdcfe;
          }
          
          .token.comment,
          .token.prolog {
            color: #6a9955;
          }
          
          .token.punctuation,
          .language-html .language-css .token.punctuation,
          .language-html .language-javascript .token.punctuation {
            color: #d4d4d4;
          }
          
          .token.property,
          .token.tag,
          .token.boolean,
          .token.number,
          .token.constant,
          .token.symbol,
          .token.inserted,
          .token.unit {
            color: #b5cea8;
          }
          
          .token.selector,
          .token.attr-name,
          .token.string,
          .token.char,
          .token.builtin,
          .token.deleted {
            color: #ce9178;
          }
          
          .language-css .token.string.url {
            text-decoration: underline;
          }
          
          .token.operator,
          .token.entity {
            color: #d4d4d4;
          }
          
          .token.operator.arrow {
            color: #569CD6;
          }
          
          .token.atrule {
            color: #ce9178;
          }
          
          .token.atrule .token.rule {
            color: #c586c0;
          }
          
          .token.atrule .token.url {
            color: #9cdcfe;
          }
          
          .token.atrule .token.url .token.function {
            color: #dcdcaa;
          }
          
          .token.atrule .token.url .token.punctuation {
            color: #d4d4d4;
          }
          
          .token.keyword {
            color: #569CD6;
          }
          
          .token.keyword.module,
          .token.keyword.control-flow {
            color: #c586c0;
          }
          
          .token.function,
          .token.function .token.maybe-class-name {
            color: #dcdcaa;
          }
          
          .token.regex {
            color: #d16969;
          }
          
          .token.important {
            color: #569cd6;
          }
          
          .token.italic {
            font-style: italic;
          }
          
          .token.constant {
            color: #9cdcfe;
          }
          
          .token.class-name,
          .token.maybe-class-name {
            color: #4ec9b0;
          }
          
          .token.console {
            color: #9cdcfe;
          }
          
          .token.parameter {
            color: #9cdcfe;
          }
          
          .token.interpolation {
            color: #9cdcfe;
          }
          
          .token.punctuation.interpolation-punctuation {
            color: #569cd6;
          }
          
          .token.boolean {
            color: #569cd6;
          }
          
          .token.property,
          .token.variable,
          .token.imports .token.maybe-class-name,
          .token.exports .token.maybe-class-name {
            color: #9cdcfe;
          }
          
          .token.selector {
            color: #d7ba7d;
          }
          
          .token.escape {
            color: #d7ba7d;
          }
          
          .token.tag {
            color: #569cd6;
          }
          
          .token.tag .token.punctuation {
            color: #808080;
          }
          
          .token.cdata {
            color: #808080;
          }
          
          .token.attr-name {
            color: #9cdcfe;
          }
          
          .token.attr-value,
          .token.attr-value .token.punctuation {
            color: #ce9178;
          }
          
          .token.attr-value .token.punctuation.attr-equals {
            color: #d4d4d4;
          }
          
          .token.entity {
            color: #569cd6;
          }
          
          .token.namespace {
            color: #4ec9b0;
          }
          /*********************************************************
          * Language Specific
          */
          
          pre[class*="language-javascript"],
          code[class*="language-javascript"],
          pre[class*="language-jsx"],
          code[class*="language-jsx"],
          pre[class*="language-typescript"],
          code[class*="language-typescript"],
          pre[class*="language-tsx"],
          code[class*="language-tsx"] {
            color: #9cdcfe;
          }
          
          pre[class*="language-css"],
          code[class*="language-css"] {
            color: #ce9178;
          }
          
          pre[class*="language-html"],
          code[class*="language-html"] {
            color: #d4d4d4;
          }
          
          .language-regex .token.anchor {
            color: #dcdcaa;
          }
          
          .language-html .token.punctuation {
            color: #808080;
          }
          /*********************************************************
          * Line highlighting
          */
          pre[class*="language-"] > code[class*="language-"] {
            position: relative;
            z-index: 1;
          }
          
          .line-highlight.line-highlight {
            background: #f7ebc6;
            box-shadow: inset 5px 0 0 #f7d87c;
            z-index: 0;
          }
	      `}
      </style>
		</>
	)
}

export async function getStaticProps({
  params,
}: {
  params: {
    slug: string;
  };
}): Promise<{ props: Props }> {
  const source = getPostContent(params.slug);

  const { content, data } = matter(source);
  const mdxSource = await serialize(content,
    // Optional parameters
    {
      // made available to the arguments of any custom mdx component
      scope: {},
      // MDX's available options at time of writing pulled directly from
      // https://github.com/mdx-js/mdx/blob/master/packages/mdx/index.js
      mdxOptions: {
        //@ts-ignore
        remarkPlugins: [remarkSlug, prism],
        rehypePlugins: []
      },
    });

	const timeToRead = getTimeToRead(source.toString());
  return {
    props: {
      source: mdxSource,
      frontMatter: data,
	    ttr: timeToRead,
    },
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = getPostSlugs();

  return {
    paths: slugs.map(slug => {return { params: { slug: slug } } }),
    fallback: false,
  };
};

interface Props {
  source: MDXRemoteSerializeResult;
  frontMatter: {
    [key: string]: string;
  };
  ttr: string
}