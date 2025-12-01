import type { Metadata, Viewport } from 'next';
import { inter } from '@/lib/theme/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Yollr - Campus Social Feed',
  description: 'The viral campus social app that brings your community together',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Yollr',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#080A0F',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#080A0F" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body
        className={`${inter.variable} font-sans h-full overflow-hidden antialiased`}
        style={{
          background: '#080A0F',
          color: 'rgba(247, 248, 250, 0.90)',
        }}
      >
        {children}
      </body>
    </html>
  );
}