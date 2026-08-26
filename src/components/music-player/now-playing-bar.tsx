'use client';

import React from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, 
  Music2, Heart, X, Maximize2
} from 'lucide-react';
import { useMusic, useMusicProgress } from './player-context';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { getBestImage, decodeEntities, formatDuration } from '@/lib/music-api';
import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * @fileOverview High-fidelity mini-player anchored at the bottom.
 * The ✕ button here stops the music completely.
 */

export function NowPlayingBar() {
  const { 
    currentTrack, isPlaying, isBuffering, togglePlay, nextTrack, prevTrack, 
    setIsPlayerOpen, stopTrack, toggleLike, isLiked
  } = useMusic();
  const { progress, duration, seek, setIsScrubbing } = useMusicProgress();

  if (!currentTrack) return null;

  const imageSrc = getBestImage(currentTrack);

  return (
    <div className={cn(
      "fixed left-0 right-0 h-24 bg-black border-t border-white/5 px-4 flex items-center z-50",
      "bottom-16" 
    )}>
      {/* Spotify-Style Stop Control */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          stopTrack(); // Stops music and clears mini-player
        }}
        className="close-btn top-2 right-4"
        aria-label="Dismiss resonance"
      >
        <X className="h-5 w-5 text-neutral-500 hover:text-primary transition-colors" />
      </button>

      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Track Info (Left) */}
        <div 
          className="flex items-center gap-3 w-1/3 min-w-0 cursor-pointer group"
          onClick={() => setIsPlayerOpen(true)}
        >
          <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-[#282828] shrink-0 border border-white/5">
            {imageSrc ? (
              <Image src={imageSrc} alt="" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Music2 className="h-6 w-6 text-[#b3b3b3]" />
              </div>
            )}
            {isBuffering && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-white truncate group-hover:underline italic uppercase tracking-tight">
              {decodeEntities(currentTrack.name)}
            </span>
            <span className="text-[10px] text-neutral-500 truncate uppercase font-black tracking-widest mt-0.5">
              {currentTrack.artists.primary.map(a => decodeEntities(a.name)).join(', ')}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-[#b3b3b3] hover:text-primary shrink-0 ml-2"
            onClick={(e) => { e.stopPropagation(); toggleLike(currentTrack); }}
          >
            <Heart className={cn("h-4 w-4 transition-all", isLiked(currentTrack.id) && "fill-primary text-primary scale-110")} />
          </Button>
        </div>

        {/* Functional Red Range Center Control */}
        <div className="flex flex-col items-center flex-1 max-w-[45%]">
          <div className="flex items-center gap-6 mb-2">
            <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-white h-8 w-8" onClick={prevTrack}>
              <SkipBack className="h-5 w-5 fill-current" />
            </Button>
            <Button 
              className="bg-white text-black rounded-full h-9 w-9 p-0 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center shadow-lg"
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            >
              {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
            </Button>
            <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-white h-8 w-8" onClick={nextTrack}>
              <SkipForward className="h-5 w-5 fill-current" />
            </Button>
          </div>
          
          <div className="w-full flex items-center gap-2 px-2">
            <span className="text-[9px] font-black text-neutral-600 w-8 text-right tabular-nums">{formatDuration(progress)}</span>
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
              className="flex-1"
            />
            <span className="text-[9px] font-black text-neutral-600 w-8 tabular-nums">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Action Controls (Right) */}
        <div className="w-1/3 flex items-center justify-end gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-neutral-500 hover:text-white hidden md:flex"
            onClick={() => setIsPlayerOpen(true)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
