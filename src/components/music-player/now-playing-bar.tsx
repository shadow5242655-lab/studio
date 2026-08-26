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
 * @fileOverview Pixel-perfect Now Playing Bar matching user screenshot.
 * Metadata on the left (clickable to open full player), controls shifted right, red seek bar below.
 */

export function NowPlayingBar() {
  const { 
    currentTrack, isPlaying, isBuffering, togglePlay, nextTrack, prevTrack,
    stopTrack, toggleLike, isLiked, setIsPlayerOpen
  } = useMusic();
  const { progress, duration, seek, setIsScrubbing } = useMusicProgress();

  if (!currentTrack) return null;

  const imageSrc = getBestImage(currentTrack);

  return (
    <div className="bg-black border-t border-white/5 px-4 pt-3 pb-3 animate-in slide-in-from-bottom duration-500 z-[70]">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        
        {/* Top Row: Metadata (Left) and Controls (Right Shifted) */}
        <div className="flex items-center justify-between">
          
          {/* Left: Metadata & Heart (Clickable to open full player) */}
          <div 
            className="flex items-center gap-3 min-w-0 flex-1 pr-4 cursor-pointer group"
            onClick={() => setIsPlayerOpen(true)}
          >
            <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-[#282828] shrink-0 border border-white/5">
              {imageSrc ? (
                <Image 
                  src={imageSrc} 
                  alt={currentTrack.name} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="48px"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Music2 className="h-6 w-6 text-[#b3b3b3]" />
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-black text-white truncate italic uppercase tracking-tighter leading-none group-hover:text-primary transition-colors">
                {decodeEntities(currentTrack.name)}
              </span>
              <span className="text-[10px] text-neutral-500 truncate uppercase font-black tracking-widest mt-1">
                {currentTrack.artists.primary[0]?.name}
              </span>
            </div>
            <button 
              className="text-neutral-500 hover:text-primary transition-colors h-8 w-8 shrink-0 lag-free-tap ml-2"
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(currentTrack);
              }}
            >
              <Heart className={cn("h-4 w-4", isLiked(currentTrack.id) && "fill-primary text-primary")} />
            </button>
          </div>

          {/* Right: Playback Controls & Dismissal */}
          <div className="flex items-center gap-6 shrink-0">
            <div className="flex items-center gap-4 sm:gap-6">
              <button className="text-neutral-600 hover:text-white lag-free-tap" onClick={prevTrack}>
                <SkipBack className="h-5 w-5 fill-current" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
                className="bg-primary text-black rounded-full h-11 w-11 sm:h-12 sm:w-12 p-0 flex items-center justify-center shadow-[0_0_20px_rgba(255,0,0,0.3)] shrink-0 transition-transform active:scale-95 lag-free-tap"
              >
                {isPlaying ? <Pause className="h-5 w-5 sm:h-6 sm:w-6 fill-current" /> : <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-current ml-0.5" />}
              </button>
              <button className="text-neutral-600 hover:text-white lag-free-tap" onClick={nextTrack}>
                <SkipForward className="h-5 w-5 fill-current" />
              </button>
            </div>
            
            <button 
              className="text-neutral-800 hover:text-primary transition-colors h-10 w-10 flex justify-end items-center lag-free-tap"
              onClick={(e) => {
                e.stopPropagation();
                stopTrack();
              }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Bottom Row: Red Seek Bar with Flanking Timestamps */}
        <div className="flex items-center justify-center w-full px-1">
          <div className="flex items-center gap-3 w-full max-w-full">
            <span className="text-[9px] font-black text-neutral-600 w-8 text-right tabular-nums">
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
            <span className="text-[9px] font-black text-neutral-600 w-8 tabular-nums">
              {formatDuration(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
