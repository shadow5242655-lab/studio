
'use client';

import React, { memo, useRef } from 'react';
import { Play, Music2, Pause, MoreVertical, Forward, ListMusic, PlusCircle, Download } from 'lucide-react';
import { Song, getBestImage, getBestDownload } from '@/lib/music-api';
import { useMusic } from './player-context';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSub, 
  DropdownMenuSubTrigger, 
  DropdownMenuSubContent, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface SongCardProps {
  song: Song;
  playlist?: Song[];
}

export const SongCard = memo(function SongCard({ song, playlist }: SongCardProps) {
  const { playTrack, currentTrack, isPlaying, togglePlay, playNext, addToQueue, playlists, addToPlaylist } = useMusic();
  const router = useRouter();
  const isActive = currentTrack?.id === song.id;
  const imageSrc = getBestImage(song);
  
  const startPos = useRef<{ x: number, y: number, time: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    startPos.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handlePointerUp = (callback: () => void) => (e: React.PointerEvent) => {
    if (!startPos.current) return;
    const dx = Math.abs(e.clientX - startPos.current.x);
    const dy = Math.abs(e.clientY - startPos.current.y);
    const dt = Date.now() - startPos.current.time;
    
    // Threshold validation for scroll-safe interaction
    if (dx < 10 && dy < 10 && dt < 300) {
      callback();
    }
    startPos.current = null;
  };

  const handlePointerCancel = () => {
    startPos.current = null;
  };

  const handleArtistClick = (e: React.PointerEvent, artistName: string) => {
    e.stopPropagation();
    router.push(`/search?q=${encodeURIComponent(artistName)}`);
  };

  const handleDownload = (e: React.PointerEvent) => {
    e.stopPropagation();
    const url = getBestDownload(song);
    if (url) window.open(url, '_blank');
  };

  return (
    <div 
      className="group glass-card p-4 rounded-2xl transition-all hover:bg-white/10 cursor-pointer relative lag-free-tap"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp(() => playTrack(song, playlist))}
      onPointerCancel={handlePointerCancel}
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
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp((e?: any) => {
              if (e) e.stopPropagation();
              if (isActive) togglePlay();
              else playTrack(song, playlist);
            })}
            onPointerCancel={handlePointerCancel}
            className={cn(
              "p-4 bg-primary text-black rounded-full shadow-xl transition-all scale-90 group-hover:scale-110 hover:bg-primary/90 active:scale-95",
              isActive && isPlaying && "scale-100"
            )}
          >
            {isActive && isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
          </div>
        </div>

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full bg-black/60 text-white hover:bg-black/80"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-card text-white w-56 border-white/10" align="end">
              <DropdownMenuItem onPointerDown={() => playNext(song)} className="hover:bg-primary/20 cursor-pointer">
                <Forward className="mr-2 h-4 w-4" /> Play Next
              </DropdownMenuItem>
              <DropdownMenuItem onPointerDown={() => addToQueue(song)} className="hover:bg-primary/20 cursor-pointer">
                <ListMusic className="mr-2 h-4 w-4" /> Add to Queue
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="hover:bg-primary/20 cursor-pointer">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add to Playlist
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="glass-card text-white border-white/10">
                  {playlists.map(p => (
                    <DropdownMenuItem key={p.id} onPointerDown={() => addToPlaylist(p.id, song)} className="hover:bg-primary/20 cursor-pointer">
                      {p.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem onPointerDown={handleDownload} className="hover:bg-primary/20 cursor-pointer">
                <Download className="mr-2 h-4 w-4" /> Download
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
          {song.artists.primary.map((artist, index) => (
            <span key={artist.id || index}>
              <span 
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp(() => handleArtistClick({ stopPropagation: () => {} } as any, artist.name))}
                className="hover:text-white hover:underline cursor-pointer"
              >
                {artist.name}
              </span>
              {index < song.artists.primary.length - 1 ? ', ' : ''}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
});
