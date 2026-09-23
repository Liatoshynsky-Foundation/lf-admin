import type { Metadata } from 'next';
import { Mulish, Oswald } from 'next/font/google';

import { AppProviders } from '../AppProviders';

const mulish = Mulish({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mulish',
  display: 'swap'
});

const oswald = Oswald({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '600', '700'],
  variable: '--font-oswald',
  display: 'swap'
});

export const metadata: Metadata = {
  title: {
    default: 'LF Admin',
    template: '%s | LF Admin'
  },
  description: 'Administrative portal for managing Liatoshynsky Foundation digital archives, events, and content.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [{ url: '/apple-touch-icon.png' }]
  },
  manifest: '/site.webmanifest'
};

export default function BodyProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${mulish.variable} ${oswald.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
