'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, Music2, X, ChevronDown, ListMusic } from 'lucide-react';
import { useMusic, useMusicProgress } from './player-context';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { getBestImage, formatDuration, decodeEntities } from '@/lib/music-api';
import { cn } from '@/lib/utils';

/**
 * @fileOverview High-fidelity full-screen player view.
 * Responsive architecture ensuring bottom controls are never hidden on short viewports.
 * Hardware-stabilized triggers for immersive layers (Lyrics/Queue).
 */

export function FullScreenPlayer() {
  const { 
    currentTrack, isPlaying, isBuffering, isPlayerOpen, setIsPlayerOpen, 
    togglePlay, nextTrack, prevTrack, toggleLike, isLiked, setIsLyricsOpen, setIsQueueOpen
  } = useMusic();
  const { progress, duration, seek, setIsScrubbing } = useMusicProgress();

  if (!isPlayerOpen || !currentTrack) return null;

  const imageSrc = getBestImage(currentTrack);
  const trackName = decodeEntities(currentTrack.name);
  const artistNames = currentTrack.artists.primary.map(a => decodeEntities(a.name)).join(', ');

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden text-white">
      {/* Immersive Header */}
      <header className="flex items-center justify-between p-6 shrink-0">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsPlayerOpen(false)}
          className="hover:bg-white/5 text-neutral-400 lag-free-tap"
        >
          <ChevronDown className="h-8 w-8" />
        </Button>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-500">Resonance Mode</span>
          <span className="text-[10px] font-bold uppercase tracking-widest mt-0.5">AYUMUSIC Discovery</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsPlayerOpen(false)}
          className="hover:bg-white/5 text-neutral-400 lag-free-tap"
        >
          <X className="h-7 w-7" />
        </Button>
      </header>

      {/* Main Content Area - Responsive Flex */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 md:px-16 max-w-4xl mx-auto w-full gap-4 md:gap-10 overflow-y-auto custom-scrollbar pb-10">
        
        {/* Responsive Album Art */}
        <div className="relative aspect-square w-full max-w-[260px] md:max-w-[400px] rounded-3xl overflow-hidden shadow-[0_40px_100px_-15px_rgba(255,0,0,0.2)] bg-neutral-900 border border-white/5 shrink-0 group">
          {imageSrc ? (
            <img 
              src={imageSrc} 
              className={cn(
                "w-full h-full object-cover transition-all duration-1000",
                isBuffering ? "opacity-30 blur-sm" : "opacity-100 blur-0"
              )} 
              alt="" 
            />
          ) : (
            <Music2 className="h-24 w-24 text-neutral-800" />
          )}
          {isBuffering && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Metadata and Actions */}
        <div className="w-full max-w-[400px] flex items-center justify-between gap-6 shrink-0 pt-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl md:text-3xl font-black truncate italic uppercase tracking-tighter leading-tight">{trackName}</h2>
            <p className="text-[10px] md:text-sm text-neutral-500 truncate mt-1 uppercase font-black tracking-widest">{artistNames}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => toggleLike(currentTrack)} 
            className="text-neutral-500 hover:text-primary transition-colors h-12 w-12 lag-free-tap"
          >
            <Heart className={cn("h-7 w-7 transition-all", isLiked(currentTrack.id) && "fill-primary text-primary scale-110")} />
          </Button>
        </div>

        {/* Neural Seek Bar */}
        <div className="w-full max-w-[400px] space-y-3 shrink-0">
          <Slider 
            value={[progress]} 
            max={duration || 100} 
            step={0.1} 
            onValueChange={v => {
              setIsScrubbing(true);
              seek(v[0]);
            }} 
            onValueCommit={() => {
              setIsScrubbing(false);
            }}
          />
          <div className="flex justify-between text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em]">
            <span>{formatDuration(progress)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="w-full max-w-[400px] flex items-center justify-around shrink-0 py-2">
          <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-white h-12 w-12 lag-free-tap" onClick={prevTrack}>
            <SkipBack className="h-8 w-8 fill-current" />
          </Button>
          <Button 
            onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
            className="bg-primary text-white rounded-full h-16 w-16 p-0 hover:scale-105 active:scale-95 transition-transform shadow-[0_0_30px_rgba(255,0,0,0.3)] flex items-center justify-center lag-free-tap"
          >
            {isPlaying ? <Pause className="h-8 w-8 fill-current" /> : <Play className="h-8 w-8 fill-current ml-1.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-white h-12 w-12 lag-free-tap" onClick={nextTrack}>
            <SkipForward className="h-8 w-8 fill-current" />
          </Button>
        </div>

        {/* Immersive Utilities */}
        <div className="w-full max-w-[400px] flex items-center justify-between pt-2 shrink-0 border-t border-white/5">
          <Button 
            variant="ghost" 
            className="gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-primary transition-colors lag-free-tap" 
            onClick={() => setIsLyricsOpen(true)}
          >
            <Music2 className="h-4 w-4" /> Lyrics
          </Button>
          <Button 
            variant="ghost" 
            className="gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-white lag-free-tap" 
            onClick={() => setIsQueueOpen(true)}
          >
            <ListMusic className="h-4 w-4" /> Queue
          </Button>
        </div>
      </div>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-black to-black pointer-events-none" />
    </div>
  );
}
