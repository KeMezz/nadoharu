import { EditPostForm } from './_components/EditPostForm';

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  return <EditPostForm postId={id} />;
}
