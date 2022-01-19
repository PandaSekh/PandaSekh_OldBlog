import RenderPosts from '@components//Homepage/RenderPosts';
import { GetStaticProps } from 'next';
import { getHomepagePosts, HomepagePost } from 'src/fileUtils';

export default function Index({
  posts,
}: {
  posts: HomepagePost[];
}): JSX.Element {
  return (
    <>
      <RenderPosts posts={posts} />
    </>
  );
}
export const getStaticProps: GetStaticProps = async () => {
  const posts = getHomepagePosts();
  return { props: { posts } };
};