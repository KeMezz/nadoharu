'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchPostsTimeline } from './posts.query';
import type { PostsTimelineQuery } from './posts.generated';

type TimelinePost = PostsTimelineQuery['posts']['edges'][number]['node'];

const INITIAL_PAGE_SIZE = 10;

interface UsePostsTimelineResult {
  posts: TimelinePost[];
  isInitialLoading: boolean;
  isLoadingMore: boolean;
  initialError: string | null;
  loadMoreError: string | null;
  hasNextPage: boolean;
  sentinelRef: (node: HTMLDivElement | null) => void;
  retryInitial: () => Promise<void>;
  retryLoadMore: () => Promise<void>;
}

function toMessage(): string {
  return 'NETWORK_ERROR';
}

export function usePostsTimeline(): UsePostsTimelineResult {
  const [posts, setPosts] = useState<TimelinePost[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [initialError, setInitialError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const lockRef = useRef(false);

  const applyPage = useCallback(
    (data: PostsTimelineQuery, append: boolean) => {
      const nextPosts = data.posts.edges.map((edge) => edge.node);
      setPosts((prev) => (append ? [...prev, ...nextPosts] : nextPosts));
      setEndCursor(data.posts.pageInfo.endCursor ?? null);
      setHasNextPage(data.posts.pageInfo.hasNextPage);
    },
    [setPosts],
  );

  const loadInitial = useCallback(async () => {
    setInitialError(null);
    setLoadMoreError(null);
    setIsInitialLoading(true);

    try {
      const response = await fetchPostsTimeline({
        first: INITIAL_PAGE_SIZE,
        after: null,
      });

      if (response.data?.posts) {
        applyPage(response.data, false);
        return;
      }

      setInitialError(toMessage());
    } catch {
      setInitialError(toMessage());
    } finally {
      setIsInitialLoading(false);
    }
  }, [applyPage]);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || !endCursor || lockRef.current) {
      return;
    }

    lockRef.current = true;
    setIsLoadingMore(true);
    setLoadMoreError(null);
    try {
      const response = await fetchPostsTimeline({
        first: INITIAL_PAGE_SIZE,
        after: endCursor,
      });

      if (response.data?.posts) {
        applyPage(response.data, true);
        return;
      }

      setLoadMoreError(toMessage());
    } catch {
      setLoadMoreError(toMessage());
    } finally {
      setIsLoadingMore(false);
      lockRef.current = false;
    }
  }, [applyPage, endCursor, hasNextPage]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node) {
        return;
      }

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore();
        }
      });
      observerRef.current.observe(node);
    },
    [loadMore],
  );

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return useMemo(
    () => ({
      posts,
      isInitialLoading,
      isLoadingMore,
      initialError,
      loadMoreError,
      hasNextPage,
      sentinelRef,
      retryInitial: loadInitial,
      retryLoadMore: loadMore,
    }),
    [
      hasNextPage,
      initialError,
      isInitialLoading,
      isLoadingMore,
      loadInitial,
      loadMore,
      loadMoreError,
      posts,
      sentinelRef,
    ],
  );
}
