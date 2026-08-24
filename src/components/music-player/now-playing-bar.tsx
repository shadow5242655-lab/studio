
'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Maximize2, Heart, Music2, X, Mic2 } from 'lucide-react';
import { useMusic, useMusicProgress } from './player-context';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { getBestImage, getArtistNames, formatDuration } from '@/lib/music-api';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function NowPlayingBar() {
  const { 
    currentTrack, isPlaying, togglePlay, nextTrack, prevTrack, 
    toggleLike, isLiked, setIsPlayerOpen, stopTrack, setIsLyricsOpen 
  } = useMusic();

  const { progress, duration, volume, setVolume, seek, commitSeek, setIsSeeking } = useMusicProgress();

  if (!currentTrack) return null;

  const imageSrc = getBestImage(currentTrack);
  const liked = isLiked(currentTrack.id);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 md:h-24 glass-effect border-t border-white/5 px-4 md:px-6 flex items-center justify-between z-50 group">
      {/* Progress Line for Mobile */}
      <div className="absolute top-0 left-0 right-0 md:hidden h-1 bg-white/10 overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300" 
          style={{ width: `${(progress / (duration || 100)) * 100}%` }}
        />
      </div>

      {/* Track Info */}
      <div 
        className="flex items-center gap-3 md:gap-4 w-[60%] md:w-[30%] min-w-0 cursor-pointer touch-feedback touch-btn"
        onPointerUp={() => setIsPlayerOpen(true)}
      >
        <div className="relative h-12 w-12 md:h-14 md:w-14 rounded-xl overflow-hidden shadow-2xl bg-neutral-900 shrink-0 border border-white/5">
          {imageSrc ? (
            <Image src={imageSrc} alt={currentTrack.name} fill className="object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Music2 className="h-6 w-6 text-neutral-600" />
            </div>
          )}
        </div>
        <div className="flex flex-col min-w-0 pr-2">
          <span className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate">
            {currentTrack.name}
          </span>
          <span className="text-xs text-muted-foreground truncate font-medium">
            {getArtistNames(currentTrack)}
          </span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex flex-col items-center gap-2 max-w-[20%] md:w-full md:px-4 shrink-0">
        <div className="flex items-center gap-4 md:gap-8">
          <Button variant="ghost" size="icon" className="text-white touch-btn hidden sm:flex" onPointerDown={prevTrack}>
            <SkipBack className="h-6 w-6 fill-white" />
          </Button>
          <Button 
            className="bg-white text-black rounded-full h-11 w-11 md:h-14 md:w-14 touch-btn p-0 shadow-xl"
            onPointerDown={togglePlay}
          >
            {isPlaying ? <Pause className="h-6 w-6 md:h-7 md:w-7 fill-black" /> : <Play className="h-6 w-6 md:h-7 md:w-7 fill-black ml-1" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-white touch-btn" onPointerDown={nextTrack}>
            <SkipForward className="h-6 w-6 fill-white" />
          </Button>
        </div>
        <div className="hidden md:flex items-center gap-3 w-full max-w-lg">
          <span className="text-[10px] text-muted-foreground w-10 text-right font-mono font-bold">
            {formatDuration(progress)}
          </span>
          <Slider
            value={[progress]}
            max={duration || 100}
            step={0.1}
            onPointerDown={() => setIsSeeking(true)}
            onValueChange={(vals) => seek(vals[0])}
            onValueCommit={(vals) => commitSeek(vals[0])}
            className="flex-1 cursor-pointer py-4"
          />
          <span className="text-[10px] text-muted-foreground w-10 font-mono font-bold">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* Extra Controls */}
      <div className="flex items-center justify-end gap-2 md:gap-3 w-[20%] md:w-[30%]">
        <Button 
          variant="ghost" 
          className="text-xs font-black italic tracking-tighter text-muted-foreground hover:text-primary gap-1 px-2 h-8 rounded-full hidden sm:flex touch-btn"
          onPointerDown={(e) => {
            e.stopPropagation();
            setIsLyricsOpen(true);
          }}
        >
          <Mic2 className="h-3 w-3" />
          LYRICS
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-primary sm:hidden touch-btn"
          onPointerDown={(e) => {
            e.stopPropagation();
            setIsLyricsOpen(true);
          }}
        >
          <Mic2 className="h-5 w-5" />
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
          className="text-muted-foreground hover:text-white hidden md:flex touch-btn"
          onPointerUp={() => setIsPlayerOpen(true)}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-primary touch-btn ml-2"
          onPointerDown={(e) => {
            e.stopPropagation();
            stopTrack();
          }}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
