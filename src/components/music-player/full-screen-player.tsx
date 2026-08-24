'use client';

import React from 'react';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Heart, Music2, Share2, MoreHorizontal, ListMusic, Download, PlusCircle, X } from 'lucide-react';
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
    seek, toggleLike, isLiked, playlists, addToPlaylist, stopTrack 
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
    <div className="fixed inset-0 z-[60] bg-neutral-950 flex flex-col animate-in slide-in-from-bottom duration-500">
      {/* Dynamic Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-black pointer-events-none opacity-50" />
      
      {/* Header */}
      <header className="relative flex items-center justify-between p-6 z-10">
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/10"
            onClick={() => setIsPlayerOpen(false)}
          >
            <ChevronDown className="h-8 w-8" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary hover:bg-primary/10"
            onClick={stopTrack}
          >
            <X className="h-8 w-8" />
          </Button>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/60">Playing on AYUMUSIC</span>
          <span className="text-sm font-bold text-white truncate max-w-[200px]">Premium Sound</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <MoreHorizontal className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-neutral-900 border-white/10 text-white w-56">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-3">
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
            <DropdownMenuItem onClick={handleDownload} className="gap-3">
              <Download className="h-4 w-4" />
              Download Track
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-12 px-8 max-w-6xl mx-auto w-full relative z-10 overflow-hidden py-8">
        {/* Large Artwork */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <div className="relative aspect-square w-full max-w-[450px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] rounded-xl overflow-hidden border border-white/10">
            {imageSrc ? (
              <Image 
                src={imageSrc} 
                alt={currentTrack.name} 
                fill 
                className="object-cover"
                priority
              />
            ) : (
              <div className="h-full w-full bg-neutral-900 flex items-center justify-center">
                <Music2 className="h-32 w-32 text-neutral-800" />
              </div>
            )}
          </div>
        </div>

        {/* Info & Controls & Lyrics */}
        <div className="w-full md:w-1/2 flex flex-col justify-center gap-8 min-w-0">
          {/* Track Labels */}
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2 truncate">
                {currentTrack.name}
              </h2>
              <p className="text-lg md:text-xl text-white/60 font-bold truncate">
                {getArtistNames(currentTrack)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-12 w-12 text-white/40 hover:text-white"
                onClick={handleDownload}
              >
                <Download className="h-8 w-8" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "h-12 w-12 transition-all",
                  liked ? "text-primary hover:text-primary/80" : "text-white/40 hover:text-white"
                )}
                onClick={() => toggleLike(currentTrack)}
              >
                <Heart className={cn("h-8 w-8", liked && "fill-current")} />
              </Button>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Slider
                value={[progress]}
                max={duration || 100}
                step={0.1}
                onValueChange={(vals) => seek(vals[0])}
                className="cursor-pointer"
              />
              <div className="flex items-center justify-between text-xs font-mono text-white/40">
                <span>{formatDuration(progress)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between px-4">
              <Button variant="ghost" size="icon" className="text-white/40 hover:text-white">
                <Shuffle className="h-6 w-6" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white h-12 w-12"
                onClick={prevTrack}
              >
                <SkipBack className="h-8 w-8 fill-white" />
              </Button>
              <Button 
                className="bg-white text-black rounded-full h-20 w-20 hover:scale-105 transition-transform shadow-2xl"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-10 w-10 fill-black" /> : <Play className="h-10 w-10 fill-black ml-1" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white h-12 w-12"
                onClick={nextTrack}
              >
                <SkipForward className="h-8 w-8 fill-white" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white/40 hover:text-white">
                <Repeat className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Lyrics Preview */}
          <div className="bg-white/5 rounded-2xl p-6 h-[200px] overflow-y-auto custom-scrollbar border border-white/5">
            <h3 className="text-[10px] uppercase font-black tracking-widest text-white/40 mb-4">Lyrics</h3>
            <div className="space-y-2">
              <p className="text-lg font-bold text-white leading-tight">Syncing lyrics with AYUMUSIC...</p>
              <p className="text-lg font-bold text-white/20">The definitive sound experience.</p>
              <p className="text-lg font-bold text-white/20">High-fidelity audio streaming.</p>
              <p className="text-lg font-bold text-white/20">Enjoy your session.</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 pt-4">
            <Button variant="ghost" className="text-white/40 hover:text-white text-xs gap-2" onClick={stopTrack}>
              <X className="h-4 w-4 mr-2 text-primary" />
              Stop Playing
            </Button>
            <div className="h-1 w-1 bg-white/20 rounded-full" />
            <Button variant="ghost" className="text-white/40 hover:text-white text-xs gap-2">
              <ListMusic className="h-4 w-4" />
              Queue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
