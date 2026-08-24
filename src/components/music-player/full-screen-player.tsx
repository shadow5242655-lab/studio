'use client';

import React, { useState } from 'react';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Heart, Music2, MoreHorizontal, Download, PlusCircle, X, Sparkles, SlidersHorizontal, Languages } from 'lucide-react';
import { useMusic } from './player-context';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { getBestImage, getArtistNames, formatDuration, getBestDownload } from '@/lib/music-api';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function FullScreenPlayer() {
  const { 
    currentTrack, isPlaying, isPlayerOpen, setIsPlayerOpen, 
    togglePlay, nextTrack, prevTrack, progress, duration, 
    seek, toggleLike, isLiked, playlists, addToPlaylist, stopTrack 
  } = useMusic();

  const [activeTab, setActiveTab] = useState('art');

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
    <div className="fixed inset-0 z-[60] bg-neutral-950 flex flex-col animate-in slide-in-from-bottom duration-700">
      {/* Immersive Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-black to-black pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
      
      {/* Header */}
      <header className="relative flex items-center justify-between p-8 z-10">
        <div className="flex gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/10 rounded-full h-12 w-12"
            onClick={() => setIsPlayerOpen(false)}
          >
            <ChevronDown className="h-10 w-10" />
          </Button>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-3 w-3 text-primary animate-pulse" />
            <span className="text-[10px] uppercase font-black tracking-[0.4em] text-white/60">Studio Playback</span>
          </div>
          <span className="text-sm font-black text-white italic tracking-tighter">AYUMUSIC PREMIUM</span>
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
                Download Studio Track
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* View Switcher */}
      <div className="relative z-10 flex justify-center mb-8">
        <Tabs defaultValue="art" className="w-auto" onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 border border-white/10 rounded-full p-1">
            <TabsTrigger value="art" className="rounded-full px-6 data-[state=active]:bg-primary">Art</TabsTrigger>
            <TabsTrigger value="studio" className="rounded-full px-6 data-[state=active]:bg-primary">Studio</TabsTrigger>
            <TabsTrigger value="lyrics" className="rounded-full px-6 data-[state=active]:bg-primary">Lyrics</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-16 px-12 max-w-7xl mx-auto w-full relative z-10 overflow-hidden py-4">
        
        {/* Left Side: Visuals */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
           {activeTab === 'art' && (
             <div className="relative aspect-square w-full max-w-[500px] shadow-[0_50px_100px_-20px_rgba(239,68,68,0.3)] rounded-[2rem] overflow-hidden border border-white/20 animate-in zoom-in-95 duration-500">
                {imageSrc ? (
                  <Image src={imageSrc} alt={currentTrack.name} fill className="object-cover" priority />
                ) : (
                  <div className="h-full w-full bg-neutral-900 flex items-center justify-center">
                    <Music2 className="h-40 w-40 text-neutral-800" />
                  </div>
                )}
             </div>
           )}

           {activeTab === 'studio' && (
             <div className="w-full max-w-[500px] aspect-square bg-white/5 rounded-[2rem] p-12 border border-white/10 flex flex-col justify-between animate-in slide-in-from-left-8 duration-500">
                <div className="flex items-center gap-3 mb-8">
                  <SlidersHorizontal className="h-6 w-6 text-primary" />
                  <h3 className="font-black italic uppercase tracking-widest text-lg">Audiophile EQ</h3>
                </div>
                <div className="flex-1 flex items-end justify-between gap-4 px-4">
                  {[60, 250, 1000, 4000, 16000].map((freq, i) => (
                    <div key={freq} className="flex flex-col items-center gap-4 flex-1 h-full">
                      <div className="flex-1 w-2 bg-white/10 rounded-full relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 right-0 bg-primary/40" style={{ height: `${40 + Math.random() * 40}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-neutral-500">{freq < 1000 ? freq : freq/1000 + 'k'}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-8 flex justify-between text-[10px] font-black uppercase tracking-widest text-primary/60">
                  <span>Pure Phase</span>
                  <span>Bespoke Tuned</span>
                </div>
             </div>
           )}

           {activeTab === 'lyrics' && (
              <div className="w-full max-w-[500px] aspect-square flex flex-col gap-6 animate-in slide-in-from-right-8 duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <Languages className="h-6 w-6 text-primary" />
                  <h3 className="font-black italic uppercase tracking-widest text-lg">Live Scroll</h3>
                </div>
                <div className="space-y-6 overflow-y-auto custom-scrollbar pr-4 text-left">
                  <p className="text-4xl font-black text-white leading-tight">I hear the frequencies...</p>
                  <p className="text-3xl font-black text-white/40 leading-tight">Shifting through the night</p>
                  <p className="text-3xl font-black text-white/20 leading-tight">This resonance is holy</p>
                  <p className="text-3xl font-black text-white/10 leading-tight">A velvet wave of light</p>
                  <p className="text-3xl font-black text-white/5 leading-tight">In the house of AYU</p>
                </div>
              </div>
           )}
        </div>

        {/* Right Side: Information & Controls */}
        <div className="w-full md:w-1/2 flex flex-col justify-center gap-12 min-w-0">
          <div className="flex items-end justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter mb-4 truncate italic uppercase">
                {currentTrack.name}
              </h2>
              <p className="text-xl md:text-2xl text-primary font-black uppercase tracking-widest truncate">
                {getArtistNames(currentTrack)}
              </p>
            </div>
            <div className="flex flex-col gap-4 ml-6">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "h-14 w-14 rounded-full transition-all border border-white/5",
                  liked ? "bg-primary/10 text-primary" : "text-white/20 hover:text-white"
                )}
                onClick={() => toggleLike(currentTrack)}
              >
                <Heart className={cn("h-8 w-8", liked && "fill-current")} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-14 w-14 rounded-full text-white/20 hover:text-white border border-white/5"
                onClick={handleDownload}
              >
                <Download className="h-8 w-8" />
              </Button>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <Slider
                value={[progress]}
                max={duration || 100}
                step={0.1}
                onValueChange={(vals) => seek(vals[0])}
                className="cursor-pointer"
              />
              <div className="flex items-center justify-between text-xs font-black tracking-widest text-neutral-500 font-mono">
                <span>{formatDuration(progress)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between px-6">
              <Button variant="ghost" size="icon" className="text-white/20 hover:text-white h-12 w-12">
                <Shuffle className="h-6 w-6" />
              </Button>
              <div className="flex items-center gap-8">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white h-16 w-16 hover:scale-110 transition-transform"
                  onClick={prevTrack}
                >
                  <SkipBack className="h-12 w-12 fill-white" />
                </Button>
                <Button 
                  className="bg-primary text-white rounded-full h-24 w-24 hover:scale-105 transition-transform shadow-[0_20px_50px_rgba(239,68,68,0.4)] active:scale-95"
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause className="h-12 w-12 fill-white" /> : <Play className="h-12 w-12 fill-white ml-2" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white h-16 w-16 hover:scale-110 transition-transform"
                  onClick={nextTrack}
                >
                  <SkipForward className="h-12 w-12 fill-white" />
                </Button>
              </div>
              <Button variant="ghost" size="icon" className="text-white/20 hover:text-white h-12 w-12">
                <Repeat className="h-6 w-6" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8 pt-8 border-t border-white/5">
             <Button variant="ghost" className="text-neutral-500 hover:text-primary text-[10px] font-black uppercase tracking-[0.3em] gap-3" onClick={stopTrack}>
              <X className="h-4 w-4" />
              Terminate Session
            </Button>
            <div className="h-1 w-1 bg-white/20 rounded-full" />
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">
               <Music2 className="h-4 w-4" />
               Studio Source
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
