import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cyphra | Confidential Payments on Midnight',
  description:
    'Privacy-first confidential payment application built on Midnight. Send, receive, and request private digital assets with zero-knowledge verification.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-zinc-950 antialiased selection:bg-[#FFD400] selection:text-black">
        {children}
      </body>
    </html>
  );
}
