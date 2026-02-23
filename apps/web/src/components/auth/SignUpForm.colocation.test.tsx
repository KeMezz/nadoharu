import { fireEvent, render, screen } from '@testing-library/react';
import { SignUpForm } from './SignUpForm';

const mockUseSignUpForm = vi.fn();

vi.mock('./useSignUpForm', () => ({
  useSignUpForm: () => mockUseSignUpForm(),
}));

describe('SignUpForm colocation', () => {
  beforeEach(() => {
    mockUseSignUpForm.mockReset();
  });

  it('useSignUpForm 훅 상태를 화면에 반영한다', () => {
    mockUseSignUpForm.mockReturnValue({
      pending: true,
      error: '회원가입 실패',
      handleSubmit: vi.fn(),
    });

    render(<SignUpForm />);

    expect(screen.getByRole('button', { name: /가입 중/i })).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent('회원가입 실패');
  });

  it('form submit 시 useSignUpForm.handleSubmit을 호출한다', () => {
    const handleSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    });
    mockUseSignUpForm.mockReturnValue({
      pending: false,
      error: null,
      handleSubmit,
    });

    render(<SignUpForm />);

    const button = screen.getByRole('button', { name: '회원가입' });
    const form = button.closest('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});
