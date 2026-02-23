'use client';

import { useEffect, useState } from 'react';
import { checkAuthStatus } from './checkAuthStatus';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus().then((status) => {
      if (status.authenticated) {
        setLoading(false);
      } else {
        window.location.href = '/api/auth/logout';
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-neutral-500">로딩 중...</p>
      </div>
    );
  }

  return <>{children}</>;
}
