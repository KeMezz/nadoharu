'use client';

import Link from 'next/link';
import { PostsTimeline } from './PostsTimeline';

interface PostsPageContentProps {
  authenticated: boolean;
}

export function PostsPageContent({ authenticated }: PostsPageContentProps) {
  if (!authenticated) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-6 py-10">
        <section className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-sm font-semibold text-violet-600">모아보는</p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">
            로그인이 필요한 피드예요
          </h1>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
            친구들의 하루를 보려면 로그인해 주세요.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            로그인하러 가기
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-0 py-2">
      <PostsTimeline />
    </main>
  );
}
