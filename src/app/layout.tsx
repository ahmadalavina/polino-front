import type { Metadata } from 'next';
import { iranYekanX } from '@/lib/fonts';
import AuthGuard from '@/components/AuthGuard';
import ThemeProvider from '@/components/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'پولینو',
  description: 'آموزش سواد مالی برای کودکان',
};

const themeInitScript = `(function(){try{var raw=localStorage.getItem('poolino-theme');var pref='system';if(raw){var parsed=JSON.parse(raw);pref=(parsed&&parsed.state&&parsed.state.theme)||'system';}var dark=pref==='dark'||(pref==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var root=document.documentElement;root.dataset.theme=dark?'dark':'light';if(dark){root.classList.add('dark');}root.style.colorScheme=dark?'dark':'light';}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${iranYekanX.variable} ${iranYekanX.className}`}>
        <ThemeProvider>
          <AuthGuard>{children}</AuthGuard>
        </ThemeProvider>
      </body>
    </html>
  );
}
