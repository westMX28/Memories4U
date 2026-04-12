import type { Metadata } from 'next';
import { Manrope, Prata } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const displayFont = Prata({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400'],
});

const bodyFont = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Memories4U | Persönliche Geburtstagsüberraschungen aus euren Erinnerungen',
  description:
    'Aus Bildern und einem kurzen Moment entsteht eine digitale Geburtstags-Story, die persönlich wirkt, schnell bestellt ist und direkt verschenkt werden kann.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
