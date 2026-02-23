import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SocialLoginButtons } from './SocialLoginButtons';

describe('SocialLoginButtons', () => {
  it('Apple, Kakao, GitHub 버튼을 렌더링한다', () => {
    render(<SocialLoginButtons />);

    expect(screen.getByLabelText(/Apple/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Kakao/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/GitHub/i)).toBeInTheDocument();
  });

  it('모든 소셜 버튼이 비활성 상태이다', () => {
    render(<SocialLoginButtons />);

    const buttons = screen.getAllByRole('button');
    for (const button of buttons) {
      expect(button).toBeDisabled();
    }
  });

  it('버튼에 "준비 중" 안내가 포함되어 있다', () => {
    render(<SocialLoginButtons />);

    expect(screen.getByLabelText(/Apple.*준비 중/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Kakao.*준비 중/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/GitHub.*준비 중/i)).toBeInTheDocument();
  });

  it('소셜 버튼 클릭 시 OAuth 요청이 발생하지 않는다', async () => {
    const user = userEvent.setup();
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn();

    render(<SocialLoginButtons />);

    const buttons = screen.getAllByRole('button');
    for (const button of buttons) {
      await user.click(button).catch(() => {});
    }

    expect(globalThis.fetch).not.toHaveBeenCalled();
    globalThis.fetch = originalFetch;
  });
});
