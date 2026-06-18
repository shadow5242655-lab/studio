import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SHIV CLOTHES HOUSE AND GARMENTS | Premium Artisanal Textiles',
  description: 'Exquisite traditional wear and premium fabric collections at SHIV CLOTHES HOUSE AND GARMENTS, Lakhimpur, UP.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground selection:bg-primary/30">
        {children}
      </body>
    </html>
  );
}
