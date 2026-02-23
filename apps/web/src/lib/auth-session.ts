import { fetchMe } from '@/lib/graphql/auth';
import type { MeQuery } from '@/lib/graphql/generated';

type AuthenticatedUser = NonNullable<MeQuery['me']>;

export interface AuthStatus {
  authenticated: boolean;
  user: AuthenticatedUser | null;
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
