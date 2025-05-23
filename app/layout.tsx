import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientLayout from '../components/ClientLayout';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'AI工具集',
  description: '一站式AI工具导航平台',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#5B6AFF',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" className="scroll-smooth">
      <head>
        <link rel="stylesheet" href="/force-dark-mode.css" />
        <Script src="/dark-mode-fixer.js" strategy="beforeInteractive" />
        <Script src="/theme-fixer.js" strategy="afterInteractive" />
        <Script src="/inject-toggle.js" strategy="afterInteractive" />
        <Script src="/theme-debugger.js" strategy="afterInteractive" />
      </head>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}