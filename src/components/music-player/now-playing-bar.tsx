
'use client';

import React from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, 
  Music2, Heart, X
} from 'lucide-react';
import { useMusic, useMusicProgress } from './player-context';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { getBestImage, decodeEntities, formatDuration } from '@/lib/music-api';
import Image from 'next/image';
import { cn } from '@/lib/utils';

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
      {/* Spotify-Style Close Button - Top Right */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          stopTrack();
        }}
        className="close-btn"
        aria-label="Close track"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Track Info (Left) */}
        <div 
          className="flex items-center gap-3 w-1/3 min-w-0 cursor-pointer"
          onClick={() => setIsPlayerOpen(true)}
        >
          <div className="relative h-14 w-14 rounded-md overflow-hidden bg-[#282828] shrink-0">
            {imageSrc ? (
              <Image src={imageSrc} alt="" fill className="object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Music2 className="h-6 w-6 text-[#b3b3b3]" />
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-white truncate hover:underline">
              {decodeEntities(currentTrack.name)}
            </span>
            <span className="text-[11px] text-[#b3b3b3] truncate hover:underline mt-0.5">
              {currentTrack.artists.primary.map(a => decodeEntities(a.name)).join(', ')}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-[#b3b3b3] hover:text-white shrink-0 ml-2"
            onClick={(e) => { e.stopPropagation(); toggleLike(currentTrack); }}
          >
            <Heart className={cn("h-4 w-4", isLiked(currentTrack.id) && "fill-primary text-primary")} />
          </Button>
        </div>

        {/* Center Controls & Progress (Center) */}
        <div className="flex flex-col items-center flex-1 max-w-[40%]">
          <div className="flex items-center gap-6 mb-2">
            <Button variant="ghost" size="icon" className="text-[#b3b3b3] hover:text-white h-8 w-8" onClick={prevTrack}>
              <SkipBack className="h-4 w-4 fill-current" />
            </Button>
            <Button 
              className="bg-white text-black rounded-full h-8 w-8 p-0 hover:scale-105 transition-transform"
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
            </Button>
            <Button variant="ghost" size="icon" className="text-[#b3b3b3] hover:text-white h-8 w-8" onClick={nextTrack}>
              <SkipForward className="h-4 w-4 fill-current" />
            </Button>
          </div>
          
          <div className="w-full flex items-center gap-2">
            <span className="text-[10px] text-[#b3b3b3] w-8 text-right">{formatDuration(progress)}</span>
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
            <span className="text-[10px] text-[#b3b3b3] w-8">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* volume alignment */}
        <div className="w-1/3 hidden md:block" />
      </div>
    </div>
  );
}
