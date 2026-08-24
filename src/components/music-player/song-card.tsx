'use client';

import React, { memo, useRef } from 'react';
import { Play, Music2, Pause } from 'lucide-react';
import { Song, getBestImage, getArtistNames } from '@/lib/music-api';
import { useMusic } from './player-context';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SongCardProps {
  song: Song;
  playlist?: Song[];
}

export const SongCard = memo(function SongCard({ song, playlist }: SongCardProps) {
  const { playTrack, currentTrack, isPlaying, togglePlay } = useMusic();
  const isActive = currentTrack?.id === song.id;
  const imageSrc = getBestImage(song);
  
  const startPos = useRef<{ x: number, y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!startPos.current) return;
    const dx = Math.abs(e.clientX - startPos.current.x);
    const dy = Math.abs(e.clientY - startPos.current.y);
    
    // Validate that this was a tap, not a scroll/slide
    if (dx < 5 && dy < 5) {
      playTrack(song, playlist);
    }
    startPos.current = null;
  };

  return (
    <div 
      className="group glass-card p-4 rounded-2xl transition-all hover:bg-white/10 cursor-pointer relative lag-free-tap"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{ touchAction: 'manipulation' }}
    >
      <div className="relative aspect-square mb-4 rounded-xl overflow-hidden shadow-2xl bg-neutral-900 flex items-center justify-center">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={song.name}
            fill
            className="object-cover transition-transform group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, 200px"
          />
        ) : (
          <Music2 className="h-12 w-12 text-neutral-800" />
        )}
        
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div 
            onPointerDown={(e) => {
              e.stopPropagation();
              if (isActive) togglePlay();
              else playTrack(song, playlist);
            }}
            className={cn(
              "p-4 bg-primary text-black rounded-full shadow-xl transition-all scale-90 group-hover:scale-110 hover:bg-primary/90 active:scale-95",
              isActive && isPlaying && "scale-100"
            )}
          >
            {isActive && isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className={cn(
          "font-bold text-sm truncate uppercase tracking-tight italic",
          isActive ? "text-primary" : "text-white"
        )}>
          {song.name}
        </h3>
        <p className="text-[10px] text-neutral-400 truncate uppercase font-medium">
          {getArtistNames(song)}
        </p>
      </div>
    </div>
  );
});
