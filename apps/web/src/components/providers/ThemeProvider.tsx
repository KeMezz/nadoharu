'use client';

import { useEffect } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    function updateThemeColor() {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      let themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (!themeColorMeta) {
        themeColorMeta = document.createElement('meta');
        themeColorMeta.setAttribute('name', 'theme-color');
        document.head.appendChild(themeColorMeta);
      }

      let statusBarMeta = document.querySelector(
        'meta[name="apple-mobile-web-app-status-bar-style"]',
      );
      if (!statusBarMeta) {
        statusBarMeta = document.createElement('meta');
        statusBarMeta.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
        document.head.appendChild(statusBarMeta);
      }

      if (isDark) {
        themeColorMeta.setAttribute('content', '#000000');
        statusBarMeta.setAttribute('content', 'black-translucent');
      } else {
        themeColorMeta.setAttribute('content', '#ffffff');
        statusBarMeta.setAttribute('content', 'default');
      }
    }

    updateThemeColor();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateThemeColor);
    return () => mediaQuery.removeEventListener('change', updateThemeColor);
  }, []);

  return <>{children}</>;
}
