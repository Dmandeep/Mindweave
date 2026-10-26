import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Web of Thoughts — Autonomous Discovery Engine & Knowledge Universe',
  description:
    'An empirical AI-powered knowledge universe with autonomous discovery and hypothesis investigation lab.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-cosmic-950 text-cosmic-100 antialiased overflow-hidden selection:bg-discovery-500/30 selection:text-discovery-200">
        {children}
      </body>
    </html>
  );
}
