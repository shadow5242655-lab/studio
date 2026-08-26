import type { Metadata } from 'next';
import './globals.css';
import { NowPlayingBar } from '@/components/music-player/now-playing-bar';
import { MusicProvider } from '@/components/music-player/player-context';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Sidebar, Header } from '@/components/music-player/sidebar';
import { BottomNav } from '@/components/music-player/bottom-nav';
import { FullScreenPlayer } from '@/components/music-player/full-screen-player';
import { LyricsDrawer } from '@/components/music-player/lyrics-drawer';

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
      <body className="antialiased bg-black text-white h-screen overflow-hidden flex flex-col font-sans">
        <FirebaseClientProvider>
          <MusicProvider>
            {/* Mobile Header */}
            <Header />
            
            <div className="flex flex-1 overflow-hidden relative">
              {/* Desktop Sidebar */}
              <Sidebar />
              
              <main className="flex-1 overflow-y-auto relative custom-scrollbar bg-black">
                {children}
              </main>
            </div>
            
            {/* Global Music Player (Spotify-Style Bar) */}
            <NowPlayingBar />
            
            {/* Immersive Player Layers */}
            <FullScreenPlayer />
            <LyricsDrawer />
            
            {/* Bottom Navigation */}
            <BottomNav />
            
            <Toaster />
          </MusicProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
