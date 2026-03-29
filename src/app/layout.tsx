import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Memories4U',
  description: 'Personalisierte visuelle Erinnerungen als digitales Geschenk.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
