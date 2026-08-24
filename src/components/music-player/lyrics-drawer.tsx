
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Mic2, Loader2 } from 'lucide-react';
import { useMusic, useMusicProgress } from './player-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function LyricsDrawer() {
  const { isLyricsOpen, setIsLyricsOpen, lyrics, loadingLyrics, lyricsError, currentTrack } = useMusic();
  const { progress } = useMusicProgress();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (lyrics?.synced && progress > 0) {
      const index = lyrics.synced.findIndex((line, i) => {
        const nextTime = lyrics.synced![i + 1]?.time || Infinity;
        return progress >= line.time && progress < nextTime;
      });
      if (index !== -1 && index !== activeIndex) {
        setActiveIndex(index);
        const activeElement = scrollRef.current?.children[index] as HTMLElement;
        if (activeElement) {
          activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [progress, lyrics, activeIndex]);

  if (!isLyricsOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onPointerDown={() => setIsLyricsOpen(false)}
      />
      
      {/* Drawer */}
      <div className="relative w-full h-[85vh] bg-neutral-950/80 backdrop-blur-2xl border-t border-white/10 rounded-t-[2.5rem] flex flex-col animate-in slide-in-from-bottom duration-500 shadow-2xl overflow-hidden">
        <header className="flex items-center justify-between p-8 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-primary/20 p-2.5 rounded-2xl">
              <Mic2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Lineage</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Synced resonance</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-12 w-12 rounded-full hover:bg-white/10 touch-btn"
            onPointerDown={() => setIsLyricsOpen(false)}
          >
            <X className="h-8 w-8 text-white" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loadingLyrics ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">Fetching resonance...</p>
            </div>
          ) : lyricsError ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <p className="text-primary font-black italic uppercase text-lg mb-2">Sync Error</p>
              <p className="text-neutral-500 text-sm">{lyricsError}</p>
            </div>
          ) : lyrics?.synced ? (
            <div ref={scrollRef} className="space-y-6 pb-32">
              {lyrics.synced.map((line, i) => (
                <p 
                  key={`line-${i}`}
                  className={cn(
                    "text-2xl md:text-4xl font-black italic uppercase tracking-tighter transition-all duration-500 leading-tight",
                    i === activeIndex 
                      ? "text-white scale-105 origin-left" 
                      : "text-white/20 blur-[0.5px]"
                  )}
                >
                  {line.text}
                </p>
              ))}
            </div>
          ) : lyrics?.plain ? (
            <div className="pb-32">
              <pre className="text-lg md:text-2xl font-bold text-neutral-300 leading-relaxed whitespace-pre-wrap font-sans italic">
                {lyrics.plain}
              </pre>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <p className="text-neutral-500 font-black italic uppercase text-lg">Lyrics not available for this song</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-700">Digital footprint not found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
