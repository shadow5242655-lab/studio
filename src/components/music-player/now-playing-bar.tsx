'use client';

import React, { useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music2, Mic2, Download } from 'lucide-react';
import { useMusic, useMusicProgress } from './player-context';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { getBestImage, formatDuration, getBestDownload } from '@/lib/music-api';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function NowPlayingBar() {
  const { currentTrack, isPlaying, togglePlay, nextTrack, prevTrack, setIsPlayerOpen, setIsLyricsOpen } = useMusic();
  const { progress, duration, volume, setVolume, seek } = useMusicProgress();
  const router = useRouter();
  const startPos = useRef<{ x: number, y: number, time: number } | null>(null);

  if (!currentTrack) return null;

  const imageSrc = getBestImage(currentTrack);

  const handlePointerDown = (e: React.PointerEvent) => {
    startPos.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handlePointerUp = (callback: () => void) => (e: React.PointerEvent) => {
    if (!startPos.current) return;
    const dx = Math.abs(e.clientX - startPos.current.x);
    const dy = Math.abs(e.clientY - startPos.current.y);
    const dt = Date.now() - startPos.current.time;
    
    if (dx < 10 && dy < 10 && dt < 300) {
      callback();
    }
    startPos.current = null;
  };

  const handlePointerCancel = () => {
    startPos.current = null;
  };

  const handleDownload = () => {
    const url = getBestDownload(currentTrack);
    if (url) window.open(url, '_blank');
  };

  const handleArtistClick = (e: React.PointerEvent, artistName: string) => {
    e.stopPropagation();
    router.push(`/search?q=${encodeURIComponent(artistName)}`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 glass-card border-t border-white/10 px-6 flex items-center justify-between z-50">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/5">
        <Slider
          value={[progress]}
          max={duration || 100}
          step={0.1}
          onValueChange={(vals) => seek(vals[0])}
          className="w-full absolute -top-[6px] cursor-pointer"
        />
      </div>

      {/* Track Info */}
      <div 
        className="flex items-center gap-4 w-[30%] min-w-0 cursor-pointer lag-free-tap group"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp(() => setIsPlayerOpen(true))}
        onPointerCancel={handlePointerCancel}
        style={{ touchAction: 'manipulation' }}
      >
        <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-neutral-900 shrink-0 border border-white/10 shadow-xl">
          {imageSrc ? (
            <Image src={imageSrc} alt={currentTrack.name} fill className="object-cover group-hover:scale-110 transition-transform" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Music2 className="h-6 w-6 text-neutral-600" />
            </div>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-black text-white truncate italic uppercase tracking-tighter">{currentTrack.name}</span>
          <span className="text-[10px] text-primary/70 font-bold truncate uppercase tracking-widest">
            {currentTrack.artists.primary.map((artist, index) => (
              <span key={artist.id || index}>
                <span 
                  onPointerDown={handlePointerDown}
                  onPointerUp={handlePointerUp(() => handleArtistClick({ stopPropagation: () => {} } as any, artist.name))}
                  onPointerCancel={handlePointerCancel}
                  className="hover:text-white hover:underline"
                >
                  {artist.name}
                </span>
                {index < currentTrack.artists.primary.length - 1 ? ', ' : ''}
              </span>
            ))}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-1 flex-1">
        <div className="flex items-center gap-8">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-neutral-500 hover:text-white lag-free-tap" 
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp(prevTrack)}
            onPointerCancel={handlePointerCancel}
          >
            <SkipBack className="h-6 w-6 fill-current" />
          </Button>
          <Button 
            className="bg-white text-black rounded-full h-12 w-12 p-0 hover:scale-110 active:scale-95 transition-transform lag-free-tap shadow-lg"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp(togglePlay)}
            onPointerCancel={handlePointerCancel}
          >
            {isPlaying ? <Pause className="h-7 w-7 fill-current" /> : <Play className="h-7 w-7 fill-current" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-neutral-500 hover:text-white lag-free-tap" 
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp(nextTrack)}
            onPointerCancel={handlePointerCancel}
          >
            <SkipForward className="h-6 w-6 fill-current" />
          </Button>
        </div>
        <div className="flex items-center gap-3 w-full max-w-[200px] justify-center text-[10px] font-bold text-neutral-500 tracking-widest uppercase">
          <span>{formatDuration(progress)}</span>
          <span>/</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      {/* Volume, Lyrics & Download */}
      <div className="flex items-center justify-end gap-6 w-[30%]">
        <div className="flex items-center gap-2 hidden md:flex">
          <Volume2 className="h-4 w-4 text-neutral-500" />
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={(vals) => setVolume(vals[0] / 100)}
            className="w-24"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-neutral-500 hover:text-white transition-colors lag-free-tap" 
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp(handleDownload)}
            onPointerCancel={handlePointerCancel}
          >
            <Download className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary/50 hover:text-primary transition-colors lag-free-tap" 
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp(() => setIsLyricsOpen(true))}
            onPointerCancel={handlePointerCancel}
          >
            <Mic2 className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
