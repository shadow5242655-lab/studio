'use client';

import React from 'react';
import { 
  Play, Pause, SkipForward, 
  Music2, Heart, X
} from 'lucide-react';
import { useMusic, useMusicProgress } from './player-context';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { getBestImage, decodeEntities, formatDuration } from '@/lib/music-api';
import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * @fileOverview High-fidelity Spotify-style Mini Player.
 * Anchored at the bottom, providing info, controls, and a functional seek bar.
 */

export function NowPlayingBar() {
  const { 
    currentTrack, isPlaying, isBuffering, togglePlay, nextTrack, 
    stopTrack, toggleLike, isLiked
  } = useMusic();
  const { progress, duration, seek, setIsScrubbing } = useMusicProgress();

  if (!currentTrack) return null;

  const imageSrc = getBestImage(currentTrack);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-[#121212] border-t border-[#282828] p-3 md:px-4 md:py-3 transition-all animate-in slide-in-from-bottom duration-500">
      {/* Universal Dismissal (Hard Stop) */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          stopTrack();
        }}
        className="absolute top-2 right-2 text-neutral-600 hover:text-primary transition-colors z-10 p-1"
        aria-label="Dismiss resonance"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="w-full max-w-7xl mx-auto space-y-2">
        {/* Top Row: Info and Primary Controls */}
        <div className="flex items-center justify-between gap-4">
          
          {/* Left: Metadata */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
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
              {isBuffering && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-white truncate italic uppercase tracking-tight">
                {decodeEntities(currentTrack.name)}
              </span>
              <span className="text-[10px] text-neutral-400 truncate uppercase font-black tracking-widest mt-0.5">
                {currentTrack.artists.primary.map(a => decodeEntities(a.name)).join(', ')}
              </span>
            </div>
          </div>

          {/* Right: Controls & Heart */}
          <div className="flex items-center gap-2 md:gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-[#b3b3b3] hover:text-primary transition-colors"
              onClick={() => toggleLike(currentTrack)}
            >
              <Heart className={cn("h-5 w-5 transition-all", isLiked(currentTrack.id) && "fill-primary text-primary scale-110")} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-neutral-400 hover:text-white" 
              onClick={nextTrack}
            >
              <SkipForward className="h-6 w-6 fill-current" />
            </Button>
            <Button 
              onClick={togglePlay} 
              className="bg-white text-black rounded-full h-10 w-10 md:h-12 md:w-12 p-0 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center shadow-lg shrink-0"
            >
              {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-0.5" />}
            </Button>
          </div>
        </div>

        {/* Bottom Row: Spotify-style Progress Bar & Timestamps */}
        <div className="flex items-center gap-3 w-full px-1">
          <span className="text-[10px] font-black text-neutral-500 w-8 text-right tabular-nums">
            {formatDuration(progress)}
          </span>
          <div className="flex-1 relative py-2">
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
          <span className="text-[10px] font-black text-neutral-500 w-8 tabular-nums">
            {formatDuration(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
