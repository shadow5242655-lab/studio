'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music2 } from 'lucide-react';
import { useMusic, useMusicProgress } from './player-context';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { getBestImage, getArtistNames, formatDuration } from '@/lib/music-api';
import Image from 'next/image';

export function NowPlayingBar() {
  const { currentTrack, isPlaying, togglePlay, nextTrack, prevTrack, setIsPlayerOpen } = useMusic();
  const { progress, duration, volume, setVolume, seek } = useMusicProgress();

  if (!currentTrack) return null;

  const imageSrc = getBestImage(currentTrack);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-black border-t border-white/10 px-4 flex items-center justify-between z-50">
      {/* Track Info */}
      <div 
        className="flex items-center gap-3 w-[30%] min-w-0 cursor-pointer"
        onClick={() => setIsPlayerOpen(true)}
      >
        <div className="relative h-12 w-12 rounded overflow-hidden bg-neutral-900 shrink-0">
          {imageSrc ? (
            <Image src={imageSrc} alt={currentTrack.name} fill className="object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Music2 className="h-5 w-5 text-neutral-600" />
            </div>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-white truncate">{currentTrack.name}</span>
          <span className="text-xs text-neutral-400 truncate">{getArtistNames(currentTrack)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-1 flex-1 max-w-xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white" onClick={prevTrack}>
            <SkipBack className="h-5 w-5 fill-current" />
          </Button>
          <Button 
            className="bg-white text-black rounded-full h-8 w-8 p-0 hover:scale-105"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white" onClick={nextTrack}>
            <SkipForward className="h-5 w-5 fill-current" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2 w-full">
          <span className="text-[10px] text-neutral-400 w-8 text-right">{formatDuration(progress)}</span>
          <Slider
            value={[progress]}
            max={duration || 100}
            step={1}
            onValueChange={(vals) => seek(vals[0])}
            className="flex-1"
          />
          <span className="text-[10px] text-neutral-400 w-8">{formatDuration(duration)}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center justify-end gap-2 w-[30%]">
        <Volume2 className="h-4 w-4 text-neutral-400" />
        <Slider
          value={[volume * 100]}
          max={100}
          step={1}
          onValueChange={(vals) => setVolume(vals[0] / 100)}
          className="w-24"
        />
      </div>
    </div>
  );
}
