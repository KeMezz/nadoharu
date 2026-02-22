import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignUpForm } from './SignUpForm';

const mockCreateUser = vi.fn();
const mockShowToast = vi.fn();

vi.mock('@/lib/graphql/auth', () => ({
  createUser: (...args: unknown[]) => mockCreateUser(...args),
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

describe('SignUpForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('accountId, password, email, name 입력 필드를 렌더링한다', () => {
    render(<SignUpForm />);

    expect(screen.getByLabelText(/아이디/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/닉네임/i)).toBeInTheDocument();
  });

  it('회원가입 제출 버튼을 렌더링한다', () => {
    render(<SignUpForm />);

    expect(
      screen.getByRole('button', { name: /회원가입/i }),
    ).toBeInTheDocument();
  });

  it('필수 입력이 비어있으면 요청을 전송하지 않는다', async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    await user.click(screen.getByRole('button', { name: /회원가입/i }));

    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it('유효한 입력으로 제출하면 createUser를 호출한다', async () => {
    const user = userEvent.setup();
    mockCreateUser.mockResolvedValue({
      data: {
        createUser: {
          id: '1',
          accountId: 'newuser',
          email: 'new@example.com',
          name: 'New',
        },
      },
    });
    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/아이디/i), 'newuser');
    await user.type(screen.getByLabelText(/비밀번호/i), 'Password1!');
    await user.type(screen.getByLabelText(/이메일/i), 'new@example.com');
    await user.type(screen.getByLabelText(/닉네임/i), 'New');
    await user.click(screen.getByRole('button', { name: /회원가입/i }));

    expect(mockCreateUser).toHaveBeenCalledWith({
      accountId: 'newuser',
      password: 'Password1!',
      email: 'new@example.com',
      name: 'New',
    });
  });

  it('제출 중에는 버튼이 비활성화된다', async () => {
    const user = userEvent.setup();
    let resolveCreate: (value: unknown) => void;
    mockCreateUser.mockReturnValue(
      new Promise((resolve) => {
        resolveCreate = resolve;
      }),
    );
    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/아이디/i), 'newuser');
    await user.type(screen.getByLabelText(/비밀번호/i), 'Password1!');
    await user.type(screen.getByLabelText(/이메일/i), 'new@example.com');
    await user.type(screen.getByLabelText(/닉네임/i), 'New');
    await user.click(screen.getByRole('button', { name: /회원가입/i }));

    expect(screen.getByRole('button')).toBeDisabled();

    await act(async () => {
      resolveCreate!({ data: { createUser: { id: '1' } } });
    });
  });

  it('회원가입 성공 시 /login으로 이동한다', async () => {
    const user = userEvent.setup();
    mockCreateUser.mockResolvedValue({
      data: {
        createUser: {
          id: '1',
          accountId: 'newuser',
          email: 'new@example.com',
          name: 'New',
        },
      },
    });
    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/아이디/i), 'newuser');
    await user.type(screen.getByLabelText(/비밀번호/i), 'Password1!');
    await user.type(screen.getByLabelText(/이메일/i), 'new@example.com');
    await user.type(screen.getByLabelText(/닉네임/i), 'New');
    await user.click(screen.getByRole('button', { name: /회원가입/i }));

    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
    expect(mockShowToast).toHaveBeenCalledWith(
      '회원가입이 완료되었습니다. 로그인해 주세요.',
      { tone: 'success' },
    );
  });

  it('회원가입 실패 시 에러 메시지를 표시하고 재입력 가능 상태를 유지한다', async () => {
    const user = userEvent.setup();
    mockCreateUser.mockResolvedValue({
      errors: [
        {
          message: 'ACCOUNT_ID_ALREADY_EXISTS',
          extensions: { code: 'ACCOUNT_ID_ALREADY_EXISTS' },
        },
      ],
    });
    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/아이디/i), 'existing');
    await user.type(screen.getByLabelText(/비밀번호/i), 'Password1!');
    await user.type(screen.getByLabelText(/이메일/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/닉네임/i), 'Name');
    await user.click(screen.getByRole('button', { name: /회원가입/i }));

    await vi.waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /회원가입/i })).toBeEnabled();
  });

  it('네트워크 오류 시 에러 메시지를 표시하고 pending을 해제한다', async () => {
    const user = userEvent.setup();
    mockCreateUser.mockRejectedValue(new Error('Network error'));
    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/아이디/i), 'newuser');
    await user.type(screen.getByLabelText(/비밀번호/i), 'Password1!');
    await user.type(screen.getByLabelText(/이메일/i), 'new@example.com');
    await user.type(screen.getByLabelText(/닉네임/i), 'New');
    await user.click(screen.getByRole('button', { name: /회원가입/i }));

    await vi.waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /회원가입/i })).toBeEnabled();
  });
});
