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
 * Re-architected to match the center-control layout with red seek line below.
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
    <div className="bg-black border-t border-white/5 px-6 py-4 animate-in slide-in-from-bottom duration-500 z-[70]">
      <div className="max-w-7xl mx-auto flex items-center justify-between relative">
        
        {/* Left: Metadata & Heart */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-[#282828] shrink-0 shadow-2xl border border-white/5">
            {imageSrc ? (
              <Image 
                src={imageSrc} 
                alt={currentTrack.name} 
                fill 
                className="object-cover"
                sizes="56px"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Music2 className="h-7 w-7 text-[#b3b3b3]" />
              </div>
            )}
            {isBuffering && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0 pr-4">
            <span className="text-base font-black text-white truncate italic uppercase tracking-tighter leading-tight">
              {decodeEntities(currentTrack.name)}
            </span>
            <span className="text-[10px] text-neutral-500 truncate uppercase font-black tracking-widest mt-1">
              {currentTrack.artists.primary.map(a => decodeEntities(a.name)).join(', ')}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-neutral-500 hover:text-primary transition-colors h-8 w-8 shrink-0"
            onClick={() => toggleLike(currentTrack)}
          >
            <Heart className={cn("h-5 w-5 transition-all", isLiked(currentTrack.id) && "fill-primary text-primary scale-110")} />
          </Button>
        </div>

        {/* Center: Controls & Seek Resonance */}
        <div className="flex flex-col items-center gap-3 flex-1 min-w-[300px]">
          <div className="flex items-center gap-8">
            <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-white" onClick={prevTrack}>
              <SkipBack className="h-6 w-6 fill-current" />
            </Button>
            <Button 
              onClick={togglePlay} 
              className="bg-white text-black rounded-full h-11 w-11 p-0 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center shadow-2xl shrink-0"
            >
              {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-0.5" />}
            </Button>
            <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-white" onClick={nextTrack}>
              <SkipForward className="h-6 w-6 fill-current" />
            </Button>
          </div>
          
          <div className="flex items-center gap-3 w-full max-w-[280px]">
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

        {/* Right: Dismissal Node */}
        <div className="flex items-center justify-end flex-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-neutral-700 hover:text-primary transition-colors h-10 w-10"
            onClick={(e) => {
              e.stopPropagation();
              stopTrack();
            }}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
