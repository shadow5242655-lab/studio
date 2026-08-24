'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Heart, Music2, MoreHorizontal, Download, PlusCircle, Loader2, Mic2, Info, X } from 'lucide-react';
import { useMusic } from './player-context';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { getBestImage, getArtistNames, formatDuration, getBestDownload } from '@/lib/music-api';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function FullScreenPlayer() {
  const { 
    currentTrack, isPlaying, isPlayerOpen, setIsPlayerOpen, 
    togglePlay, nextTrack, prevTrack, progress, duration, 
    seek, toggleLike, isLiked, playlists, addToPlaylist,
    lyrics, loadingLyrics
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
    <div className="fixed inset-0 z-[60] bg-black flex flex-col animate-in slide-in-from-bottom duration-700 overflow-hidden">
      {/* Immersive Background Layer */}
      <div className="absolute inset-0 z-0">
        {imageSrc ? (
          <Image 
            src={imageSrc} 
            alt="background" 
            fill 
            className="object-cover opacity-20 blur-[100px] scale-150"
          />
        ) : (
          <div className="h-full w-full bg-neutral-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
      </div>
      
      {/* Header */}
      <header className="relative flex items-center justify-between p-6 md:p-8 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
             <Music2 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] uppercase font-black tracking-[0.4em] text-white/40 leading-none">Architecture</span>
            <span className="text-sm font-black text-white italic tracking-tighter uppercase leading-none">AYUMUSIC</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white/40 hover:text-white hover:bg-white/10 rounded-full h-10 w-10">
                <MoreHorizontal className="h-5 w-5" />
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
            className="text-white hover:bg-white/10 rounded-full h-12 w-12"
            onClick={() => setIsPlayerOpen(false)}
          >
            <X className="h-8 w-8" />
          </Button>
        </div>
      </header>

      {/* Main Tabbed Container */}
      <Tabs defaultValue="details" className="flex-1 flex flex-col relative z-10 overflow-hidden px-6 md:px-12">
        <div className="flex justify-center mb-6 shrink-0">
          <TabsList className="bg-white/5 border border-white/10 rounded-full h-11 p-1">
            <TabsTrigger 
              value="details" 
              className="rounded-full px-8 text-[10px] font-black uppercase italic tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white h-full"
            >
              <Info className="h-4 w-4 mr-2" />
              Details
            </TabsTrigger>
            <TabsTrigger 
              value="lyrics" 
              className="rounded-full px-8 text-[10px] font-black uppercase italic tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white h-full"
            >
              <Mic2 className="h-4 w-4 mr-2" />
              Lyrics
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col items-center min-h-0">
          <TabsContent value="details" className="w-full flex-1 flex flex-col items-center justify-center gap-8 md:gap-16 mt-0 animate-in fade-in zoom-in-95 duration-500 overflow-y-auto custom-scrollbar pb-8">
            {/* Image Area */}
            <div className="w-full max-w-[320px] md:max-w-[480px] aspect-square relative shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden border border-white/10 group shrink-0">
              {imageSrc ? (
                <Image src={imageSrc} alt={currentTrack.name} fill className="object-cover" priority />
              ) : (
                <div className="h-full w-full bg-neutral-900 flex items-center justify-center">
                  <Music2 className="h-24 w-24 text-neutral-800" />
                </div>
              )}
            </div>

            {/* Info Area */}
            <div className="w-full text-center space-y-2 shrink-0">
              <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter italic uppercase leading-tight line-clamp-2">
                {currentTrack.name}
              </h2>
              <p className="text-xl md:text-3xl text-primary font-bold uppercase tracking-[0.2em] truncate opacity-80 italic">
                {getArtistNames(currentTrack)}
              </p>
              
              <div className="pt-4 flex justify-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "h-14 w-14 rounded-full transition-all border border-white/10 bg-white/5",
                    liked ? "text-primary border-primary/20" : "text-white/20 hover:text-white"
                  )}
                  onClick={() => toggleLike(currentTrack)}
                >
                  <Heart className={cn("h-6 w-6", liked && "fill-current")} />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="lyrics" className="w-full flex-1 flex flex-col items-center mt-0 animate-in fade-in slide-in-from-bottom-8 duration-500 overflow-hidden h-full">
            <div className="w-full max-w-2xl flex-1 overflow-hidden bg-white/5 border border-white/10 rounded-3xl relative">
              <ScrollArea className="h-full w-full p-8 md:p-12">
                <div className="flex flex-col gap-8 text-center pb-32">
                  {loadingLyrics ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <p className="text-xs font-black uppercase tracking-[0.3em] text-neutral-500">Unweaving resonance...</p>
                    </div>
                  ) : lyrics ? (
                    lyrics.split('\n').map((line, i) => (
                      <p 
                        key={i} 
                        className="text-2xl md:text-5xl font-black text-white italic tracking-tighter leading-tight transition-all duration-300 hover:text-primary cursor-default opacity-80 hover:opacity-100"
                      >
                        {line || '...'}
                      </p>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-20">
                      <Music2 className="h-16 w-16" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em]">No spectral markers detected</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </div>
          </TabsContent>
        </div>

        {/* Global Controls */}
        <div className="w-full max-w-4xl mx-auto py-8 space-y-6 z-20 shrink-0">
          <div className="space-y-3">
            <Slider
              value={[progress]}
              max={duration || 100}
              step={0.1}
              onValueChange={(vals) => seek(vals[0])}
              className="cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] font-black tracking-[0.3em] text-neutral-500 font-mono italic">
              <span>{formatDuration(progress)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 pb-4">
            <Button variant="ghost" size="icon" className="text-white/20 hover:text-white h-10 w-10">
              <Shuffle className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-6 md:gap-12">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white h-14 w-14 hover:scale-110 transition-transform"
                onClick={prevTrack}
              >
                <SkipBack className="h-10 w-10 fill-white" />
              </Button>
              
              <Button 
                className="bg-primary text-white rounded-full h-20 w-20 md:h-24 md:w-24 hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,0,0,0.4)] active:scale-95 border-4 border-white/10"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-8 w-8 md:h-10 md:w-10 fill-white" /> : <Play className="h-8 w-8 md:h-10 md:w-10 fill-white ml-1" />}
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
      </Tabs>
    </div>
  );
}
