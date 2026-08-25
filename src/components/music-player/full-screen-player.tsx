'use client';

import React, { useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronDown, MoreHorizontal, Download, PlusCircle, Mic2, Loader2, ListMusic, Forward, Heart } from 'lucide-react';
import { useMusic, useMusicProgress } from './player-context';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { getBestImage, formatDuration, getBestDownload, decodeEntities } from '@/lib/music-api';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSub, 
  DropdownMenuSubTrigger, 
  DropdownMenuSubContent, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';

export function FullScreenPlayer() {
  const { 
    currentTrack, isPlaying, isBuffering, isPlayerOpen, setIsPlayerOpen, 
    togglePlay, nextTrack, prevTrack, playlists, addToPlaylist, 
    setIsLyricsOpen, playNext, addToQueue, toggleLike, isLiked 
  } = useMusic();
  const { progress, duration, seek } = useMusicProgress();
  const router = useRouter();
  const startPos = useRef<{ x: number, y: number, time: number } | null>(null);

  if (!isPlayerOpen || !currentTrack) return null;

  const imageSrc = getBestImage(currentTrack);
  const trackName = decodeEntities(currentTrack.name);
  const artistNames = currentTrack.artists.primary.map(a => decodeEntities(a.name)).join(', ');

  const handlePointerDown = (e: React.PointerEvent) => {
    startPos.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handleClose = () => {
    setIsPlayerOpen(false);
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

  const liked = isLiked(currentTrack.id);

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {imageSrc && (
          <img 
            src={imageSrc} 
            alt="Ambience" 
            className="w-full h-full object-cover opacity-20 blur-[120px] scale-150 transition-opacity duration-1000"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/90 to-black" />
      </div>
      
      {/* Top Header */}
      <header className="flex items-center justify-between p-4 md:p-6 z-10 shrink-0">
        <Button 
          variant="ghost" 
          size="icon" 
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp(handleClose)}
          onPointerCancel={handlePointerCancel}
          className="text-white hover:bg-white/5 h-12 w-12"
        >
          <ChevronDown className="h-6 w-6" />
        </Button>
        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-primary italic neon-glow">Resonating Now</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/5 h-12 w-12">
              <MoreHorizontal className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="glass-card text-white w-56 border-white/10" align="end">
            <DropdownMenuItem onPointerDown={() => playNext(currentTrack)} className="hover:bg-primary/20 cursor-pointer">
              <Forward className="mr-2 h-4 w-4" /> Play Next
            </DropdownMenuItem>
            <DropdownMenuItem onPointerDown={() => addToQueue(currentTrack)} className="hover:bg-primary/20 cursor-pointer">
              <ListMusic className="mr-2 h-4 w-4" /> Add to Queue
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="hover:bg-primary/20 cursor-pointer"><PlusCircle className="mr-2 h-4 w-4" />Add to Playlist</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="glass-card text-white border-white/10">
                {playlists.map(p => (
                  <DropdownMenuItem key={p.id} onPointerDown={() => addToPlaylist(p.id, currentTrack)} className="hover:bg-primary/20 cursor-pointer">{p.name}</DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem onPointerDown={handleDownload} className="hover:bg-primary/20 cursor-pointer"><Download className="mr-2 h-4 w-4" />Download</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main Content Area */}
      <ScrollArea className="flex-1 w-full z-10">
        <div className="px-6 py-4 flex flex-col items-center justify-center space-y-6 md:space-y-8 min-h-full">
          {/* Artwork */}
          <div className="relative aspect-square w-full max-w-[75vw] md:max-w-sm rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] bg-neutral-900 border border-white/10 group">
            {imageSrc ? (
              <img 
                src={imageSrc} 
                alt={trackName} 
                className={cn("w-full h-full object-cover transition-transform duration-[20s] linear animate-slow-zoom", isBuffering && "opacity-50")} 
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center"><Music2 className="h-20 w-20 text-neutral-800" /></div>
            )}
            {isBuffering && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
            )}
          </div>

          {/* Lyrics Trigger */}
          <Button 
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp(() => setIsLyricsOpen(true))}
            onPointerCancel={handlePointerCancel}
            className="h-12 px-10 rounded-full glass-card border-primary/20 text-primary font-black uppercase italic tracking-widest gap-2 hover:bg-primary/10 transition-colors text-[10px] shadow-2xl"
          >
            <Mic2 className="h-4 w-4" />
            Lyrics
          </Button>

          {/* Track Info with Adaptive Marquee */}
          <div className="w-full space-y-4 md:space-y-6 max-w-sm px-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="whitespace-nowrap">
                    <h2 className={cn(
                      "text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-tight inline-block",
                      trackName.length > 18 && "animate-marquee"
                    )}>
                      {trackName}
                      {trackName.length > 18 && <span className="ml-8">{trackName}</span>}
                    </h2>
                  </div>
                  
                  <div className="whitespace-nowrap overflow-hidden">
                    <p className={cn(
                      "text-sm md:text-lg text-primary font-bold uppercase tracking-widest inline-block opacity-80",
                      artistNames.length > 25 && "animate-marquee"
                    )}>
                      {currentTrack.artists.primary.map((artist, index) => (
                        <span key={artist.id || index}>
                          <span 
                            onPointerDown={handlePointerDown}
                            onPointerUp={handlePointerUp(() => handleArtistClick({ stopPropagation: () => {} } as any, artist.name))}
                            className="hover:text-white hover:underline cursor-pointer"
                          >
                            {decodeEntities(artist.name)}
                          </span>
                          {index < currentTrack.artists.primary.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                      {artistNames.length > 25 && <span className="ml-8">{artistNames}</span>}
                    </p>
                  </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="shrink-0 text-neutral-400 hover:text-primary transition-colors"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp(() => toggleLike(currentTrack))}
                onPointerCancel={handlePointerCancel}
              >
                <Heart className={cn("h-6 w-6", liked && "fill-primary text-primary")} />
              </Button>
            </div>

            {/* Seek Bar */}
            <div className="space-y-4">
              <Slider 
                value={[progress]} 
                max={duration || 100} 
                step={0.1} 
                onValueChange={(vals) => seek(vals[0])}
                className="py-2 cursor-pointer" 
              />
              <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-neutral-500 uppercase">
                <span>{formatDuration(progress)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Bottom Playback Controls (Ergonomic cluster) */}
      <div className="shrink-0 z-10 bg-gradient-to-t from-black via-black/90 to-transparent w-full pb-8 pt-2 border-t border-white/5">
        <div className="flex items-center justify-center gap-12 w-full max-w-xs mx-auto relative h-14">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:scale-110 h-14 w-14 group absolute left-0" 
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp(prevTrack)}
            onPointerCancel={handlePointerCancel}
          >
            <SkipBack className="h-6 w-6 fill-current" />
          </Button>
          
          <Button 
            className="bg-primary text-black rounded-full h-14 w-14 p-0 hover:scale-105 active:scale-90 transition-transform shadow-[0_0_30px_hsl(var(--primary)/0.4)] z-20" 
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp(togglePlay)}
            onPointerCancel={handlePointerCancel}
          >
            {isBuffering ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-6 w-6 fill-current" />
            ) : (
              <Play className="h-6 w-6 fill-current" />
            )}
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:scale-110 h-14 w-14 group absolute right-0" 
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp(nextTrack)}
            onPointerCancel={handlePointerCancel}
          >
            <SkipForward className="h-6 w-6 fill-current" />
          </Button>
        </div>
      </div>
    </div>
  );
}
