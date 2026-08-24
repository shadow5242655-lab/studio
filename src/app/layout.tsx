import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/music-player/sidebar';
import { NowPlayingBar } from '@/components/music-player/now-playing-bar';
import { MusicProvider } from '@/components/music-player/player-context';

export const metadata: Metadata = {
  title: 'AYUMUSIC - Web Player',
  description: 'Music for everyone.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-white h-screen overflow-hidden flex flex-col">
        <MusicProvider>
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-neutral-950 spotify-gradient relative">
              {children}
            </main>
          </div>
          <NowPlayingBar />
        </MusicProvider>
      </body>
    </html>
  );
}
