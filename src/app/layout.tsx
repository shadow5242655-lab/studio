import type { Metadata } from 'next';
import './globals.css';
import { NowPlayingBar } from '@/components/music-player/now-playing-bar';
import { FullScreenPlayer } from '@/components/music-player/full-screen-player';
import { MusicProvider } from '@/components/music-player/player-context';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'AYUMUSIC - Premium Sound',
  description: 'Clean, modern music discovery.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#0a0a0a] text-white h-screen overflow-hidden flex flex-col">
        <FirebaseClientProvider>
          <MusicProvider>
            <div className="flex flex-1 overflow-hidden">
              <main className="flex-1 overflow-y-auto relative">
                {children}
              </main>
            </div>
            <NowPlayingBar />
            <FullScreenPlayer />
            <Toaster />
          </MusicProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}