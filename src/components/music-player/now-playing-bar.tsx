'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Mic2, ListMusic, Maximize2, Heart, Music2, X } from 'lucide-react';
import { useMusic } from './player-context';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { getBestImage, getArtistNames, formatDuration } from '@/lib/music-api';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function NowPlayingBar() {
  const { 
    currentTrack, isPlaying, togglePlay, nextTrack, prevTrack, 
    progress, duration, seek, volume, setVolume, toggleLike, isLiked,
    setIsPlayerOpen, stopTrack 
  } = useMusic();

  if (!currentTrack) return null;

  const imageSrc = getBestImage(currentTrack);
  const liked = isLiked(currentTrack.id);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 glass-effect border-t border-white/5 px-6 flex items-center justify-between z-50 group">
      {/* Track Info */}
      <div 
        className="flex items-center gap-4 w-[30%] min-w-0 cursor-pointer"
        onClick={() => setIsPlayerOpen(true)}
      >
        <div className="relative h-14 w-14 rounded-md overflow-hidden shadow-2xl bg-neutral-900 shrink-0 border border-white/5">
          {imageSrc ? (
            <Image 
              src={imageSrc} 
              alt={currentTrack.name} 
              fill 
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Music2 className="h-6 w-6 text-neutral-600" />
            </div>
          )}
        </div>
        <div className="flex flex-col min-w-0 pr-4">
          <span className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate">
            {currentTrack.name}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            {getArtistNames(currentTrack)}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "shrink-0 transition-colors",
            liked ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-white"
          )}
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(currentTrack);
          }}
        >
          <Heart className={cn("h-5 w-5", liked && "fill-current")} />
        </Button>
      </div>

      {/* Main Controls */}
      <div className="flex flex-col items-center gap-2 max-w-[40%] w-full px-4">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white transition-all scale-90">
            <Shuffle className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:scale-110 transition-transform" onClick={prevTrack}>
            <SkipBack className="h-5 w-5 fill-white" />
          </Button>
          <Button 
            className="bg-white text-black rounded-full h-10 w-10 hover:scale-110 p-0 shadow-lg transition-transform"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-6 w-6 fill-black" /> : <Play className="h-6 w-6 fill-black ml-1" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:scale-110 transition-transform" onClick={nextTrack}>
            <SkipForward className="h-5 w-5 fill-white" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white transition-all scale-90">
            <Repeat className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-3 w-full max-w-lg">
          <span className="text-[10px] text-muted-foreground w-10 text-right font-mono">
            {formatDuration(progress)}
          </span>
          <Slider
            value={[progress]}
            max={duration || 100}
            step={0.1}
            onValueChange={(vals) => seek(vals[0])}
            className="flex-1 cursor-pointer"
          />
          <span className="text-[10px] text-muted-foreground w-10 font-mono">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* Extra Controls */}
      <div className="flex items-center justify-end gap-3 w-[30%]">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-white transition-all scale-90"
          onClick={() => setIsPlayerOpen(true)}
        >
          <Mic2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white transition-all scale-90">
          <ListMusic className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 w-28 group ml-2">
          <Volume2 className="h-4 w-4 text-muted-foreground group-hover:text-white shrink-0" />
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={(vals) => setVolume(vals[0] / 100)}
            className="cursor-pointer"
          />
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-white transition-all scale-90"
          onClick={() => setIsPlayerOpen(true)}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-primary transition-all scale-90 ml-1"
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
