import type { Metadata } from 'next';
import { EB_Garamond } from 'next/font/google';
import './globals.css';

const garamond = EB_Garamond({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'Proposals',
  description: 'Generate and send proposals.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${garamond.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
