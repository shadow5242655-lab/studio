
'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Mic2, ListMusic, Maximize2, Heart, Music2 } from 'lucide-react';
import { useMusic } from './player-context';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { getBestImage, getArtistNames, formatDuration } from '@/lib/music-api';
import Image from 'next/image';

export function NowPlayingBar() {
  const { 
    currentTrack, isPlaying, togglePlay, nextTrack, prevTrack, 
    progress, duration, seek, volume, setVolume 
  } = useMusic();

  if (!currentTrack) return null;

  const imageSrc = getBestImage(currentTrack);

  return (
    <div className="h-24 bg-black border-t border-white/5 px-4 flex items-center justify-between z-50">
      {/* Track Info */}
      <div className="flex items-center gap-4 w-[30%]">
        <div className="relative h-14 w-14 rounded overflow-hidden shadow-lg border border-white/5 bg-neutral-900 flex items-center justify-center">
          {imageSrc ? (
            <Image 
              src={imageSrc} 
              alt={currentTrack.name} 
              fill 
              className="object-cover"
            />
          ) : (
            <Music2 className="h-6 w-6 text-neutral-600" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white hover:underline cursor-pointer truncate max-w-[200px]">
            {currentTrack.name}
          </span>
          <span className="text-xs text-muted-foreground hover:text-white cursor-pointer truncate max-w-[200px]">
            {getArtistNames(currentTrack)}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary transition-colors">
          <Heart className="h-4 w-4" />
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-2 max-w-[40%] w-full">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
            <Shuffle className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:scale-105" onClick={prevTrack}>
            <SkipBack className="h-5 w-5 fill-white" />
          </Button>
          <Button 
            className="bg-white text-black rounded-full h-8 w-8 hover:scale-105 p-0"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-5 w-5 fill-black" /> : <Play className="h-5 w-5 fill-black" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:scale-105" onClick={nextTrack}>
            <SkipForward className="h-5 w-5 fill-white" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
            <Repeat className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 w-full">
          <span className="text-[10px] text-muted-foreground w-8 text-right font-mono">
            {formatDuration(progress)}
          </span>
          <Slider
            value={[progress]}
            max={duration || 100}
            step={1}
            onValueChange={(vals) => seek(vals[0])}
            className="flex-1"
          />
          <span className="text-[10px] text-muted-foreground w-8 font-mono">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* Extra Controls */}
      <div className="flex items-center justify-end gap-3 w-[30%]">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
          <Mic2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
          <ListMusic className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 w-32 group">
          <Volume2 className="h-4 w-4 text-muted-foreground group-hover:text-white" />
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={(vals) => setVolume(vals[0] / 100)}
          />
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
