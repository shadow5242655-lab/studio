import type { Metadata } from 'next';
import './globals.css';
import { NowPlayingBar } from '@/components/music-player/now-playing-bar';
import { MusicProvider } from '@/components/music-player/player-context';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Sidebar, Header } from '@/components/music-player/sidebar';

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
      <body className="antialiased bg-[#0a0a0a] text-white h-screen overflow-hidden flex flex-col font-sans">
        <FirebaseClientProvider>
          <MusicProvider>
            {/* Mobile Header */}
            <Header />
            
            <div className="flex flex-1 overflow-hidden relative">
              {/* Desktop Sidebar */}
              <Sidebar />
              
              <main className="flex-1 overflow-y-auto relative custom-scrollbar bg-[#0a0a0a]">
                {children}
              </main>
            </div>
            
            {/* Global Music Player (Fixed Mini Bar) */}
            <NowPlayingBar />
            
            <Toaster />
          </MusicProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
