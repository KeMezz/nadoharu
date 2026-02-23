import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { login } from './login.mutation';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { useToast } from '@/components/providers/ToastProvider';

interface UseLoginFormResult {
  pending: boolean;
  error: string | null;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

export function useLoginForm(): UseLoginFormResult {
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

    if (!accountId || !password) {
      return;
    }

    setPending(true);
    try {
      const result = await login({ accountId, password });

      if (result.data?.login) {
        showToast('로그인되었습니다.', { tone: 'success' });
        router.push('/me');
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
