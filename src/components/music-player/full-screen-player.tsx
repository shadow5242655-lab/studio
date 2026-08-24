'use client';

import React, { useState } from 'react';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Heart, Music2, MoreHorizontal, Download, PlusCircle, X, Mic2, Loader2 } from 'lucide-react';
import { useMusic } from './player-context';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { getBestImage, getArtistNames, formatDuration, getBestDownload } from '@/lib/music-api';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

export function FullScreenPlayer() {
  const { 
    currentTrack, isPlaying, isPlayerOpen, setIsPlayerOpen, 
    togglePlay, nextTrack, prevTrack, progress, duration, 
    seek, toggleLike, isLiked, playlists, addToPlaylist, stopTrack,
    lyrics, loadingLyrics
  } = useMusic();

  const [showLyrics, setShowLyrics] = useState(false);

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
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-black to-black pointer-events-none" />
      
      {/* Header */}
      <header className="relative flex items-center justify-between p-6 md:p-8 z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-white/10 rounded-full h-12 w-12"
          onClick={() => setIsPlayerOpen(false)}
        >
          <ChevronDown className="h-10 w-10" />
        </Button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-black tracking-[0.3em] text-white/60">Now Playing</span>
          <span className="text-sm font-black text-white italic tracking-tighter">AYUMUSIC</span>
        </div>
        <div className="flex gap-2">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-12 w-12">
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
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 px-8 md:px-12 max-w-6xl mx-auto w-full relative z-10 overflow-hidden">
        
        {/* Visuals / Lyrics Toggle Area */}
        <div className="w-full md:w-1/2 flex items-center justify-center max-w-[400px] md:max-w-[500px]">
           {showLyrics ? (
             <Card className="w-full aspect-square bg-white/5 border-white/10 overflow-hidden relative group">
                <div className="absolute top-4 right-4 z-20">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowLyrics(false)}
                    className="bg-black/40 hover:bg-black/60 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <ScrollArea className="h-full w-full p-8 md:p-12">
                  <div className="flex flex-col gap-6 text-center">
                    {loadingLyrics ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">Fetching resonance...</p>
                      </div>
                    ) : lyrics ? (
                      lyrics.split('\n').map((line, i) => (
                        <p 
                          key={i} 
                          className="text-xl md:text-2xl font-black text-white italic tracking-tighter leading-tight transition-all duration-300 hover:text-primary"
                        >
                          {line || '...'}
                        </p>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-30">
                        <Music2 className="h-12 w-12" />
                        <p className="text-xs font-bold uppercase tracking-widest">No lyrics found for this lineage</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
             </Card>
           ) : (
             <div className="relative aspect-square w-full shadow-2xl rounded-2xl overflow-hidden border border-white/10 group">
                {imageSrc ? (
                  <Image src={imageSrc} alt={currentTrack.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" priority />
                ) : (
                  <div className="h-full w-full bg-neutral-900 flex items-center justify-center">
                    <Music2 className="h-24 w-24 text-neutral-800" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <Button 
                    variant="secondary" 
                    className="rounded-full font-black uppercase italic tracking-tighter gap-2 px-6"
                    onClick={() => setShowLyrics(true)}
                   >
                     <Mic2 className="h-4 w-4" />
                     View Lyrics
                   </Button>
                </div>
             </div>
           )}
        </div>

        {/* Information & Controls */}
        <div className="w-full md:w-1/2 flex flex-col justify-center gap-8 md:gap-12 min-w-0">
          <div className="flex items-end justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-3xl md:text-6xl font-black text-white tracking-tighter mb-2 truncate italic uppercase">
                {currentTrack.name}
              </h2>
              <p className="text-lg md:text-2xl text-primary font-bold uppercase tracking-widest truncate">
                {getArtistNames(currentTrack)}
              </p>
            </div>
            <div className="flex flex-col gap-4 ml-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "h-14 w-14 rounded-full transition-all border border-white/5 shrink-0",
                  liked ? "bg-primary/10 text-primary" : "text-white/20 hover:text-white"
                )}
                onClick={() => toggleLike(currentTrack)}
              >
                <Heart className={cn("h-8 w-8", liked && "fill-current")} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "h-14 w-14 rounded-full transition-all border border-white/5 shrink-0",
                  showLyrics ? "bg-primary text-white" : "text-white/20 hover:text-white"
                )}
                onClick={() => setShowLyrics(!showLyrics)}
              >
                <Mic2 className="h-8 w-8" />
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Slider
                value={[progress]}
                max={duration || 100}
                step={0.1}
                onValueChange={(vals) => seek(vals[0])}
                className="cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] font-bold tracking-widest text-neutral-500 font-mono">
                <span>{formatDuration(progress)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between px-2">
              <Button variant="ghost" size="icon" className="text-white/20 hover:text-white h-10 w-10">
                <Shuffle className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-6 md:gap-8">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white h-14 w-14 hover:scale-110 transition-transform"
                  onClick={prevTrack}
                >
                  <SkipBack className="h-10 w-10 fill-white" />
                </Button>
                <Button 
                  className="bg-primary text-white rounded-full h-20 w-20 md:h-24 md:w-24 hover:scale-105 transition-transform shadow-xl active:scale-95"
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause className="h-10 w-10 fill-white" /> : <Play className="h-10 w-10 fill-white ml-1.5" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white h-14 w-14 hover:scale-110 transition-transform"
                  onClick={nextTrack}
                >
                  <SkipForward className="h-10 w-10 fill-white" />
                </Button>
              </div>
              <Button variant="ghost" size="icon" className="text-white/20 hover:text-white h-10 w-10">
                <Repeat className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center pt-8 border-t border-white/5">
             <Button variant="ghost" className="text-neutral-500 hover:text-primary text-[10px] font-bold uppercase tracking-[0.2em] gap-2" onClick={stopTrack}>
              <X className="h-4 w-4" />
              Stop Playback
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
