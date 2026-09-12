import type { Metadata } from 'next';
import { Urbanist, Inter } from 'next/font/google';
import { SmoothScroll } from '@/components/SmoothScroll';
import { AigocyAnimations } from '@/components/AigocyAnimations';
import './globals.css';

const urbanist = Urbanist({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-urbanist',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TradeAI - Trading Research Assistant',
  description: 'Turn your trading ideas in plain English into clear, structured strategy test plans.',
  icons: {
    icon: '/images/logo-2.svg',
    shortcut: '/images/logo-2.svg',
    apple: '/images/logo-2.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${urbanist.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#edecec] text-[#09090B]">
        <SmoothScroll />
        <AigocyAnimations />
        {children}
      </body>
    </html>
  );
}
