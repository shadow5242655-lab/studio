'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, Music2, X, MoreHorizontal, ChevronDown, ListMusic } from 'lucide-react';
import { useMusic, useMusicProgress } from './player-context';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { getBestImage, formatDuration, decodeEntities } from '@/lib/music-api';
import { cn } from '@/lib/utils';

/**
 * @fileOverview High-fidelity full-screen player view.
 * The ✕ button in the top right collapses the player back to the home view 
 * without stopping the audio, just like Spotify.
 */

export function FullScreenPlayer() {
  const { 
    currentTrack, isPlaying, isBuffering, isPlayerOpen, setIsPlayerOpen, 
    togglePlay, nextTrack, prevTrack, toggleLike, isLiked, setIsLyricsOpen
  } = useMusic();
  const { progress, duration, seek, setIsScrubbing } = useMusicProgress();

  if (!isPlayerOpen || !currentTrack) return null;

  const imageSrc = getBestImage(currentTrack);
  const trackName = decodeEntities(currentTrack.name);
  const artistNames = currentTrack.artists.primary.map(a => decodeEntities(a.name)).join(', ');

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden text-white">
      {/* High-Fidelity Header */}
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
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-500">Playing From</span>
          <span className="text-[10px] font-bold uppercase tracking-widest mt-0.5">AYUMUSIC Lineage</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsPlayerOpen(false)}
          className="hover:bg-white/5 text-neutral-400 hover:text-white transition-colors lag-free-tap"
        >
          <X className="h-7 w-7" />
        </Button>
      </header>

      {/* Main Resonance View */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 md:px-16 max-w-4xl mx-auto w-full space-y-12">
        {/* Album Art with Premium Shadow */}
        <div className="relative aspect-square w-full max-w-[420px] rounded-3xl overflow-hidden shadow-[0_40px_100px_-15px_rgba(255,0,0,0.15)] bg-neutral-900 border border-white/5 group">
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

        {/* Track Metadata and Like Button */}
        <div className="w-full max-w-[420px] flex items-center justify-between gap-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-3xl md:text-4xl font-black truncate italic uppercase tracking-tighter leading-tight">{trackName}</h2>
            <p className="text-sm md:text-base text-neutral-500 truncate mt-1 uppercase font-black tracking-widest">{artistNames}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => toggleLike(currentTrack)} 
            className="text-neutral-500 hover:text-primary transition-colors h-14 w-14"
          >
            <Heart className={cn("h-8 w-8 transition-all", isLiked(currentTrack.id) && "fill-primary text-primary scale-110")} />
          </Button>
        </div>

        {/* Spotify-Style Functional Red Seek Bar */}
        <div className="w-full max-w-[420px] space-y-4">
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
          <div className="flex justify-between text-[11px] font-black text-neutral-600 uppercase tracking-[0.2em]">
            <span>{formatDuration(progress)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="w-full max-w-[420px] flex items-center justify-around">
          <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-white h-14 w-14" onClick={prevTrack}>
            <SkipBack className="h-10 w-10 fill-current" />
          </Button>
          <Button 
            onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
            className="bg-white text-black rounded-full h-20 w-20 p-0 hover:scale-105 active:scale-95 transition-transform shadow-2xl flex items-center justify-center"
          >
            {isPlaying ? <Pause className="h-10 w-10 fill-current" /> : <Play className="h-10 w-10 fill-current ml-2" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-white h-14 w-14" onClick={nextTrack}>
            <SkipForward className="h-10 w-10 fill-current" />
          </Button>
        </div>

        {/* Lyrics & Queue Access */}
        <div className="w-full max-w-[420px] flex items-center justify-between pt-8">
          <Button variant="ghost" className="gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white" onClick={() => setIsLyricsOpen(true)}>
            <Music2 className="h-4 w-4" /> Lyrics
          </Button>
          <Button variant="ghost" className="gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white">
            <ListMusic className="h-4 w-4" /> Queue
          </Button>
        </div>
      </div>
      
      {/* Immersive Background Gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/20 to-black pointer-events-none" />
    </div>
  );
}
