
'use client';

import React from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, 
  Music2, Download, Loader2, Mic2, X
} from 'lucide-react';
import { useMusic, useMusicProgress } from './player-context';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { getBestImage, getBestDownload, decodeEntities } from '@/lib/music-api';
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
      "fixed left-0 right-0 h-20 bg-black/95 backdrop-blur-xl border-t border-white/5 px-4 flex items-center justify-between z-50 transition-all duration-300",
      "bottom-16" 
    )}>
      {/* High-fidelity Seek Bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px]">
        <Slider
          value={[progress]}
          max={duration || 100}
          step={0.1}
          onValueChange={(vals) => seek(vals[0])}
          className="w-full absolute -top-[5px] cursor-pointer"
        />
      </div>

      <div 
        className="flex items-center gap-3 w-[40%] min-w-0 cursor-pointer lag-free-tap"
        onClick={() => setIsPlayerOpen(true)}
      >
        <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-neutral-900 shrink-0 border border-white/5 shadow-lg">
          {imageSrc ? (
            <Image src={imageSrc} alt="" fill className="object-cover" />
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
          <span className="text-xs font-bold text-white truncate italic uppercase tracking-tight">
            {decodeEntities(currentTrack.name)}
          </span>
          <span className="text-[9px] text-neutral-500 truncate uppercase font-bold tracking-widest mt-0.5">
            {currentTrack.artists.primary.map(a => decodeEntities(a.name)).join(', ')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white lag-free-tap w-8 h-8 md:w-10 md:h-10" 
          onClick={(e) => { 
            e.stopPropagation(); 
            prevTrack(); 
          }}
        >
          <SkipBack className="h-4 w-4 fill-current" />
        </Button>

        <Button 
          className="bg-white text-black rounded-full h-10 w-10 md:h-12 md:w-12 p-0 shadow-lg lag-free-tap hover:scale-105"
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
            <Play className="h-5 w-5 fill-current" />
          )}
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white lag-free-tap w-8 h-8 md:w-10 md:h-10" 
          onClick={(e) => { 
            e.stopPropagation(); 
            nextTrack(); 
          }}
        >
          <SkipForward className="h-4 w-4 fill-current" />
        </Button>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
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
        
        {/* The requested Close/Stop Cross icon */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-neutral-500 hover:text-primary lag-free-tap h-10 w-10"
          onClick={(e) => {
            e.stopPropagation();
            stopTrack();
          }}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
