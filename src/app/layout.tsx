import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Neuro Play - Painel',
  description: 'Painel administrativo Neuro Play IPTV',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
