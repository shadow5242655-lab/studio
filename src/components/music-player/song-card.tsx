'use client';

import React, { memo } from 'react';
import { Play, Music2, Pause, User } from 'lucide-react';
import { Song, getBestImage, getArtistNames, getSmartRank } from '@/lib/music-api';
import { useMusic } from './player-context';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface SongCardProps {
  song: Song;
  playlist?: Song[];
}

export const SongCard = memo(function SongCard({ song, playlist }: SongCardProps) {
  const { playTrack, currentTrack, isPlaying, togglePlay, setArtistFilter } = useMusic();
  const isActive = currentTrack?.id === song.id;
  const imageSrc = getBestImage(song);
  const rank = getSmartRank(song);

  const handlePlayClick = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (isActive) togglePlay();
    else playTrack(song, playlist);
  };

  const handleArtistClick = (e: React.PointerEvent, artist: string) => {
    e.stopPropagation();
    setArtistFilter(artist);
  };

  return (
    <div 
      className="group bg-white/5 p-4 rounded-[2rem] transition-all hover:bg-white/10 cursor-pointer relative border border-white/5 shadow-sm hover:-translate-y-1 touch-btn"
      onPointerDown={() => playTrack(song, playlist)}
    >
      <div className="relative aspect-square mb-4 rounded-3xl overflow-hidden shadow-2xl bg-neutral-900 flex items-center justify-center border border-white/10">
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

        <div className="absolute top-2 left-2 z-20">
          <Badge variant="outline" className={cn(
            "text-[8px] font-black tracking-widest uppercase border-none px-2 py-0.5 rounded-sm",
            rank === 'ORIGINAL' ? "bg-primary text-black" : "bg-white/10 text-white"
          )}>
            {rank}
          </Badge>
        </div>
        
        <div 
          onPointerDown={handlePlayClick}
          className={cn(
            "absolute bottom-3 right-3 p-4 bg-primary text-black rounded-full shadow-2xl opacity-0 translate-y-2 transition-all duration-300 hover:scale-110 active:scale-90 z-20",
            (isActive || isPlaying) ? "opacity-100 translate-y-0" : "group-hover:opacity-100 group-hover:translate-y-0"
          )}
        >
          {isActive && isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-0.5" />}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 min-w-0">
        <h3 className={cn(
          "font-black text-sm truncate tracking-tight uppercase italic",
          isActive ? "text-primary" : "text-white"
        )}>
          {song.name}
        </h3>
        <div className="flex flex-wrap gap-x-1 gap-y-0.5">
          {song.artists.primary.map((artist, idx) => (
            <span 
              key={artist.id || idx}
              onPointerDown={(e) => handleArtistClick(e, artist.name)}
              className="text-[9px] text-neutral-500 hover:text-primary transition-colors font-black uppercase tracking-widest cursor-pointer"
            >
              {artist.name}{idx < song.artists.primary.length - 1 ? ',' : ''}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});
