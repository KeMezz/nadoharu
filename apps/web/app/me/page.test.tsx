import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import MePage from './page';

vi.mock('./_components/AuthGuard', () => ({
  AuthGuard: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

describe('내 프로필 페이지', () => {
  it('로그아웃 버튼을 렌더링한다', () => {
    render(<MePage />);

    const logoutButton = screen.getByRole('button', { name: '로그아웃' });
    expect(logoutButton).toBeInTheDocument();

    const form = logoutButton.closest('form');
    expect(form).not.toBeNull();
    expect(form).toHaveAttribute('action', '/api/auth/logout');
    expect(form).toHaveAttribute('method', 'get');
  });
});
