import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/global.css';
import { ReactNode } from 'react';
import { cn, getBaseUrl } from '@/utils/helpers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: 'BioCare Security Lab',
    template: '%s | BioCare Security Lab',
  },
  description: 'Laboratório educacional de criptografia aplicada e PKI.',
  openGraph: {
    title: 'BioCare Security Lab',
    description: 'Laboratório educacional de criptografia aplicada e PKI.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={cn(
          inter.className,
          'min-h-screen min-w-[320px] bg-[#071a1c] text-white antialiased'
        )}
      >
        {children}
      </body>
    </html>
  );
}
