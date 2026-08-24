'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music2, Mic2 } from 'lucide-react';
import { useMusic, useMusicProgress } from './player-context';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { getBestImage, getArtistNames, formatDuration } from '@/lib/music-api';
import Image from 'next/image';

export function NowPlayingBar() {
  const { currentTrack, isPlaying, togglePlay, nextTrack, prevTrack, setIsPlayerOpen, setIsLyricsOpen } = useMusic();
  const { progress, duration, volume, setVolume, seek } = useMusicProgress();

  if (!currentTrack) return null;

  const imageSrc = getBestImage(currentTrack);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 glass-card border-t border-white/5 px-6 flex items-center justify-between z-50 backdrop-blur-3xl">
      <div className="absolute top-0 left-0 h-[2px] bg-primary/20 w-full">
        <div 
          className="h-full bg-primary neon-glow transition-all duration-300 linear" 
          style={{ width: `${(progress / (duration || 1)) * 100}%` }}
        />
      </div>

      {/* Track Info */}
      <div 
        className="flex items-center gap-4 w-[30%] min-w-0 cursor-pointer lag-free-tap"
        onPointerDown={() => setIsPlayerOpen(true)}
      >
        <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-neutral-900 shrink-0 border border-white/10 shadow-xl">
          {imageSrc ? (
            <Image src={imageSrc} alt={currentTrack.name} fill className="object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Music2 className="h-6 w-6 text-neutral-600" />
            </div>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-black text-white truncate italic uppercase tracking-tighter">{currentTrack.name}</span>
          <span className="text-[10px] text-primary/70 font-bold truncate uppercase tracking-widest">{getArtistNames(currentTrack)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-xl">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-white lag-free-tap" onPointerDown={prevTrack}>
            <SkipBack className="h-5 w-5 fill-current" />
          </Button>
          <Button 
            className="bg-white text-black rounded-full h-10 w-10 p-0 hover:scale-110 active:scale-90 transition-transform lag-free-tap"
            onPointerDown={togglePlay}
          >
            {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-white lag-free-tap" onPointerDown={nextTrack}>
            <SkipForward className="h-5 w-5 fill-current" />
          </Button>
          <Button variant="ghost" size="icon" className="text-primary/50 hover:text-primary transition-colors lag-free-tap" onPointerDown={() => setIsLyricsOpen(true)}>
            <Mic2 className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center gap-3 w-full">
          <span className="text-[10px] font-bold text-neutral-500 w-8 text-right tracking-widest">{formatDuration(progress)}</span>
          <Slider
            value={[progress]}
            max={duration || 100}
            step={0.1}
            onValueChange={(vals) => seek(vals[0])}
            className="flex-1"
          />
          <span className="text-[10px] font-bold text-neutral-500 w-8 tracking-widest">{formatDuration(duration)}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center justify-end gap-3 w-[30%] hidden md:flex">
        <Volume2 className="h-4 w-4 text-neutral-500" />
        <Slider
          value={[volume * 100]}
          max={100}
          step={1}
          onValueChange={(vals) => setVolume(vals[0] / 100)}
          className="w-24"
        />
      </div>
    </div>
  );
}
