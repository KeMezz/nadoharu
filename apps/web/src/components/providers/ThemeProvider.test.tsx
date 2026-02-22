import { render } from '@testing-library/react';
import { ThemeProvider } from './ThemeProvider';

describe('ThemeProvider', () => {
  let matchMediaListeners: Array<(e: { matches: boolean }) => void>;

  beforeEach(() => {
    matchMediaListeners = [];
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)' ? false : false,
        media: query,
        addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => {
          matchMediaListeners.push(cb);
        },
        removeEventListener: vi.fn(),
      })),
    });
  });

  it('라이트 모드에서 theme-color를 #ffffff로 설정한다', () => {
    render(
      <ThemeProvider>
        <div>child</div>
      </ThemeProvider>,
    );

    const meta = document.querySelector('meta[name="theme-color"]');
    expect(meta?.getAttribute('content')).toBe('#ffffff');
  });

  it('다크 모드에서 theme-color를 #000000으로 설정한다', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });

    render(
      <ThemeProvider>
        <div>child</div>
      </ThemeProvider>,
    );

    const meta = document.querySelector('meta[name="theme-color"]');
    expect(meta?.getAttribute('content')).toBe('#000000');
  });

  it('자식 컴포넌트를 렌더링한다', () => {
    const { getByText } = render(
      <ThemeProvider>
        <div>테스트 콘텐츠</div>
      </ThemeProvider>,
    );

    expect(getByText('테스트 콘텐츠')).toBeInTheDocument();
  });
});
