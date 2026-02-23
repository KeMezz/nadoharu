'use client';

import { useSignUpForm } from './useSignUpForm';

export function SignUpForm() {
  const { pending, error, handleSubmit } = useSignUpForm();

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
