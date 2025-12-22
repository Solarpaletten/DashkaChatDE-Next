import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DashkaChat',
  description: 'Real-time translation chat application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
