'use client';

import React from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, 
  Music2, Download, Loader2
} from 'lucide-react';
import { useMusic, useMusicProgress } from './player-context';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { getBestImage, getBestDownload, decodeEntities, formatDuration } from '@/lib/music-api';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function NowPlayingBar() {
  const { 
    currentTrack, isPlaying, isBuffering, togglePlay, nextTrack, prevTrack, 
    setIsPlayerOpen, stopTrack 
  } = useMusic();
  const { progress, duration, seek } = useMusicProgress();

  if (!currentTrack) return null;

  const imageSrc = getBestImage(currentTrack);

  return (
    <div className={cn(
      "fixed left-0 right-0 h-28 bg-black/95 backdrop-blur-xl border-t border-white/5 px-4 flex flex-col justify-center z-50 transition-all duration-300 relative",
      "bottom-16" 
    )}>
      {/* High-fidelity Close Button (Top Right) */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          stopTrack();
        }}
        className="close-btn"
        aria-label="Close current song"
      >
        ✕
      </button>

      {/* Hardware-Stabilized Seek Bar Container */}
      <div className="w-full pt-6 px-2">
        <Slider
          value={[progress]}
          max={duration || 100}
          step={0.1}
          onValueChange={(vals) => seek(vals[0])}
          className="w-full cursor-pointer seek-bar"
        />
        <div className="flex justify-between text-[8px] font-black uppercase text-neutral-600 mt-1.5">
          <span className="current-time">{formatDuration(progress)}</span>
          <span className="total-duration">{formatDuration(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between flex-1 pb-3">
        {/* Track Metadata Info */}
        <div 
          className="flex items-center gap-3 w-[45%] min-w-0 cursor-pointer lag-free-tap"
          onClick={() => setIsPlayerOpen(true)}
        >
          <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-neutral-900 shrink-0 border border-white/5 shadow-lg">
            {imageSrc ? (
              <Image src={imageSrc} alt="" fill className="object-cover now-playing-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Music2 className="h-6 w-6 text-neutral-600" />
              </div>
            )}
            {isBuffering && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-bold text-white truncate italic uppercase tracking-tight now-playing-title">
              {decodeEntities(currentTrack.name)}
            </span>
            <span className="text-[9px] text-neutral-500 truncate uppercase font-bold tracking-widest mt-0.5 now-playing-artist">
              {currentTrack.artists.primary.map(a => decodeEntities(a.name)).join(', ')}
            </span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 md:gap-5">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white lag-free-tap w-9 h-9" 
            onClick={(e) => { 
              e.stopPropagation(); 
              prevTrack(); 
            }}
          >
            <SkipBack className="h-4 w-4 fill-current" />
          </Button>

          <Button 
            className="bg-white text-black rounded-full h-11 w-11 md:h-12 md:w-12 p-0 shadow-xl lag-free-tap hover:scale-105 active:scale-95 play-btn"
            onClick={(e) => { 
              e.stopPropagation(); 
              togglePlay(); 
            }}
          >
            {isBuffering ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current ml-1" />
            )}
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white lag-free-tap w-9 h-9" 
            onClick={(e) => { 
              e.stopPropagation(); 
              nextTrack(); 
            }}
          >
            <SkipForward className="h-4 w-4 fill-current" />
          </Button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-neutral-500 hover:text-white lag-free-tap hidden sm:flex"
            onClick={(e) => {
              e.stopPropagation();
              const u = getBestDownload(currentTrack);
              if (u) window.open(u, '_blank');
            }}
          >
            <Download className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
