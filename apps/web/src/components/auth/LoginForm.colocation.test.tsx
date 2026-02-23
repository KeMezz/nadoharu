import { fireEvent, render, screen } from '@testing-library/react';
import { LoginForm } from './LoginForm';

const mockUseLoginForm = vi.fn();

vi.mock('./useLoginForm', () => ({
  useLoginForm: () => mockUseLoginForm(),
}));

describe('LoginForm colocation', () => {
  beforeEach(() => {
    mockUseLoginForm.mockReset();
  });

  it('useLoginForm 훅 상태를 화면에 반영한다', () => {
    mockUseLoginForm.mockReturnValue({
      pending: true,
      error: '로그인 실패',
      handleSubmit: vi.fn(),
    });

    render(<LoginForm />);

    expect(screen.getByRole('button', { name: /로그인 중/i })).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent('로그인 실패');
  });

  it('form submit 시 useLoginForm.handleSubmit을 호출한다', () => {
    const handleSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    });
    mockUseLoginForm.mockReturnValue({
      pending: false,
      error: null,
      handleSubmit,
    });

    render(<LoginForm />);

    const button = screen.getByRole('button', { name: '로그인' });
    const form = button.closest('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});
