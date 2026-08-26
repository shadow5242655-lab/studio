
'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronDown, Heart, Music2, X } from 'lucide-react';
import { useMusic, useMusicProgress } from './player-context';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { getBestImage, formatDuration, decodeEntities } from '@/lib/music-api';
import { cn } from '@/lib/utils';

export function FullScreenPlayer() {
  const { 
    currentTrack, isPlaying, isBuffering, isPlayerOpen, setIsPlayerOpen, 
    togglePlay, nextTrack, prevTrack, toggleLike, isLiked, stopTrack
  } = useMusic();
  const { progress, duration, seek, setIsScrubbing } = useMusicProgress();

  if (!isPlayerOpen || !currentTrack) return null;

  const imageSrc = getBestImage(currentTrack);
  const trackName = decodeEntities(currentTrack.name);
  const artistNames = currentTrack.artists.primary.map(a => decodeEntities(a.name)).join(', ');

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-6 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => setIsPlayerOpen(false)} className="hover:bg-white/5">
          <ChevronDown className="h-6 w-6" />
        </Button>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b3b3b3]">Now Playing</span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={stopTrack}
          className="hover:bg-white/5 text-[#b3b3b3] hover:text-primary"
        >
          <X className="h-6 w-6" />
        </Button>
      </header>

      {/* Main View */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 md:px-16 max-w-4xl mx-auto w-full space-y-8 md:space-y-12">
        {/* Album Art */}
        <div className="relative aspect-square w-full max-w-[400px] rounded-lg overflow-hidden shadow-2xl bg-[#282828]">
          {imageSrc ? (
            <img src={imageSrc} className={cn("w-full h-full object-cover", isBuffering && "opacity-50")} alt="" />
          ) : (
            <Music2 className="h-24 w-24 text-neutral-800" />
          )}
        </div>

        {/* Track Info */}
        <div className="w-full max-w-[400px] flex items-center justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl md:text-3xl font-bold truncate">{trackName}</h2>
            <p className="text-sm md:text-base text-[#b3b3b3] truncate mt-1">{artistNames}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => toggleLike(currentTrack)} className="text-[#b3b3b3] hover:text-primary">
            <Heart className={cn("h-7 w-7", isLiked(currentTrack.id) && "fill-primary text-primary")} />
          </Button>
        </div>

        {/* Seek Bar */}
        <div className="w-full max-w-[400px] space-y-2">
          <Slider 
            value={[progress]} 
            max={duration || 100} 
            step={0.1} 
            onValueChange={v => {
              setIsScrubbing(true);
              seek(v[0]);
            }} 
            onValueCommit={() => {
              setIsScrubbing(false);
            }}
          />
          <div className="flex justify-between text-[11px] font-medium text-[#b3b3b3]">
            <span>{formatDuration(progress)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full max-w-[400px] flex items-center justify-between">
          <Button variant="ghost" size="icon" className="text-[#b3b3b3] hover:text-white h-12 w-12" onClick={prevTrack}>
            <SkipBack className="h-8 w-8 fill-current" />
          </Button>
          <Button 
            onClick={togglePlay} 
            className="bg-white text-black rounded-full h-16 w-16 p-0 hover:scale-105 active:scale-95 transition-transform"
          >
            {isPlaying ? <Pause className="h-8 w-8 fill-current" /> : <Play className="h-8 w-8 fill-current ml-1" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-[#b3b3b3] hover:text-white h-12 w-12" onClick={nextTrack}>
            <SkipForward className="h-8 w-8 fill-current" />
          </Button>
        </div>
      </div>
    </div>
  );
}
