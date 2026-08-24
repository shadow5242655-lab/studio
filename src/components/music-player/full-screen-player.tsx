'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronDown, Heart, Music2, MoreHorizontal, Download, PlusCircle } from 'lucide-react';
import { useMusic, useMusicProgress } from './player-context';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { getBestImage, getArtistNames, formatDuration, getBestDownload } from '@/lib/music-api';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';

export function FullScreenPlayer() {
  const { currentTrack, isPlaying, isPlayerOpen, setIsPlayerOpen, togglePlay, nextTrack, prevTrack, toggleLike, isLiked, playlists, addToPlaylist } = useMusic();
  const { progress, duration, seek } = useMusicProgress();

  if (!isPlayerOpen || !currentTrack) return null;

  const imageSrc = getBestImage(currentTrack);
  const liked = isLiked(currentTrack.id);

  const handleDownload = () => {
    const url = getBestDownload(currentTrack);
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col animate-in slide-in-from-bottom duration-300">
      <header className="flex items-center justify-between p-6">
        <Button variant="ghost" size="icon" onClick={() => setIsPlayerOpen(false)} className="text-white">
          <ChevronDown className="h-8 w-8" />
        </Button>
        <span className="text-xs font-bold tracking-widest uppercase">Now Playing</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <MoreHorizontal className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-neutral-900 border-white/10 text-white w-56">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger><PlusCircle className="mr-2 h-4 w-4" />Add to Playlist</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-neutral-900 border-white/10 text-white">
                {playlists.map(p => (
                  <DropdownMenuItem key={p.id} onClick={() => addToPlaylist(p.id, currentTrack)}>{p.name}</DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem onClick={handleDownload}><Download className="mr-2 h-4 w-4" />Download</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-8 space-y-12">
        <div className="relative aspect-square w-full max-w-sm rounded-xl overflow-hidden shadow-2xl bg-neutral-900">
          {imageSrc ? (
            <Image src={imageSrc} alt={currentTrack.name} fill className="object-cover" priority />
          ) : (
            <div className="h-full w-full flex items-center justify-center"><Music2 className="h-20 w-20 text-neutral-800" /></div>
          )}
        </div>

        <div className="w-full space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col min-w-0">
              <h2 className="text-2xl font-bold text-white truncate">{currentTrack.name}</h2>
              <p className="text-lg text-neutral-400 truncate">{getArtistNames(currentTrack)}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => toggleLike(currentTrack)}
              className={cn(liked ? "text-green-500" : "text-neutral-400")}
            >
              <Heart className={cn("h-7 w-7", liked && "fill-current")} />
            </Button>
          </div>

          <div className="space-y-2">
            <Slider 
              value={[progress]} 
              max={duration || 100} 
              step={1} 
              onValueChange={(vals) => seek(vals[0])}
              className="py-4" 
            />
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>{formatDuration(progress)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between w-full max-w-xs">
          <Button variant="ghost" size="icon" className="text-white hover:scale-110" onClick={prevTrack}>
            <SkipBack className="h-10 w-10 fill-current" />
          </Button>
          <Button 
            className="bg-white text-black rounded-full h-20 w-20 p-0 hover:scale-105" 
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-10 w-10 fill-current" /> : <Play className="h-10 w-10 fill-current" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:scale-110" onClick={nextTrack}>
            <SkipForward className="h-10 w-10 fill-current" />
          </Button>
        </div>
      </div>
    </div>
  );
}
