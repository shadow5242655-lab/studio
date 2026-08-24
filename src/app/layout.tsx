import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'New App',
  description: 'Building something new',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
