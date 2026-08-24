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

export const SongCard = memo(function SongCard({ song, playlist }: SongCardProps) {
  const { playTrack, currentTrack, isPlaying, togglePlay } = useMusic();
  const isActive = currentTrack?.id === song.id;
  const imageSrc = getBestImage(song);

  return (
    <div 
      className="group glass-card p-4 rounded-2xl transition-all hover:bg-white/10 cursor-pointer relative lag-free-tap"
      onPointerDown={() => playTrack(song, playlist)}
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
        
        <div 
          onPointerDown={(e) => {
            e.stopPropagation();
            if (isActive) togglePlay();
            else playTrack(song, playlist);
          }}
          className={cn(
            "absolute bottom-2 right-2 p-3 bg-primary text-black rounded-full shadow-xl opacity-0 translate-y-2 transition-all group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95",
            isActive && isPlaying && "opacity-100 translate-y-0"
          )}
        >
          {isActive && isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
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
