// src/lib/fonts.ts
import localFont from 'next/font/local';

export const estedad = localFont({
  src: [
    { path: '../../public/fonts/Estedad-Regular.woff2', weight: '400' },
    { path: '../../public/fonts/Estedad-Bold.woff2', weight: '700' },
    { path: '../../public/fonts/Estedad-Black.woff2', weight: '900' },
  ],
  variable: '--font-estedad',
  display: 'swap',
});
