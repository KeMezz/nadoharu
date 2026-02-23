'use client';

export function SocialLoginButtons() {
  return (
    <>
      <button
        type="button"
        disabled
        aria-label="Apple로 로그인 (준비 중)"
        title="준비 중"
        className="flex justify-center items-center w-16 h-16 bg-neutral-100 dark:bg-neutral-800 text-neutral-400 rounded-full cursor-not-allowed opacity-50"
      >
        <AppleIcon />
      </button>
      <button
        type="button"
        disabled
        aria-label="Kakao로 로그인 (준비 중)"
        title="준비 중"
        className="flex justify-center items-center w-16 h-16 bg-neutral-100 dark:bg-neutral-800 text-neutral-400 rounded-full cursor-not-allowed opacity-50"
      >
        <KakaoIcon />
      </button>
      <button
        type="button"
        disabled
        aria-label="GitHub로 로그인 (준비 중)"
        title="준비 중"
        className="flex justify-center items-center w-16 h-16 bg-neutral-100 dark:bg-neutral-800 text-neutral-400 rounded-full cursor-not-allowed opacity-50"
      >
        <GitHubIcon />
      </button>
    </>
  );
}

function AppleIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.557 1.707 4.8 4.27 6.054-.188.702-.682 2.545-.78 2.94-.123.49.18.483.378.352.156-.103 2.5-1.7 3.512-2.388.52.076 1.053.116 1.597.116 4.97 0 9-3.186 9-7.115C21 6.186 16.97 3 12 3z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
