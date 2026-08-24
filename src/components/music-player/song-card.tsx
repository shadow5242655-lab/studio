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
      className="group bg-neutral-900/40 p-4 rounded-xl transition-all hover:bg-neutral-800/60 cursor-pointer relative"
      onClick={() => playTrack(song, playlist)}
    >
      <div className="relative aspect-square mb-4 rounded-lg overflow-hidden shadow-lg bg-neutral-900 flex items-center justify-center">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={song.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 200px"
          />
        ) : (
          <Music2 className="h-12 w-12 text-neutral-800" />
        )}
        
        <div 
          onClick={(e) => {
            e.stopPropagation();
            if (isActive) togglePlay();
            else playTrack(song, playlist);
          }}
          className={cn(
            "absolute bottom-2 right-2 p-3 bg-green-500 text-black rounded-full shadow-xl opacity-0 translate-y-2 transition-all group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95",
            isActive && isPlaying && "opacity-100 translate-y-0"
          )}
        >
          {isActive && isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
        </div>
      </div>

      <div className="space-y-1">
        <h3 className={cn(
          "font-semibold text-sm truncate",
          isActive ? "text-green-500" : "text-white"
        )}>
          {song.name}
        </h3>
        <p className="text-xs text-neutral-400 truncate">
          {getArtistNames(song)}
        </p>
      </div>
    </div>
  );
});
