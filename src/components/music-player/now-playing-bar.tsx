'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music2, X, Mic2 } from 'lucide-react';
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
    <div className="fixed bottom-0 left-0 right-0 h-24 md:h-28 sterniters-glass border-t border-white/5 px-4 md:px-8 flex items-center justify-between z-[100] group shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {/* 60FPS Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/5 overflow-hidden">
        <div 
          className="h-full bg-primary transition-transform duration-100 ease-linear shadow-[0_0_15px_rgba(0,255,255,0.8)]" 
          style={{ transform: `translateX(-${100 - (progress / (duration || 1) * 100)}%)` }}
        />
      </div>

      {/* Track Info */}
      <div 
        className="flex items-center gap-4 w-[40%] md:w-[30%] min-w-0 touch-btn cursor-pointer"
        onPointerDown={() => setIsPlayerOpen(true)}
      >
        <div className="relative h-14 w-14 rounded-2xl overflow-hidden shadow-2xl bg-neutral-900 shrink-0 border border-white/10 neon-glow-primary">
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
          <span className="text-[9px] text-neutral-500 truncate font-black uppercase tracking-widest">
            {getArtistNames(currentTrack)}
          </span>
        </div>
      </div>

      {/* Control Hub */}
      <div className="flex flex-col items-center gap-2 w-full max-w-[40%]">
        <div className="flex items-center gap-6 md:gap-10">
          <Button variant="ghost" size="icon" className="text-white touch-btn hidden sm:flex" onPointerDown={prevTrack}>
            <SkipBack className="h-6 w-6 fill-white" />
          </Button>
          <Button 
            className="bg-primary text-black rounded-full h-14 w-14 touch-btn p-0 shadow-2xl neon-glow-primary hover:scale-105"
            onPointerDown={togglePlay}
          >
            {isPlaying ? <Pause className="h-7 w-7 fill-black" /> : <Play className="h-7 w-7 fill-black ml-1" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-white touch-btn" onPointerDown={nextTrack}>
            <SkipForward className="h-6 w-6 fill-white" />
          </Button>
        </div>
        
        {/* Desktop Seeker */}
        <div className="hidden md:flex items-center gap-4 w-full max-w-lg">
          <span className="text-[9px] text-neutral-500 w-10 text-right font-black italic">{formatDuration(progress)}</span>
          <Slider
            value={[progress]}
            max={duration || 100}
            step={0.1}
            onPointerDown={() => setIsSeeking(true)}
            onValueChange={(vals) => seek(vals[0])}
            onValueCommit={(vals) => commitSeek(vals[0])}
            className="flex-1 cursor-pointer py-4"
          />
          <span className="text-[9px] text-neutral-500 w-10 font-black italic">{formatDuration(duration)}</span>
        </div>
      </div>

      {/* Action Suite */}
      <div className="flex items-center justify-end gap-2 md:gap-4 w-[20%] md:w-[30%]">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-primary hover:bg-primary/10 touch-btn hidden sm:flex flex-col items-center"
          onPointerDown={() => setIsLyricsOpen(true)}
        >
          <Mic2 className="h-5 w-5" />
          <span className="text-[7px] font-black uppercase">LYRICS</span>
        </Button>

        <div className="hidden lg:flex items-center gap-3 w-28 ml-2">
          <Volume2 className="h-4 w-4 text-neutral-500 shrink-0" />
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
          className="text-neutral-500 hover:text-white touch-btn ml-2"
          onPointerDown={stopTrack}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
