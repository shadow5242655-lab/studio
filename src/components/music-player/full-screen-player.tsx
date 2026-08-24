'use client';

import React, { useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronDown, Heart, Music2, MoreHorizontal, Download, PlusCircle, Mic2 } from 'lucide-react';
import { useMusic, useMusicProgress } from './player-context';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { getBestImage, formatDuration, getBestDownload } from '@/lib/music-api';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

export function FullScreenPlayer() {
  const { currentTrack, isPlaying, isPlayerOpen, setIsPlayerOpen, togglePlay, nextTrack, prevTrack, toggleLike, isLiked, playlists, addToPlaylist, setIsLyricsOpen } = useMusic();
  const { progress, duration, seek } = useMusicProgress();
  const router = useRouter();
  const startPos = useRef<{ x: number, y: number, time: number } | null>(null);

  if (!isPlayerOpen || !currentTrack) return null;

  const imageSrc = getBestImage(currentTrack);
  const liked = isLiked(currentTrack.id);

  const handlePointerDown = (e: React.PointerEvent) => {
    startPos.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handlePointerUp = (callback: () => void) => (e: React.PointerEvent) => {
    if (!startPos.current) return;
    const dx = Math.abs(e.clientX - startPos.current.x);
    const dy = Math.abs(e.clientY - startPos.current.y);
    const dt = Date.now() - startPos.current.time;
    
    if (dx < 10 && dy < 10 && dt < 300) {
      callback();
    }
    startPos.current = null;
  };

  const handlePointerCancel = () => {
    startPos.current = null;
  };

  const handleDownload = () => {
    const url = getBestDownload(currentTrack);
    if (url) window.open(url, '_blank');
  };

  const handleArtistClick = (e: React.PointerEvent, artistName: string) => {
    e.stopPropagation();
    setIsPlayerOpen(false);
    router.push(`/search?q=${encodeURIComponent(artistName)}`);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-t from-primary/10 to-transparent" />
      
      <header className="flex items-center justify-between p-6 z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp(() => setIsPlayerOpen(false))}
          onPointerCancel={handlePointerCancel}
          className="text-white hover:bg-white/5 lag-free-tap"
        >
          <ChevronDown className="h-8 w-8" />
        </Button>
        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-primary italic neon-glow">Resonating Now</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/5 lag-free-tap">
              <MoreHorizontal className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="glass-card text-white w-56">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger><PlusCircle className="mr-2 h-4 w-4" />Add to Playlist</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="glass-card text-white">
                {playlists.map(p => (
                  <DropdownMenuItem key={p.id} onPointerDown={() => addToPlaylist(p.id, currentTrack)}>{p.name}</DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem onPointerDown={handleDownload}><Download className="mr-2 h-4 w-4" />Download</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-8 space-y-10 z-10">
        <div className="relative aspect-square w-full max-w-sm rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] bg-neutral-900 border border-white/10 group">
          {imageSrc ? (
            <Image src={imageSrc} alt={currentTrack.name} fill className="object-cover transition-transform duration-[20s] linear animate-slow-zoom" priority />
          ) : (
            <div className="h-full w-full flex items-center justify-center"><Music2 className="h-20 w-20 text-neutral-800" /></div>
          )}
        </div>

        <Button 
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp(() => setIsLyricsOpen(true))}
          onPointerCancel={handlePointerCancel}
          className="h-14 px-10 rounded-full glass-card border-primary/20 text-primary font-black uppercase italic tracking-widest gap-3 lag-free-tap hover:bg-primary/10 transition-colors"
        >
          <Mic2 className="h-5 w-5" />
          Lyrics
        </Button>

        <div className="w-full space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col min-w-0">
              <h2 className="text-3xl md:text-4xl font-black text-white truncate italic tracking-tighter uppercase">{currentTrack.name}</h2>
              <p className="text-lg text-primary/70 font-bold uppercase tracking-widest truncate">
                {currentTrack.artists.primary.map((artist, index) => (
                  <span key={artist.id || index}>
                    <span 
                      onPointerDown={handlePointerDown}
                      onPointerUp={handlePointerUp((e?: any) => handleArtistClick(e || { stopPropagation: () => {} } as any, artist.name))}
                      onPointerCancel={handlePointerCancel}
                      className="hover:text-white hover:underline cursor-pointer"
                    >
                      {artist.name}
                    </span>
                    {index < currentTrack.artists.primary.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp(() => toggleLike(currentTrack))}
              onPointerCancel={handlePointerCancel}
              className={cn("lag-free-tap transition-colors", liked ? "text-primary" : "text-neutral-500")}
            >
              <Heart className={cn("h-8 w-8", liked && "fill-current neon-glow")} />
            </Button>
          </div>

          <div className="space-y-4">
            <Slider 
              value={[progress]} 
              max={duration || 100} 
              step={0.1} 
              onValueChange={(vals) => seek(vals[0])}
              className="py-4" 
            />
            <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-neutral-500 uppercase">
              <span>{formatDuration(progress)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between w-full max-w-xs">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:scale-110 lag-free-tap" 
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp(prevTrack)}
            onPointerCancel={handlePointerCancel}
          >
            <SkipBack className="h-10 w-10 fill-current" />
          </Button>
          <Button 
            className="bg-primary text-black rounded-full h-24 w-24 p-0 hover:scale-105 active:scale-90 transition-transform shadow-[0_0_30px_hsl(var(--primary)/0.3)] lag-free-tap" 
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp(togglePlay)}
            onPointerCancel={handlePointerCancel}
          >
            {isPlaying ? <Pause className="h-12 w-12 fill-current" /> : <Play className="h-12 w-12 fill-current" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:scale-110 lag-free-tap" 
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp(nextTrack)}
            onPointerCancel={handlePointerCancel}
          >
            <SkipForward className="h-10 w-10 fill-current" />
          </Button>
        </div>
      </div>
    </div>
  );
}