'use client';

import React from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, 
  Music2, Heart, X
} from 'lucide-react';
import { useMusic, useMusicProgress } from './player-context';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { getBestImage, decodeEntities, formatDuration } from '@/lib/music-api';
import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * @fileOverview High-fidelity Spotify-style Bar Player.
 * Re-architected to match the pixel-perfect layout from the user screenshot.
 */

export function NowPlayingBar() {
  const { 
    currentTrack, isPlaying, isBuffering, togglePlay, nextTrack, prevTrack,
    stopTrack, toggleLike, isLiked
  } = useMusic();
  const { progress, duration, seek, setIsScrubbing } = useMusicProgress();

  if (!currentTrack) return null;

  const imageSrc = getBestImage(currentTrack);

  return (
    <div className="bg-black border-t border-white/5 px-4 pt-4 pb-2 animate-in slide-in-from-bottom duration-500 z-[70]">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        
        {/* Top Row: Info, Controls, and Dismissal */}
        <div className="flex items-center justify-between relative">
          
          {/* Left: Metadata & Heart */}
          <div className="flex items-center gap-3 min-w-0 max-w-[40%]">
            <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-[#282828] shrink-0 border border-white/5">
              {imageSrc ? (
                <Image 
                  src={imageSrc} 
                  alt={currentTrack.name} 
                  fill 
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Music2 className="h-6 w-6 text-[#b3b3b3]" />
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0 mr-2">
              <span className="text-sm font-black text-white truncate italic uppercase tracking-tighter leading-none max-w-[50px]">
                {decodeEntities(currentTrack.name).substring(0, 1)}..
              </span>
              <span className="text-[10px] text-neutral-500 truncate uppercase font-black tracking-widest mt-1 max-w-[40px]">
                {currentTrack.artists.primary[0]?.name.substring(0, 1)}...
              </span>
            </div>
            <button 
              className="text-neutral-500 hover:text-primary transition-colors h-8 w-8 shrink-0"
              onClick={() => toggleLike(currentTrack)}
            >
              <Heart className={cn("h-5 w-5", isLiked(currentTrack.id) && "fill-primary text-primary")} />
            </button>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            <button className="text-neutral-600 hover:text-white" onClick={prevTrack}>
              <SkipBack className="h-5 w-5 fill-current" />
            </button>
            <button 
              onClick={togglePlay} 
              className="bg-primary text-black rounded-full h-12 w-12 p-0 flex items-center justify-center shadow-[0_0_20px_rgba(255,0,0,0.3)] shrink-0 transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-0.5" />}
            </button>
            <button className="text-neutral-600 hover:text-white" onClick={nextTrack}>
              <SkipForward className="h-5 w-5 fill-current" />
            </button>
          </div>

          {/* Right: X Button */}
          <button 
            className="text-neutral-800 hover:text-primary transition-colors h-10 w-10 flex justify-end items-center"
            onClick={(e) => {
              e.stopPropagation();
              stopTrack();
            }}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Bottom Row: Seek Bar with Flanking Timestamps */}
        <div className="flex items-center justify-center w-full px-8 pb-2">
          <div className="flex items-center gap-3 w-full max-w-[320px]">
            <span className="text-[10px] font-black text-neutral-600 w-8 text-right tabular-nums">
              {formatDuration(progress)}
            </span>
            <div className="flex-1 relative py-1">
              <Slider
                value={[progress]}
                max={duration || 100}
                step={0.1}
                onValueChange={(vals) => {
                  setIsScrubbing(true);
                  seek(vals[0]);
                }}
                onValueCommit={() => {
                  setIsScrubbing(false);
                }}
                className="cursor-pointer"
              />
            </div>
            <span className="text-[10px] font-black text-neutral-600 w-8 tabular-nums">
              {formatDuration(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
