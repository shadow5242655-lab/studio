
'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Heart, Music2, MoreHorizontal, Download, PlusCircle, X, Mic2 } from 'lucide-react';
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
    togglePlay, nextTrack, prevTrack, toggleLike, isLiked, playlists, addToPlaylist,
    setIsLyricsOpen
  } = useMusic();

  const { progress, duration, seek, commitSeek, setIsSeeking } = useMusicProgress();

  if (!isPlayerOpen || !currentTrack) return null;

  const imageSrc = getBestImage(currentTrack);
  const liked = isLiked(currentTrack.id);

  const handleDownload = () => {
    const url = getBestDownload(currentTrack);
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentTrack.name}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
      {/* Hardware Accelerated BG */}
      <div className="absolute inset-0 z-0 pointer-events-none will-change-transform">
        {imageSrc ? (
          <Image src={imageSrc} alt="bg" fill className="object-cover opacity-30 blur-[100px] scale-150" priority />
        ) : (
          <div className="h-full w-full bg-neutral-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
      </div>
      
      {/* Header Actions */}
      <header className="relative flex items-center justify-between p-6 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
             <Music2 className="h-5 w-5 text-primary" />
          </div>
          <span className="text-sm font-black text-white italic tracking-tighter uppercase leading-none">AYUMUSIC</span>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-11 w-11 rounded-full transition-all touch-btn", liked ? "text-primary bg-white/5" : "text-white/40")}
            onPointerDown={() => toggleLike(currentTrack)}
          >
            <Heart className={cn("h-6 w-6", liked && "fill-current")} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white/40 rounded-full h-11 w-11 touch-btn">
                <MoreHorizontal className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-neutral-900 border-white/10 text-white w-64 backdrop-blur-xl">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-3 py-3 font-bold uppercase italic tracking-tighter"><PlusCircle className="h-4 w-4" />Add to Playlist</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="bg-neutral-900 border-white/10 text-white">
                  {playlists.map(p => (
                    <DropdownMenuItem key={p.id} onPointerDown={() => addToPlaylist(p.id, currentTrack)} className="font-bold uppercase italic tracking-tighter">{p.name}</DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem onPointerDown={handleDownload} className="gap-3 py-3 font-bold uppercase italic tracking-tighter"><Download className="h-4 w-4" />Download</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/10 rounded-full h-11 w-11 touch-btn"
            onPointerDown={() => setIsPlayerOpen(false)}
          >
            <X className="h-8 w-8" />
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-between px-6 md:px-12 relative z-10 py-4 min-h-0">
        
        {/* Artwork Section */}
        <div className="w-full max-w-[300px] md:max-w-[400px] aspect-square relative shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] rounded-[2rem] overflow-hidden border border-white/10 bg-neutral-900 shrink mb-6 will-change-transform">
          {imageSrc ? (
            <Image src={imageSrc} alt={currentTrack.name} fill className="object-cover" priority />
          ) : (
            <div className="h-full w-full flex items-center justify-center"><Music2 className="h-24 w-24 text-neutral-800" /></div>
          )}
        </div>

        {/* LYRICS BUTTON (MIDDLE UP POSITION) */}
        <div className="w-full flex justify-center mb-6">
          <Button 
            onPointerDown={() => setIsLyricsOpen(true)}
            className="h-14 px-12 rounded-full bg-primary/90 text-white font-black text-lg italic uppercase tracking-tighter shadow-2xl border-2 border-white/20 hover:scale-105 transition-all touch-btn gap-3 group"
          >
            <Mic2 className="h-5 w-5 group-hover:animate-pulse" />
            LYRICS
          </Button>
        </div>

        {/* Song Info */}
        <div className="w-full text-center space-y-2 mb-6">
          <h2 className="text-3xl md:text-6xl font-black text-white tracking-tighter italic uppercase leading-none truncate px-4">{currentTrack.name}</h2>
          <p className="text-base md:text-2xl text-primary font-bold uppercase truncate opacity-80 italic tracking-tight">{getArtistNames(currentTrack)}</p>
        </div>

        {/* Controls and Slider */}
        <div className="w-full max-w-2xl mx-auto space-y-6 pb-12">
          <div className="space-y-4">
            <Slider 
              value={[progress]} 
              max={duration || 100} 
              step={0.1} 
              onPointerDown={() => setIsSeeking(true)}
              onValueChange={(vals) => seek(vals[0])}
              onValueCommit={(vals) => commitSeek(vals[0])}
              className="py-4 cursor-pointer" 
            />
            <div className="flex items-center justify-between text-[10px] font-black tracking-[0.3em] text-neutral-500 italic uppercase">
              <span>{formatDuration(progress)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between px-4">
            <Button variant="ghost" size="icon" className="text-white/30 h-10 w-10 touch-btn"><Repeat className="h-6 w-6" /></Button>
            
            <div className="flex items-center gap-8 md:gap-14">
              <Button variant="ghost" size="icon" className="text-white h-12 w-12 touch-btn" onPointerDown={prevTrack}>
                <SkipBack className="h-10 w-10 fill-white" />
              </Button>
              
              <Button 
                className="bg-white text-black rounded-full h-20 w-20 md:h-24 md:w-24 touch-btn shadow-2xl border-4 border-black/10" 
                onPointerDown={togglePlay}
              >
                {isPlaying ? <Pause className="h-9 w-9 fill-black" /> : <Play className="h-9 w-9 fill-black ml-1" />}
              </Button>
              
              <Button variant="ghost" size="icon" className="text-white h-12 w-12 touch-btn" onPointerDown={nextTrack}>
                <SkipForward className="h-10 w-10 fill-white" />
              </Button>
            </div>

            <Button variant="ghost" size="icon" className="text-white/30 h-10 w-10 touch-btn">
              <PlusCircle className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
