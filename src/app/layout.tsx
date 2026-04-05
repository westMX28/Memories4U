import type { Metadata } from 'next';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const displayFont = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
});

const bodyFont = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'Memories4U | Geburtstagsmomente als digitale Story',
  description: 'Persoenliche Geburtstags-Stories aus euren Erinnerungen. Schnell bestellt, digital verschenkt, emotional aufbereitet.',
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
