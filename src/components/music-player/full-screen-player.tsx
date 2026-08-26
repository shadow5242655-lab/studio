'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronDown, MoreHorizontal, Download, Loader2, Heart, Music2 } from 'lucide-react';
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
    togglePlay, nextTrack, prevTrack, toggleLike, isLiked 
  } = useMusic();
  const { progress, duration, seek } = useMusicProgress();

  if (!isPlayerOpen || !currentTrack) return null;

  const imageSrc = getBestImage(currentTrack);
  const trackName = decodeEntities(currentTrack.name);
  const artistNames = currentTrack.artists.primary.map(a => decodeEntities(a.name)).join(', ');

  return (
    <div className="fixed inset-0 z-[60] bg-[#121212] flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
      <header className="flex items-center justify-between p-6 z-10 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => setIsPlayerOpen(false)} className="text-white"><ChevronDown /></Button>
        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-neutral-500">Playing Now</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="text-white"><MoreHorizontal /></Button></DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#1e1e1e] text-white border-white/10" align="end">
            <DropdownMenuItem onClick={() => { const u = getBestDownload(currentTrack); if(u) window.open(u, '_blank'); }}><Download className="mr-2 h-4 w-4" /> Download</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-8 space-y-12">
        <div className="relative aspect-square w-full max-w-[320px] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-[#1e1e1e]">
          {imageSrc ? <img src={imageSrc} className={cn("w-full h-full object-cover", isBuffering && "opacity-50")} alt="" /> : <Music2 className="h-20 w-20 text-neutral-800" />}
          {isBuffering && <Loader2 className="absolute inset-0 m-auto h-12 w-12 text-primary animate-spin" />}
        </div>

        <div className="w-full max-w-[320px] space-y-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-white truncate">{trackName}</h2>
              <p className="text-sm text-neutral-500 truncate uppercase mt-1">{artistNames}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => toggleLike(currentTrack)} className="text-neutral-500"><Heart className={cn(isLiked(currentTrack.id) && "fill-primary text-primary")} /></Button>
          </div>

          <div className="space-y-4">
            <Slider 
              value={[progress]} 
              max={duration || 100} 
              step={0.1} 
              onValueChange={v => seek(v[0])} 
              className="cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-bold text-neutral-500">
              <span>{formatDuration(progress)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 p-10 bg-gradient-to-t from-black to-transparent">
        <div className="flex items-center justify-center gap-10">
          <Button variant="ghost" size="icon" onClick={prevTrack} className="text-white h-12 w-12"><SkipBack fill="currentColor" className="h-6 w-6" /></Button>
          <Button onClick={togglePlay} className="bg-white text-black rounded-full h-16 w-16 shadow-xl transition-transform active:scale-90">
            {isBuffering ? <Loader2 className="h-6 w-6 animate-spin" /> : isPlaying ? <Pause fill="currentColor" className="h-7 w-7" /> : <Play fill="currentColor" className="h-7 w-7" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={nextTrack} className="text-white h-12 w-12"><SkipForward fill="currentColor" className="h-6 w-6" /></Button>
        </div>
      </div>
    </div>
  );
}