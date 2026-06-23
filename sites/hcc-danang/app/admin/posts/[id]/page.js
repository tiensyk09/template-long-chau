'use client';
import { PostEditor } from '../new/page';
import { use } from 'react';

export default function EditPostPage({ params }) {
  const { id } = use(params);
  return <PostEditor isNew={false} postId={id} />;
}
