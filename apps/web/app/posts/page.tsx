import { cookies } from 'next/headers';
import { PostsPageContent } from './_components/PostsPageContent';

export default async function PostsPage() {
  const cookieStore = await cookies();
  const authenticated = cookieStore.has('accessToken');

  return <PostsPageContent authenticated={authenticated} />;
}
