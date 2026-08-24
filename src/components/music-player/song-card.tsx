
'use client';

import React from 'react';
import { Play, Music2 } from 'lucide-react';
import { Song, getBestImage, getArtistNames } from '@/lib/music-api';
import { useMusic } from './player-context';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface SongCardProps {
  song: Song;
  playlist?: Song[];
}

export function SongCard({ song, playlist }: SongCardProps) {
  const { playTrack, currentTrack, isPlaying } = useMusic();
  const isActive = currentTrack?.id === song.id;
  const imageSrc = getBestImage(song);

  return (
    <div 
      className="group bg-neutral-900/40 p-4 rounded-md transition-all hover:bg-neutral-800 cursor-pointer relative"
      onClick={() => playTrack(song, playlist)}
    >
      <div className="relative aspect-square mb-4 rounded-md overflow-hidden shadow-2xl bg-neutral-800 flex items-center justify-center">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={song.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <Music2 className="h-12 w-12 text-neutral-600" />
        )}
        <div className={cn(
          "absolute bottom-2 right-2 p-3 bg-primary rounded-full shadow-xl opacity-0 translate-y-2 transition-all group-hover:opacity-100 group-hover:translate-y-0",
          isActive && isPlaying && "opacity-100 translate-y-0"
        )}>
          <Play className="h-5 w-5 fill-white text-white" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className={cn(
          "font-bold text-sm truncate",
          isActive ? "text-primary" : "text-white"
        )}>
          {song.name}
        </h3>
        <p className="text-xs text-muted-foreground truncate font-medium">
          {getArtistNames(song)}
        </p>
      </div>
    </div>
  );
}
