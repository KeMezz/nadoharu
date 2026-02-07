import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '나도하루',
  description: '일상을 공유하고 공감하는 소셜 플랫폼',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
