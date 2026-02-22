'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';

export default function MePage() {
  return (
    <AuthGuard>
      <main className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">내 프로필</h1>
        <p className="text-neutral-500">프로필 페이지입니다.</p>
        <form action="/api/auth/logout" method="get" className="mt-6">
          <button
            type="submit"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800"
          >
            로그아웃
          </button>
        </form>
      </main>
    </AuthGuard>
  );
}
