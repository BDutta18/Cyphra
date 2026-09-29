import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const viewport: Viewport = {
  themeColor: '#FFD400',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://cyphra-two.vercel.app'),
  title: 'Cyphra | Confidential Payments on Midnight Preprod',
  description:
    'Privacy-first confidential payment application built on Midnight. Send, receive, and request private digital assets with zero-knowledge verification.',
  keywords: ['Midnight', 'Zero-Knowledge', 'zkSNARKs', 'Privacy', 'Confidential Payments', 'Compact', '1AM Wallet'],
  authors: [{ name: 'Cyphra Protocol' }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo-transparent.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Cyphra | Confidential Payments on Midnight',
    description:
      'Privacy-first confidential payment application built on Midnight Network with Compact 0.31.1 smart contracts.',
    images: [{ url: '/cyphra-x-banner.svg', width: 1500, height: 500, alt: 'Cyphra Midnight Payments' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cyphra | Confidential Payments on Midnight',
    description:
      'Zero-knowledge payments, private invoices, and selective compliance disclosure on Midnight Network.',
    images: ['/cyphra-x-banner.svg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans min-h-screen bg-white text-zinc-950 antialiased selection:bg-[#FFD400] selection:text-black">
        {children}
      </body>
    </html>
  );
}
