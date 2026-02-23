import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createUser } from './createUser.mutation';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { useToast } from '@/components/providers/ToastProvider';

interface UseSignUpFormResult {
  pending: boolean;
  error: string | null;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

export function useSignUpForm(): UseSignUpFormResult {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const accountId = (formData.get('accountId') as string).trim();
    const password = formData.get('password') as string;
    const email = (formData.get('email') as string).trim();
    const name = (formData.get('name') as string).trim();

    if (!accountId || !password || !email || !name) {
      return;
    }

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

  return {
    pending,
    error,
    handleSubmit,
  };
}
