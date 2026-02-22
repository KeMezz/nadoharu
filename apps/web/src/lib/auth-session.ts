import { fetchMe } from '@/lib/graphql/auth';
import type { User } from '@/lib/graphql/types';

export interface AuthStatus {
  authenticated: boolean;
  user: User | null;
}

export async function checkAuthStatus(): Promise<AuthStatus> {
  try {
    const result = await fetchMe();
    if (result.data?.me) {
      return { authenticated: true, user: result.data.me };
    }
    return { authenticated: false, user: null };
  } catch {
    return { authenticated: false, user: null };
  }
}
