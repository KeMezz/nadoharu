import Link from 'next/link';
import { SignUpForm } from '@/components/auth/SignUpForm';

export default function SignUpPage() {
  return (
    <main className="max-w-2xl mx-auto">
      <div className="flex p-8 my-10">
        <h1 className="text-4xl font-bold leading-snug">
          <b className="text-violet-600">나</b>도
          <br />
          <b className="text-violet-600">하</b>루
          <br />
          회원가입
        </h1>
      </div>
      <SignUpForm />
      <div className="px-8 pb-8">
        <p className="text-sm text-neutral-500 dark:text-neutral-300">
          이미 나도하루 계정이 있으신가요?{' '}
          <Link href="/login" className="underline text-violet-600">
            로그인 하기
          </Link>
        </p>
      </div>
    </main>
  );
}
