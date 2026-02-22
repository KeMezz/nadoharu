'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUser } from '@/lib/graphql/auth';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { useToast } from '@/components/providers/ToastProvider';

export function SignUpForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const accountId = (formData.get('accountId') as string).trim();
    const password = formData.get('password') as string;
    const email = (formData.get('email') as string).trim();
    const name = (formData.get('name') as string).trim();

    if (!accountId || !password || !email || !name) return;

    setPending(true);
    try {
      const result = await createUser({ accountId, password, email, name });

      if (result.data?.createUser) {
        showToast('회원가입이 완료되었습니다. 로그인해 주세요.', {
          tone: 'success',
        });
        router.push('/login');
        return;
      }
      const code = result.errors?.[0]?.extensions?.code;
      setError(getAuthErrorMessage(code));
    } catch {
      setError(getAuthErrorMessage());
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-8">
      <div>
        <label htmlFor="accountId" className="block text-sm font-medium mb-1">
          아이디
        </label>
        <input
          id="accountId"
          name="accountId"
          type="text"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
          placeholder="아이디"
          className="w-full border border-neutral-300 rounded-md px-4 py-2 placeholder-neutral-400 outline-none focus:ring-2 focus:ring-violet-600 focus:border-violet-600 dark:bg-neutral-700 dark:text-white dark:border-neutral-600"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="비밀번호"
          className="w-full border border-neutral-300 rounded-md px-4 py-2 placeholder-neutral-400 outline-none focus:ring-2 focus:ring-violet-600 focus:border-violet-600 dark:bg-neutral-700 dark:text-white dark:border-neutral-600"
        />
      </div>
      <hr className="my-3 border-neutral-200 dark:border-neutral-600" />
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          복구용 이메일
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="복구용 이메일"
          className="w-full border border-neutral-300 rounded-md px-4 py-2 placeholder-neutral-400 outline-none focus:ring-2 focus:ring-violet-600 focus:border-violet-600 dark:bg-neutral-700 dark:text-white dark:border-neutral-600"
        />
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          닉네임
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="닉네임"
          className="w-full border border-neutral-300 rounded-md px-4 py-2 placeholder-neutral-400 outline-none focus:ring-2 focus:ring-violet-600 focus:border-violet-600 dark:bg-neutral-700 dark:text-white dark:border-neutral-600"
        />
        <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
          다른 이용자에게 불쾌감을 줄 수 있는 별명은 삼가주세요!
        </p>
      </div>
      {error && (
        <p role="alert" className="text-sm text-rose-600 font-medium">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full py-2 rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:ring-2 focus:ring-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {pending ? '가입 중...' : '회원가입'}
      </button>
    </form>
  );
}
