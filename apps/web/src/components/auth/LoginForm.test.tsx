import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

const mockLogin = vi.fn();
const mockShowToast = vi.fn();

vi.mock('@/lib/graphql/auth', () => ({
  login: (...args: unknown[]) => mockLogin(...args),
}));

vi.mock('@/components/providers/ToastProvider', () => ({
  useToast: () => ({
    showToast: (...args: unknown[]) => mockShowToast(...args),
    hideToast: vi.fn(),
  }),
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('accountId와 password 입력 필드를 렌더링한다', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/아이디/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument();
  });

  it('로그인 제출 버튼을 렌더링한다', () => {
    render(<LoginForm />);

    expect(screen.getByRole('button', { name: /로그인/i })).toBeInTheDocument();
  });

  it('필수 입력이 비어있으면 요청을 전송하지 않는다', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole('button', { name: /로그인/i }));

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('올바른 입력으로 제출하면 login을 호출한다', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({
      data: {
        login: {
          user: {
            id: '1',
            accountId: 'testuser',
            email: 'test@example.com',
            name: 'Test',
          },
        },
      },
    });
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/아이디/i), 'testuser');
    await user.type(screen.getByLabelText(/비밀번호/i), 'Password1!');
    await user.click(screen.getByRole('button', { name: /로그인/i }));

    expect(mockLogin).toHaveBeenCalledWith({
      accountId: 'testuser',
      password: 'Password1!',
    });
  });

  it('제출 중에는 버튼이 비활성화되고 pending 상태를 표시한다', async () => {
    const user = userEvent.setup();
    let resolveLogin: (value: unknown) => void;
    mockLogin.mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = resolve;
      }),
    );
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/아이디/i), 'testuser');
    await user.type(screen.getByLabelText(/비밀번호/i), 'Password1!');
    await user.click(screen.getByRole('button', { name: /로그인/i }));

    expect(screen.getByRole('button', { name: /로그인 중/i })).toBeDisabled();

    await act(async () => {
      resolveLogin!({ data: { login: { user: { id: '1' } } } });
    });
  });

  it('로그인 성공 시 /me로 이동한다', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({
      data: {
        login: {
          user: {
            id: '1',
            accountId: 'testuser',
            email: 'test@example.com',
            name: 'Test',
          },
        },
      },
    });
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/아이디/i), 'testuser');
    await user.type(screen.getByLabelText(/비밀번호/i), 'Password1!');
    await user.click(screen.getByRole('button', { name: /로그인/i }));

    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/me');
    });
    expect(mockShowToast).toHaveBeenCalledWith('로그인되었습니다.', {
      tone: 'success',
    });
  });

  it('로그인 실패 시 에러 메시지를 표시하고 재입력 가능 상태를 유지한다', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({
      errors: [
        {
          message: 'INVALID_CREDENTIALS',
          extensions: { code: 'INVALID_CREDENTIALS' },
        },
      ],
    });
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/아이디/i), 'testuser');
    await user.type(screen.getByLabelText(/비밀번호/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /로그인/i }));

    await vi.waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /로그인/i })).toBeEnabled();
  });

  it('네트워크 오류 시 에러 메시지를 표시하고 pending을 해제한다', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValue(new Error('Network error'));
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/아이디/i), 'testuser');
    await user.type(screen.getByLabelText(/비밀번호/i), 'Password1!');
    await user.click(screen.getByRole('button', { name: /로그인/i }));

    await vi.waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /로그인/i })).toBeEnabled();
  });
});
