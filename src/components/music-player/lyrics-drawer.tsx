'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useMusic } from './player-context';
import { Button } from '@/components/ui/button';

export function LyricsDrawer() {
  const { isLyricsOpen, setIsLyricsOpen } = useMusic();

  if (!isLyricsOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsLyricsOpen(false)}
      />
      
      <div className="relative w-full h-[80vh] bg-neutral-900 border-t border-white/10 rounded-t-3xl flex flex-col p-8 animate-in slide-in-from-bottom duration-300">
        <header className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Lyrics</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsLyricsOpen(false)}>
            <X className="h-6 w-6" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex items-center justify-center text-center">
          <p className="text-neutral-500 text-lg italic">Lyrics not available for this song</p>
        </div>
      </div>
    </div>
  );
}
