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
      <body className="antialiased bg-black text-white h-svh overflow-hidden flex flex-col font-sans relative">
        <FirebaseClientProvider>
          <MusicProvider>
            <div className="flex flex-1 overflow-hidden relative">
              <Sidebar />
              
              <div className="flex-1 flex flex-col overflow-hidden relative">
                <Header />
                <main className="flex-1 overflow-y-auto relative custom-scrollbar bg-black pb-44">
                  {children}
                </main>
              </div>
            </div>
            
            {/* Playback & Navigation Stack - Anchored at absolute bottom */}
            <div className="fixed bottom-0 left-0 right-0 z-[100] flex flex-col bg-black">
               <NowPlayingBar />
               <BottomNav />
            </div>
            
            <FullScreenPlayer />
            <LyricsDrawer />
            
            <Toaster />
          </MusicProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
