
'use client';

import React from 'react';
import { Play, Music2, Pause } from 'lucide-react';
import { Song, getBestImage, getArtistNames } from '@/lib/music-api';
import { useMusic } from './player-context';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface SongCardProps {
  song: Song;
  playlist?: Song[];
}

export function SongCard({ song, playlist }: SongCardProps) {
  const { playTrack, currentTrack, isPlaying, togglePlay } = useMusic();
  const isActive = currentTrack?.id === song.id;
  const imageSrc = getBestImage(song);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive) {
      togglePlay();
    } else {
      playTrack(song, playlist);
    }
  };

  return (
    <div 
      className="group bg-neutral-900/30 p-5 rounded-2xl transition-all hover:bg-neutral-800/80 cursor-pointer relative border border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-1"
      onClick={() => playTrack(song, playlist)}
    >
      <div className="relative aspect-square mb-5 rounded-xl overflow-hidden shadow-2xl bg-neutral-900 flex items-center justify-center border border-white/5">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={song.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, 200px"
          />
        ) : (
          <Music2 className="h-16 w-16 text-neutral-800" />
        )}
        
        {/* Play Button Overlay */}
        <div 
          onClick={handlePlayClick}
          className={cn(
            "absolute bottom-4 right-4 p-4 bg-primary rounded-full shadow-2xl opacity-0 translate-y-3 transition-all duration-300 hover:scale-105 active:scale-95 z-20",
            (isActive || isPlaying) ? "opacity-100 translate-y-0" : "group-hover:opacity-100 group-hover:translate-y-0",
            isActive && isPlaying && "bg-white text-black"
          )}
        >
          {isActive && isPlaying ? (
            <Pause className="h-6 w-6 fill-current" />
          ) : (
            <Play className="h-6 w-6 fill-current ml-1" />
          )}
        </div>

        {/* Playing Indicator */}
        {isActive && isPlaying && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
            <div className="flex gap-1 items-end h-8">
              <div className="w-1.5 bg-primary animate-[bounce_0.6s_infinite_0s] rounded-full" />
              <div className="w-1.5 bg-primary animate-[bounce_0.6s_infinite_0.2s] rounded-full h-1/2" />
              <div className="w-1.5 bg-primary animate-[bounce_0.6s_infinite_0.4s] rounded-full h-3/4" />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5 min-w-0">
        <h3 className={cn(
          "font-bold text-base truncate leading-none py-1",
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
