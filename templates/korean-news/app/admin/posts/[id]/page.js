'use client';
import { PostEditor } from '../new/page';
import { useParams } from 'next/navigation';

export default function EditPostPage() {
  const params = useParams();
  return <PostEditor isNew={false} postId={params.id} />;
}
