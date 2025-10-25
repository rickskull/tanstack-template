import './globals.css';
import type { Metadata } from 'next';
import { Rajdhani } from 'next/font/google';

const rajdhani = Rajdhani({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'SkVoid Marketplace',
  description: 'Marketplace gamer com carteira integrada e foco em segurança.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="bg-black">
      <body className={`${rajdhani.className} bg-black text-slate-100 min-h-screen`}>{children}</body>
    </html>
  );
}
