import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';

export default function LoginPage() {
  return (
    <main className="max-w-2xl mx-auto">
      <div className="flex p-8 my-10">
        <h1 className="text-4xl font-bold leading-snug">
          <b className="text-violet-600">나</b>도
          <br />
          <b className="text-violet-600">하</b>루
          <br />
          로그인
        </h1>
      </div>
      <LoginForm />
      <div className="px-8 pb-8">
        <p className="text-sm text-neutral-500 dark:text-neutral-300">
          아직 나도하루 계정이 없나요?{' '}
          <Link href="/sign-up" className="underline text-violet-600">
            회원가입 하기
          </Link>
        </p>
      </div>
      <div className="flex gap-8 pt-8 justify-center">
        <SocialLoginButtons />
      </div>
    </main>
  );
}
