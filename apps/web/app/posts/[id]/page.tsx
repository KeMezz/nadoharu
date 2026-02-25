import { PostDetail } from './_components/PostDetail';

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  return <PostDetail postId={id} />;
}
