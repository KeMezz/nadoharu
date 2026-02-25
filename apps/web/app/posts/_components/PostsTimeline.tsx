'use client';

import Link from 'next/link';
import { usePostsTimeline } from './usePostsTimeline';

function formatDateTime(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return input;
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function PostsTimeline() {
  const {
    posts,
    isInitialLoading,
    isLoadingMore,
    initialError,
    loadMoreError,
    hasNextPage,
    sentinelRef,
    retryInitial,
    retryLoadMore,
  } = usePostsTimeline();

  if (isInitialLoading) {
    return (
      <section className="space-y-3 px-4 py-4" aria-live="polite">
        <div className="h-28 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-28 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
      </section>
    );
  }

  if (initialError) {
    return (
      <section className="px-4 py-10 text-center">
        <p className="text-sm font-semibold text-rose-600">
          목록을 불러오지 못했어요.
        </p>
        <button
          type="button"
          onClick={retryInitial}
          className="mt-3 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          다시 시도
        </button>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="px-4 py-12 text-center">
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          아직 등록된 게시물이 없어요.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3 px-4 py-4">
      {posts.map((post) => (
        <article
          key={post.id}
          className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
              {post.authorId.slice(0, 8)}
            </p>
            <p className="text-xs text-neutral-500">
              {formatDateTime(post.createdAt)}
            </p>
          </div>
          {post.imageUrls.length > 0 ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {post.imageUrls.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt="게시물 이미지"
                  className="h-36 w-full rounded-xl object-cover"
                />
              ))}
            </div>
          ) : null}
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">
            {post.content}
          </p>
          {post.subcontent ? (
            <p className="mt-2 whitespace-pre-wrap break-words text-sm text-neutral-500">
              {post.subcontent}
            </p>
          ) : null}
          <Link
            href={`/posts/${post.id}`}
            className="mt-4 inline-flex text-sm font-semibold text-violet-600 hover:text-violet-700"
          >
            자세히 보기
          </Link>
        </article>
      ))}

      {loadMoreError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm dark:border-rose-900/70 dark:bg-rose-950/40">
          <p className="font-medium text-rose-700 dark:text-rose-300">
            다음 게시물을 불러오지 못했어요.
          </p>
          <button
            type="button"
            onClick={retryLoadMore}
            className="mt-2 rounded-md border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-900/30"
          >
            다시 시도
          </button>
        </div>
      ) : null}

      {hasNextPage ? (
        <div
          ref={sentinelRef}
          className="flex h-12 items-center justify-center"
          aria-hidden="true"
        >
          {isLoadingMore ? (
            <span className="text-xs text-neutral-500">불러오는 중...</span>
          ) : (
            <span className="text-xs text-neutral-400">
              아래로 스크롤해 더 보기
            </span>
          )}
        </div>
      ) : (
        <p className="py-3 text-center text-xs text-neutral-400">
          마지막 게시물까지 모두 확인했어요.
        </p>
      )}
    </section>
  );
}
