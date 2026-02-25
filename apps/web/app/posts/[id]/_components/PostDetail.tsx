'use client';

import Link from 'next/link';
import { usePostDetail } from './usePostDetail';

interface PostDetailProps {
  postId: string;
}

function formatDateTime(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return input;
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function PostDetail({ postId }: PostDetailProps) {
  const { post, loading, notFound, transientError, retry } =
    usePostDetail(postId);

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-6" aria-live="polite">
        <div className="h-44 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 text-center">
        <h1 className="text-lg font-bold">게시물을 찾을 수 없어요</h1>
        <Link
          href="/posts"
          className="mt-4 inline-flex rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          목록으로 이동
        </Link>
      </main>
    );
  }

  if (transientError) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 text-center">
        <h1 className="text-lg font-bold">상세 정보를 불러오지 못했어요</h1>
        <div className="mt-4 flex justify-center gap-2">
          <button
            type="button"
            onClick={retry}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
          >
            다시 시도
          </button>
          <Link
            href="/posts"
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            목록으로 이동
          </Link>
        </div>
      </main>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-4">
      <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <header className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
            {post.authorId.slice(0, 8)}
          </p>
          <p className="text-xs text-neutral-500">
            {formatDateTime(post.createdAt)}
          </p>
        </header>
        {post.imageUrls.length > 0 ? (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {post.imageUrls.map((url) => (
              <img
                key={url}
                src={url}
                alt="게시물 이미지"
                className="h-40 w-full rounded-xl object-cover"
              />
            ))}
          </div>
        ) : null}
        <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6">
          {post.content}
        </p>
        {post.subcontent ? (
          <p className="mt-2 whitespace-pre-wrap break-words text-sm text-neutral-500">
            {post.subcontent}
          </p>
        ) : null}
      </article>
      <div className="mt-4 flex items-center justify-between">
        <Link
          href="/posts"
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          목록으로 이동
        </Link>
        <Link
          href={`/posts/${post.id}/edit`}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          수정하기
        </Link>
      </div>
    </main>
  );
}
