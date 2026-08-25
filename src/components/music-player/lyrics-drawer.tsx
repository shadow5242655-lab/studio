'use client';

import React, { useEffect, useRef } from 'react';
import { X, Music2, Loader2 } from 'lucide-react';
import { useMusic, useMusicProgress } from './player-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function LyricsDrawer() {
  const { isLyricsOpen, setIsLyricsOpen, lyrics, loadingLyrics, currentTrack } = useMusic();
  const { progress } = useMusicProgress();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [progress, lyrics]);

  if (!isLyricsOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        onPointerDown={() => setIsLyricsOpen(false)}
      />
      
      <div className="relative w-full h-[85vh] bg-neutral-900/90 border-t border-white/10 rounded-t-[2.5rem] flex flex-col p-8 animate-in slide-in-from-bottom duration-500 overflow-hidden backdrop-blur-2xl">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/10 rounded-full" />
        
        <header className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-primary/20 p-2 rounded-xl">
              <Music2 className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-black italic uppercase tracking-tighter">Resonance</h2>
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest truncate max-w-[200px]">{currentTrack?.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onPointerDown={() => setIsLyricsOpen(false)} className="rounded-full bg-white/5 hover:bg-white/10">
            <X className="h-6 w-6" />
          </Button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-8 pb-40 text-center md:text-left">
          {loadingLyrics ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">Aligning Frequencies...</p>
            </div>
          ) : lyrics?.synced.length ? (
            lyrics.synced.map((line, i) => {
              const isActive = progress >= line.time && (i === lyrics.synced.length - 1 || progress < lyrics.synced[i+1].time);
              return (
                <p 
                  key={i} 
                  ref={isActive ? activeRef : null}
                  className={cn(
                    "text-2xl md:text-5xl font-black italic uppercase tracking-tighter leading-tight transition-all duration-300",
                    isActive 
                      ? "text-white opacity-100 scale-105 origin-center md:origin-left neon-glow" 
                      : "text-neutral-700 opacity-30 scale-100 blur-[1px]"
                  )}
                >
                  {line.text}
                </p>
              );
            })
          ) : lyrics?.plain ? (
            <div className="whitespace-pre-wrap text-neutral-400 text-lg md:text-2xl font-bold leading-relaxed py-8 italic uppercase tracking-tight text-center md:text-left">
              {lyrics.plain}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
              <Music2 className="h-16 w-16 text-neutral-800" />
              <p className="text-neutral-500 text-lg font-black italic uppercase tracking-tighter">Lyrics not found for this sound</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
