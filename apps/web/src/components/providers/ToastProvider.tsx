'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type ToastTone = 'success' | 'error';

interface ShowToastOptions {
  tone?: ToastTone;
  duration?: number;
}

interface ToastState {
  message: string;
  tone: ToastTone;
  duration: number;
}

interface ToastContextValue {
  showToast: (message: string, options?: ShowToastOptions) => void;
  hideToast: () => void;
}

const DEFAULT_TOAST_DURATION_MS = 2600;
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const showToast = useCallback(
    (message: string, options?: ShowToastOptions) => {
      const trimmedMessage = message.trim();
      if (!trimmedMessage) return;

      setToast({
        message: trimmedMessage,
        tone: options?.tone ?? 'success',
        duration: options?.duration ?? DEFAULT_TOAST_DURATION_MS,
      });
    },
    [],
  );

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToast(null);
    }, toast.duration);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);

  const value = useMemo(
    () => ({ showToast, hideToast }),
    [showToast, hideToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex justify-center px-4">
          <p
            role={toast.tone === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            className={`max-w-md rounded-md px-4 py-3 text-sm font-semibold shadow-lg ${
              toast.tone === 'error'
                ? 'bg-rose-500 text-white'
                : 'bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900'
            }`}
          >
            {toast.message}
          </p>
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}
