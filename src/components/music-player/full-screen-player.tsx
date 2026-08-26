'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronDown, MoreHorizontal, Download, Loader2, Heart, Music2, X } from 'lucide-react';
import { useMusic, useMusicProgress } from './player-context';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { getBestImage, formatDuration, getBestDownload, decodeEntities } from '@/lib/music-api';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export function FullScreenPlayer() {
  const { 
    currentTrack, isPlaying, isBuffering, isPlayerOpen, setIsPlayerOpen, 
    togglePlay, nextTrack, prevTrack, toggleLike, isLiked, stopTrack
  } = useMusic();
  const { progress, duration, seek, setIsScrubbing } = useMusicProgress();

  if (!isPlayerOpen || !currentTrack) return null;

  const imageSrc = getBestImage(currentTrack);
  const trackName = decodeEntities(currentTrack.name);
  const artistNames = currentTrack.artists.primary.map(a => decodeEntities(a.name)).join(', ');

  const handleClose = () => {
    stopTrack();
    setIsPlayerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#0a0a0a] flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
      {/* High-fidelity Header */}
      <header className="flex items-center justify-between p-6 z-10 shrink-0 relative">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsPlayerOpen(false)} 
          className="text-white hover:bg-white/5"
        >
          <ChevronDown className="h-6 w-6" />
        </Button>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/5">
                <MoreHorizontal className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#1a1a1a] text-white border-white/5" align="end">
              <DropdownMenuItem onClick={() => { const u = getBestDownload(currentTrack); if(u) window.open(u, '_blank'); }}>
                <Download className="mr-3 h-4 w-4" /> Download
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Explicit Top-Right Close Button */}
          <button 
            onClick={handleClose} 
            className="close-btn !relative !top-0 !right-0 ml-2"
            aria-label="Close track"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-8 space-y-12">
        <div className="relative aspect-square w-full max-w-[340px] rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.8)] bg-neutral-900 border border-white/5">
          {imageSrc ? (
            <img src={imageSrc} className={cn("w-full h-full object-cover", isBuffering && "opacity-50")} alt="" />
          ) : (
            <Music2 className="h-24 w-24 text-neutral-800" />
          )}
          {isBuffering && <Loader2 className="absolute inset-0 m-auto h-16 w-16 text-primary animate-spin" />}
        </div>

        <div className="w-full max-w-[340px] space-y-10 text-center md:text-left">
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white truncate">{trackName}</h2>
              <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mt-2 truncate">{artistNames}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => toggleLike(currentTrack)} className="text-neutral-500 hover:text-primary">
              <Heart className={cn("h-7 w-7", isLiked(currentTrack.id) && "fill-primary text-primary")} />
            </Button>
          </div>

          <div className="space-y-6">
            <Slider 
              value={[progress]} 
              max={duration || 100} 
              step={0.1} 
              onValueChange={v => {
                setIsScrubbing(true);
                seek(v[0]);
              }} 
              onValueCommit={() => {
                setIsScrubbing(false);
              }}
              className="cursor-pointer seek-bar"
            />
            <div className="flex justify-between text-[11px] font-black text-neutral-500 uppercase tracking-widest">
              <span>{formatDuration(progress)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 p-12 bg-gradient-to-t from-black to-transparent">
        <div className="flex items-center justify-center gap-12">
          <Button variant="ghost" size="icon" onClick={prevTrack} className="text-white hover:text-primary h-14 w-14 transition-transform active:scale-90">
            <SkipBack fill="currentColor" className="h-8 w-8" />
          </Button>
          <Button onClick={togglePlay} className="bg-white text-black rounded-full h-20 w-20 shadow-2xl transition-transform hover:scale-105 active:scale-90 p-0 flex items-center justify-center">
            {isBuffering ? <Loader2 className="h-8 w-8 animate-spin" /> : isPlaying ? <Pause fill="currentColor" className="h-10 w-10" /> : <Play fill="currentColor" className="h-10 w-10 ml-2" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={nextTrack} className="text-white hover:text-primary h-14 w-14 transition-transform active:scale-90">
            <SkipForward fill="currentColor" className="h-8 w-8" />
          </Button>
        </div>
      </div>
    </div>
  );
}
