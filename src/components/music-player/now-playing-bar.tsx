'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2, Music2, X, Mic2 } from 'lucide-react';
import { useMusic, useMusicProgress } from './player-context';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { getBestImage, getArtistNames, formatDuration } from '@/lib/music-api';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function NowPlayingBar() {
  const { 
    currentTrack, isPlaying, togglePlay, nextTrack, prevTrack, 
    setIsPlayerOpen, stopTrack, setIsLyricsOpen 
  } = useMusic();

  const { progress, duration, volume, setVolume, seek, commitSeek, setIsSeeking } = useMusicProgress();

  if (!currentTrack) return null;

  const imageSrc = getBestImage(currentTrack);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 md:h-24 glass-effect border-t border-white/5 px-4 md:px-6 flex items-center justify-between z-50 group shadow-2xl">
      {/* Mobile Progress Line - Smooth 60FPS CSS Width */}
      <div className="absolute top-0 left-0 right-0 md:hidden h-[2px] bg-white/5">
        <div 
          className="h-full bg-primary transition-all duration-300 shadow-[0_0_10px_rgba(255,0,0,0.8)]" 
          style={{ width: `${(progress / (duration || 100)) * 100}%` }}
        />
      </div>

      {/* Track Info */}
      <div 
        className="flex items-center gap-3 md:gap-4 w-[45%] md:w-[30%] min-w-0 touch-feedback"
        onPointerDown={() => setIsPlayerOpen(true)}
      >
        <div className="relative h-12 w-12 md:h-14 md:w-14 rounded-xl overflow-hidden shadow-2xl bg-neutral-900 shrink-0 border border-white/10">
          {imageSrc ? (
            <Image src={imageSrc} alt={currentTrack.name} fill className="object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Music2 className="h-6 w-6 text-neutral-600" />
            </div>
          )}
        </div>
        <div className="flex flex-col min-w-0 pr-2">
          <span className="text-sm font-black text-white truncate italic uppercase tracking-tighter leading-none mb-1">
            {currentTrack.name}
          </span>
          <span className="text-[10px] text-muted-foreground truncate font-bold uppercase tracking-wider opacity-60">
            {getArtistNames(currentTrack)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-1 w-full md:px-4 shrink-0 max-w-[40%] md:max-w-none">
        <div className="flex items-center gap-3 md:gap-8">
          <Button variant="ghost" size="icon" className="text-white touch-btn hidden sm:flex" onPointerDown={prevTrack}>
            <SkipBack className="h-5 w-5 fill-white" />
          </Button>
          <Button 
            className="bg-white text-black rounded-full h-11 w-11 md:h-14 md:w-14 touch-btn p-0 shadow-xl border-2 border-black/10"
            onPointerDown={togglePlay}
          >
            {isPlaying ? <Pause className="h-5 w-5 md:h-6 md:w-6 fill-black" /> : <Play className="h-5 w-5 md:h-6 md:w-6 fill-black ml-0.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-white touch-btn" onPointerDown={nextTrack}>
            <SkipForward className="h-5 w-5 fill-white" />
          </Button>
        </div>
        
        {/* Optimized Desktop Slider */}
        <div className="hidden md:flex items-center gap-3 w-full max-w-lg">
          <span className="text-[9px] text-muted-foreground w-10 text-right font-black italic">{formatDuration(progress)}</span>
          <Slider
            value={[progress]}
            max={duration || 100}
            step={0.1}
            onPointerDown={() => setIsSeeking(true)}
            onValueChange={(vals) => seek(vals[0])}
            onValueCommit={(vals) => commitSeek(vals[0])}
            className="flex-1 cursor-pointer py-4"
          />
          <span className="text-[9px] text-muted-foreground w-10 font-black italic">{formatDuration(duration)}</span>
        </div>
      </div>

      {/* Action Suite */}
      <div className="flex items-center justify-end gap-1 md:gap-3 w-[15%] md:w-[30%]">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-primary hover:bg-primary/10 touch-btn flex flex-col items-center gap-0.5"
          onPointerDown={() => setIsLyricsOpen(true)}
        >
          <Mic2 className="h-5 w-5" />
          <span className="text-[8px] font-black uppercase">LYRICS</span>
        </Button>

        <div className="hidden lg:flex items-center gap-3 w-32 group ml-2">
          <Volume2 className="h-4 w-4 text-muted-foreground group-hover:text-white shrink-0" />
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={(vals) => setVolume(vals[0] / 100)}
            className="cursor-pointer"
          />
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-white touch-btn ml-2"
          onPointerDown={stopTrack}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}