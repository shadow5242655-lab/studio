'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Heart, Music2, MoreHorizontal, Download, PlusCircle, X } from 'lucide-react';
import { useMusic, useMusicProgress } from './player-context';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { getBestImage, getArtistNames, formatDuration, getBestDownload } from '@/lib/music-api';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';

export function FullScreenPlayer() {
  const { 
    currentTrack, isPlaying, isPlayerOpen, setIsPlayerOpen, 
    togglePlay, nextTrack, prevTrack, toggleLike, isLiked, playlists, addToPlaylist 
  } = useMusic();

  const { progress, duration, seek } = useMusicProgress();

  if (!isPlayerOpen || !currentTrack) return null;

  const imageSrc = getBestImage(currentTrack);
  const liked = isLiked(currentTrack.id);

  const handleDownload = () => {
    const url = getBestDownload(currentTrack);
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentTrack.name} - ${getArtistNames(currentTrack)}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        {imageSrc ? (
          <Image src={imageSrc} alt="bg" fill className="object-cover opacity-30 blur-[100px] scale-150" priority />
        ) : (
          <div className="h-full w-full bg-neutral-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
      </div>
      
      <header className="relative flex items-center justify-between p-6 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
             <Music2 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] uppercase font-black tracking-[0.4em] text-white/40 leading-none">High Fidelity</span>
            <span className="text-sm font-black text-white italic tracking-tighter uppercase leading-none">AYUMUSIC</span>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-12 w-12 rounded-full transition-all touch-feedback", liked ? "text-primary bg-white/5" : "text-white/40 hover:text-white")}
            onClick={() => toggleLike(currentTrack)}
          >
            <Heart className={cn("h-6 w-6", liked && "fill-current")} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white/40 hover:text-white rounded-full h-12 w-12 touch-feedback">
                <MoreHorizontal className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-neutral-900 border-white/10 text-white w-64 backdrop-blur-xl">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-3 py-3"><PlusCircle className="h-4 w-4" />Add to Playlist</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="bg-neutral-900 border-white/10 text-white">
                  {playlists.map(p => (
                    <DropdownMenuItem key={p.id} onClick={() => addToPlaylist(p.id, currentTrack)}>{p.name}</DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem onClick={handleDownload} className="gap-3 py-3"><Download className="h-4 w-4" />Download Track</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/10 rounded-full h-12 w-12 touch-feedback ml-2"
            onClick={() => setIsPlayerOpen(false)}
          >
            <X className="h-8 w-8" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 relative z-10 min-h-0">
        <div className="w-full flex-1 flex flex-col items-center justify-center min-h-0">
          <div className="w-full max-w-[280px] md:max-w-[420px] aspect-square relative shadow-2xl rounded-3xl overflow-hidden border border-white/10 bg-neutral-900 flex-shrink transition-all mb-8 md:mb-12">
            {imageSrc ? (
              <Image src={imageSrc} alt={currentTrack.name} fill className="object-cover" priority />
            ) : (
              <div className="h-full w-full flex items-center justify-center"><Music2 className="h-24 w-24 text-neutral-800" /></div>
            )}
          </div>

          <div className="w-full text-center space-y-2 shrink-0">
            <h2 className="text-3xl md:text-6xl font-black text-white tracking-tighter italic uppercase leading-none truncate px-4">{currentTrack.name}</h2>
            <p className="text-sm md:text-2xl text-primary font-bold uppercase truncate opacity-80 italic">{getArtistNames(currentTrack)}</p>
          </div>
        </div>

        <div className="w-full max-w-2xl mx-auto px-4 space-y-6 shrink-0 pb-12">
          <div className="space-y-2">
            <Slider value={[progress]} max={duration || 100} step={0.1} onValueChange={(vals) => seek(vals[0])} className="py-4" />
            <div className="flex items-center justify-between text-[10px] font-black tracking-[0.2em] text-neutral-500 italic">
              <span>{formatDuration(progress)}</span><span>{formatDuration(duration)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between px-2">
            <div className="w-10" />
            <div className="flex items-center gap-6 md:gap-12">
              <Button variant="ghost" size="icon" className="text-white h-12 w-12 touch-feedback hover:scale-110 active:scale-90" onClick={prevTrack}><SkipBack className="h-8 w-8 fill-white" /></Button>
              <Button className="bg-primary text-white rounded-full h-20 w-20 md:h-24 md:w-24 touch-feedback shadow-2xl border-4 border-white/10 hover:scale-105 active:scale-95" onClick={togglePlay}>
                {isPlaying ? <Pause className="h-8 w-8 md:h-10 md:w-10 fill-white" /> : <Play className="h-8 w-8 md:h-10 md:w-10 fill-white ml-1" />}
              </Button>
              <Button variant="ghost" size="icon" className="text-white h-12 w-12 touch-feedback hover:scale-110 active:scale-90" onClick={nextTrack}><SkipForward className="h-8 w-8 fill-white" /></Button>
            </div>
            <Button variant="ghost" size="icon" className="text-white/20 h-10 w-10 touch-feedback"><Repeat className="h-5 w-5" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
