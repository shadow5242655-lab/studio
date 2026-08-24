'use client';

import React, { memo } from 'react';
import { Play, Music2, Pause } from 'lucide-react';
import { Song, getBestImage, getArtistNames } from '@/lib/music-api';
import { useMusic } from './player-context';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface SongCardProps {
  song: Song;
  playlist?: Song[];
}

// Memoize SongCard to prevent re-renders during high-frequency time updates
export const SongCard = memo(function SongCard({ song, playlist }: SongCardProps) {
  const { playTrack, currentTrack, isPlaying, togglePlay } = useMusic();
  const isActive = currentTrack?.id === song.id;
  const imageSrc = getBestImage(song);

  const handlePlayClick = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (isActive) {
      togglePlay();
    } else {
      playTrack(song, playlist);
    }
  };

  return (
    <div 
      className="group bg-neutral-900/40 p-4 rounded-2xl transition-all hover:bg-neutral-800/80 cursor-pointer relative border border-white/5 shadow-sm hover:-translate-y-1 touch-feedback will-change-transform"
      onPointerDown={() => playTrack(song, playlist)}
    >
      <div className="relative aspect-square mb-4 rounded-xl overflow-hidden shadow-2xl bg-neutral-900 flex items-center justify-center border border-white/5">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={song.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, 200px"
          />
        ) : (
          <Music2 className="h-16 w-16 text-neutral-800" />
        )}
        
        {/* Play Button Overlay */}
        <div 
          onPointerDown={handlePlayClick}
          className={cn(
            "absolute bottom-3 right-3 p-4 bg-primary rounded-full shadow-2xl opacity-0 translate-y-2 transition-all duration-300 hover:scale-110 active:scale-90 z-20",
            (isActive || isPlaying) ? "opacity-100 translate-y-0" : "group-hover:opacity-100 group-hover:translate-y-0",
            isActive && isPlaying && "bg-white text-black"
          )}
        >
          {isActive && isPlaying ? (
            <Pause className="h-6 w-6 fill-current" />
          ) : (
            <Play className="h-6 w-6 fill-current ml-0.5" />
          )}
        </div>

        {/* Playing Indicator */}
        {isActive && isPlaying && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
            <div className="flex gap-1 items-end h-6">
              <div className="w-1.5 bg-primary animate-[bounce_0.6s_infinite_0s] rounded-full" />
              <div className="w-1.5 bg-primary animate-[bounce_0.6s_infinite_0.2s] rounded-full h-1/2" />
              <div className="w-1.5 bg-primary animate-[bounce_0.6s_infinite_0.4s] rounded-full h-3/4" />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5 min-w-0">
        <h3 className={cn(
          "font-black text-sm truncate tracking-tight leading-none uppercase italic",
          isActive ? "text-primary" : "text-white"
        )}>
          {song.name}
        </h3>
        <p className="text-[10px] text-muted-foreground truncate font-bold uppercase tracking-wider opacity-70">
          {getArtistNames(song)}
        </p>
      </div>
    </div>
  );
});
