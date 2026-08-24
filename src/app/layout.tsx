
import type { Metadata } from 'next';
import './globals.css';
import { Sidebar, MobileHeader } from '@/components/music-player/sidebar';
import { NowPlayingBar } from '@/components/music-player/now-playing-bar';
import { FullScreenPlayer } from '@/components/music-player/full-screen-player';
import { MusicProvider } from '@/components/music-player/player-context';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'AYUMUSIC - Premium Sound',
  description: 'The definitive Red and Grey music experience.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-black text-white h-screen overflow-hidden flex flex-col selection:bg-primary selection:text-white">
        <FirebaseClientProvider>
          <MusicProvider>
            <MobileHeader />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-y-auto bg-neutral-950 spotify-gradient relative">
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
