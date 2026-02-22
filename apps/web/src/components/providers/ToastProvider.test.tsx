import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from './ToastProvider';

function ToastTriggerButton() {
  const { showToast } = useToast();

  return (
    <button
      type="button"
      onClick={() =>
        showToast('테스트 토스트', {
          tone: 'success',
          duration: 1000,
        })
      }
    >
      토스트 표시
    </button>
  );
}

describe('ToastProvider', () => {
  it('showToast를 호출하면 하단에 토스트를 렌더링한다', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <ToastTriggerButton />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: '토스트 표시' }));

    expect(screen.getByRole('status')).toHaveTextContent('테스트 토스트');
  });

  it('duration이 지나면 토스트가 자동으로 사라진다', async () => {
    vi.useFakeTimers();

    render(
      <ToastProvider>
        <ToastTriggerButton />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: '토스트 표시' }));
    expect(screen.getByRole('status')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
