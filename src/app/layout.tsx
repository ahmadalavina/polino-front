import type { Metadata } from 'next';
import { iranYekanX } from '@/lib/fonts';
import AuthGuard from '@/components/AuthGuard';
import './globals.css';

export const metadata: Metadata = {
  title: 'پولینو',
  description: 'آموزش سواد مالی برای کودکان',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${iranYekanX.variable} ${iranYekanX.className}`}>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
