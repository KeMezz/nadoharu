'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchPostDetail } from './post.query';
import type { PostDetailQuery } from './post.generated';

type PostDetailItem = NonNullable<PostDetailQuery['post']>;

interface UsePostDetailResult {
  post: PostDetailItem | null;
  loading: boolean;
  notFound: boolean;
  transientError: boolean;
  retry: () => Promise<void>;
}

export function usePostDetail(postId: string): UsePostDetailResult {
  const [post, setPost] = useState<PostDetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [transientError, setTransientError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setTransientError(false);
    setNotFound(false);

    try {
      const response = await fetchPostDetail({ id: postId });

      if (response.errors && response.errors.length > 0) {
        setPost(null);
        setTransientError(true);
        return;
      }

      if (response.data?.post) {
        setPost(response.data.post);
        return;
      }

      setPost(null);
      setNotFound(true);
    } catch {
      setPost(null);
      setTransientError(true);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    void load();
  }, [load]);

  return useMemo(
    () => ({
      post,
      loading,
      notFound,
      transientError,
      retry: load,
    }),
    [load, loading, notFound, post, transientError],
  );
}
