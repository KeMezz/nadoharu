import { render, screen } from '@testing-library/react';
import { AuthGuard } from './AuthGuard';

const mockCheckAuthStatus = vi.fn();

vi.mock('@/lib/auth-session', () => ({
  checkAuthStatus: () => mockCheckAuthStatus(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('AuthGuard', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, href: '' },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
  });

  it('인증 확인 중 로딩 UI를 표시한다', () => {
    mockCheckAuthStatus.mockReturnValue(new Promise(() => {}));
    render(
      <AuthGuard>
        <div>보호된 콘텐츠</div>
      </AuthGuard>,
    );

    expect(screen.getByText(/로딩/i)).toBeInTheDocument();
    expect(screen.queryByText('보호된 콘텐츠')).not.toBeInTheDocument();
  });

  it('인증 성공 시 자식 컴포넌트를 렌더링한다', async () => {
    mockCheckAuthStatus.mockResolvedValue({
      authenticated: true,
      user: { id: '1', accountId: 'testuser', email: 'test@example.com', name: 'Test' },
    });
    render(
      <AuthGuard>
        <div>보호된 콘텐츠</div>
      </AuthGuard>,
    );

    await vi.waitFor(() => {
      expect(screen.getByText('보호된 콘텐츠')).toBeInTheDocument();
    });
  });

  it('인증 실패 시 쿠키 클리어 경유로 /login으로 리다이렉트한다', async () => {
    mockCheckAuthStatus.mockResolvedValue({ authenticated: false, user: null });
    render(
      <AuthGuard>
        <div>보호된 콘텐츠</div>
      </AuthGuard>,
    );

    await vi.waitFor(() => {
      expect(window.location.href).toBe('/api/auth/logout');
    });
  });
});
