import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MindWeave — AI-Powered Knowledge Discovery Platform',
  description:
    'MindWeave: An AI-Powered Knowledge Discovery Platform. Weaving Knowledge Into Discovery. Connect scattered ideas, explore meaningful relationships, and investigate empirical hypotheses.',
  keywords: [
    'Knowledge Graph',
    'Autonomous Discovery Engine',
    'Discovery Lab',
    'Empirical Research',
    'Cognitive Modeling',
    'MindWeave',
  ],
  authors: [{ name: 'MindWeave Systems' }],
  openGraph: {
    title: 'MindWeave — Weaving Knowledge Into Discovery',
    description:
      'An AI-powered knowledge discovery platform combining an interactive persistent graph, autonomous bridge generation, and hypothesis investigation lab.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-cream text-ink antialiased overflow-hidden selection:bg-royal/15 selection:text-royal">
        {children}
      </body>
    </html>
  );
}
