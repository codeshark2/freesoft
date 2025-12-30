import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Voice AI Testing Tool',
  description:
    'Test your voice AI pipelines with real-time ASR → LLM → TTS processing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
