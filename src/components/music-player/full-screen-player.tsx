'use client';

import React, { useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronDown, MoreHorizontal, Download, Mic2, Loader2, ListMusic, Forward, Heart, Music2 } from 'lucide-react';
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
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';

export function FullScreenPlayer() {
  const { 
    currentTrack, isPlaying, isBuffering, isPlayerOpen, setIsPlayerOpen, 
    togglePlay, nextTrack, prevTrack, playNext, addToQueue, 
    setIsLyricsOpen, toggleLike, isLiked 
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

  const handleInteraction = (callback: () => void) => (e: React.PointerEvent) => {
    if (!startPos.current) return;
    const dx = Math.abs(e.clientX - startPos.current.x);
    const dy = Math.abs(e.clientY - startPos.current.y);
    const dt = Date.now() - startPos.current.time;
    if (dx < 10 && dy < 10 && dt < 300) callback();
    startPos.current = null;
  };

  const handleArtistClick = (name: string) => {
    setIsPlayerOpen(false);
    router.push(`/search?q=${encodeURIComponent(name)}`);
  };

  const liked = isLiked(currentTrack.id);

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden opacity-30">
        {imageSrc && <img src={imageSrc} className="w-full h-full object-cover blur-[120px] scale-150" alt="" />}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black" />
      </div>
      
      <header className="flex items-center justify-between p-4 z-10 shrink-0">
        <Button variant="ghost" size="icon" onPointerDown={handlePointerDown} onPointerUp={handleInteraction(() => setIsPlayerOpen(false))} className="text-white h-12 w-12"><ChevronDown /></Button>
        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-primary italic neon-glow">Resonance</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="text-white h-12 w-12"><MoreHorizontal /></Button></DropdownMenuTrigger>
          <DropdownMenuContent className="glass-card text-white w-56 border-white/10" align="end">
            <DropdownMenuItem onPointerDown={() => playNext(currentTrack)}><Forward className="mr-2 h-4 w-4" /> Play Next</DropdownMenuItem>
            <DropdownMenuItem onPointerDown={() => addToQueue(currentTrack)}><ListMusic className="mr-2 h-4 w-4" /> Add to Queue</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem onPointerDown={() => { const u = getBestDownload(currentTrack); if(u) window.open(u, '_blank'); }}><Download className="mr-2 h-4 w-4" /> Download</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <ScrollArea className="flex-1 z-10 w-full overflow-y-auto">
        <div className="px-6 py-8 flex flex-col items-center justify-center space-y-6 md:space-y-8 min-h-full">
          <div className="relative aspect-square w-full max-w-[70vw] md:max-w-sm rounded-[2rem] overflow-hidden shadow-2xl bg-neutral-900 border border-white/10">
            {imageSrc ? <img src={imageSrc} className={cn("w-full h-full object-cover animate-slow-zoom", isBuffering && "opacity-50")} alt="" /> : <Music2 className="h-20 w-20 text-neutral-800" />}
            {isBuffering && <Loader2 className="absolute inset-0 m-auto h-12 w-12 text-primary animate-spin" />}
          </div>

          <Button onPointerDown={handlePointerDown} onPointerUp={handleInteraction(() => setIsLyricsOpen(true))} className="h-10 px-8 rounded-full glass-card border-primary/20 text-primary font-black uppercase tracking-widest gap-2 text-[9px]">
            <Mic2 className="h-4 w-4" /> LYRICS
          </Button>

          <div className="w-full max-w-sm px-2 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0 overflow-hidden">
                <h2 className={cn("text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase inline-block", trackName.length > 20 && "animate-marquee")}>
                  {trackName} {trackName.length > 20 && <span className="ml-8">{trackName}</span>}
                </h2>
                <div className="whitespace-nowrap overflow-hidden">
                  <p className={cn("text-xs md:text-sm text-primary font-bold uppercase tracking-widest inline-block opacity-80", artistNames.length > 30 && "animate-marquee")}>
                    {currentTrack.artists.primary.map((a, i) => (
                      <span key={i} onPointerDown={handlePointerDown} onPointerUp={handleInteraction(() => handleArtistClick(a.name))} className="hover:underline cursor-pointer">
                        {decodeEntities(a.name)}{i < currentTrack.artists.primary.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                    {artistNames.length > 30 && <span className="ml-8">{artistNames}</span>}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onPointerDown={handlePointerDown} onPointerUp={handleInteraction(() => toggleLike(currentTrack))} className="text-neutral-400 shrink-0"><Heart className={cn(liked && "fill-primary text-primary")} /></Button>
            </div>

            <div className="space-y-3">
              <Slider 
                value={[progress]} 
                max={duration || 100} 
                step={0.1} 
                onValueChange={v => seek(v[0])} 
                className="cursor-pointer"
              />
              <div className="flex justify-between text-[8px] font-black tracking-widest text-neutral-500 uppercase">
                <span>{formatDuration(progress)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Ergonomic Mobile Controls - Short visual buttons with large hitboxes */}
      <div className="shrink-0 z-10 bg-gradient-to-t from-black via-black to-transparent w-full pb-10 pt-2 px-6">
        <div className="flex items-center justify-center gap-10 max-w-xs mx-auto relative h-16">
          <Button variant="ghost" size="icon" onPointerDown={handlePointerDown} onPointerUp={handleInteraction(prevTrack)} className="text-white h-16 w-16 absolute left-0"><SkipBack fill="currentColor" className="h-6 w-6" /></Button>
          <Button onClick={togglePlay} className="bg-primary text-black rounded-full h-16 w-16 shadow-[0_0_30px_rgba(255,0,0,0.4)] transition-transform active:scale-90">
            {isBuffering ? <Loader2 className="h-6 w-6 animate-spin" /> : isPlaying ? <Pause fill="currentColor" className="h-6 w-6" /> : <Play fill="currentColor" className="h-6 w-6" />}
          </Button>
          <Button variant="ghost" size="icon" onPointerDown={handlePointerDown} onPointerUp={handleInteraction(nextTrack)} className="text-white h-16 w-16 absolute right-0"><SkipForward fill="currentColor" className="h-6 w-6" /></Button>
        </div>
      </div>
    </div>
  );
}