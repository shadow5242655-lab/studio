'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Heart, Music2, MoreHorizontal, Download, PlusCircle, X } from 'lucide-react';
import { useMusic } from './player-context';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { getBestImage, getArtistNames, formatDuration, getBestDownload } from '@/lib/music-api';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';

export function FullScreenPlayer() {
  const { 
    currentTrack, isPlaying, isPlayerOpen, setIsPlayerOpen, 
    togglePlay, nextTrack, prevTrack, progress, duration, 
    seek, toggleLike, isLiked, playlists, addToPlaylist
  } = useMusic();

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
      {/* Immersive Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {imageSrc ? (
          <Image 
            src={imageSrc} 
            alt="background" 
            fill 
            className="object-cover opacity-30 blur-[100px] scale-150"
          />
        ) : (
          <div className="h-full w-full bg-neutral-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
      </div>
      
      {/* Header */}
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

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white/40 hover:text-white hover:bg-white/10 rounded-full h-12 w-12 touch-feedback">
                <MoreHorizontal className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-neutral-900 border-white/10 text-white w-64 backdrop-blur-xl">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-3 py-3">
                  <PlusCircle className="h-4 w-4" />
                  Add to Playlist
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="bg-neutral-900 border-white/10 text-white">
                  {playlists.map(p => (
                    <DropdownMenuItem key={p.id} onClick={() => addToPlaylist(p.id, currentTrack)}>
                      {p.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem onClick={handleDownload} className="gap-3 py-3">
                <Download className="h-4 w-4" />
                Download Track
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/10 rounded-full h-12 w-12 touch-feedback"
            onClick={() => setIsPlayerOpen(false)}
          >
            <X className="h-8 w-8" />
          </Button>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 relative z-10 min-h-0 overflow-y-auto no-scrollbar pb-8">
        {/* Image Area */}
        <div className="w-full max-w-[320px] md:max-w-[440px] aspect-square relative shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden border border-white/10 group mb-8 shrink-0">
          {imageSrc ? (
            <Image src={imageSrc} alt={currentTrack.name} fill className="object-cover" priority sizes="(max-width: 768px) 80vw, 440px" />
          ) : (
            <div className="h-full w-full bg-neutral-900 flex items-center justify-center">
              <Music2 className="h-24 w-24 text-neutral-800" />
            </div>
          )}
        </div>

        {/* Info Area */}
        <div className="w-full text-center space-y-3 mb-8 shrink-0">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter italic uppercase leading-tight line-clamp-2 px-4">
            {currentTrack.name}
          </h2>
          <p className="text-lg md:text-2xl text-primary font-bold uppercase tracking-[0.2em] truncate opacity-80 italic px-4">
            {getArtistNames(currentTrack)}
          </p>
          
          <div className="pt-4 flex justify-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-14 w-14 rounded-full transition-all border border-white/10 bg-white/5 touch-feedback",
                liked ? "text-primary border-primary/20" : "text-white/20 hover:text-white"
              )}
              onClick={() => toggleLike(currentTrack)}
            >
              <Heart className={cn("h-6 w-6", liked && "fill-current")} />
            </Button>
          </div>
        </div>

        {/* Controls Section */}
        <div className="w-full max-w-2xl mx-auto px-4 space-y-8 shrink-0">
          <div className="space-y-4">
            <Slider
              value={[progress]}
              max={duration || 100}
              step={0.1}
              onValueChange={(vals) => seek(vals[0])}
              className="cursor-pointer py-4"
            />
            <div className="flex items-center justify-between text-[11px] font-black tracking-[0.3em] text-neutral-500 font-mono italic">
              <span>{formatDuration(progress)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between px-4">
            <Button variant="ghost" size="icon" className="text-white/20 hover:text-white h-12 w-12 touch-feedback">
              <Shuffle className="h-6 w-6" />
            </Button>
            
            <div className="flex items-center gap-8 md:gap-14">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white h-14 w-14 touch-feedback"
                onClick={prevTrack}
              >
                <SkipBack className="h-9 w-9 md:h-10 md:w-10 fill-white" />
              </Button>
              
              <Button 
                className="bg-primary text-white rounded-full h-20 w-20 md:h-24 md:w-24 touch-feedback shadow-[0_0_40px_rgba(255,0,0,0.4)] border-4 border-white/10"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-10 w-10 md:h-12 md:w-12 fill-white" /> : <Play className="h-10 w-10 md:h-12 md:w-12 fill-white ml-1.5" />}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white h-14 w-14 touch-feedback"
                onClick={nextTrack}
              >
                <SkipForward className="h-9 w-9 md:h-10 md:w-10 fill-white" />
              </Button>
            </div>
            
            <Button variant="ghost" size="icon" className="text-white/20 hover:text-white h-12 w-12 touch-feedback">
              <Repeat className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
