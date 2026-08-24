'use client';

import React from 'react';
import { useMusic } from '@/components/music-player/player-context';
import { SongCard } from '@/components/music-player/song-card';
import { Heart, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LikedSongsPage() {
  const { likedSongs, playTrack } = useMusic();

  const handlePlayAll = () => {
    if (likedSongs.length > 0) {
      playTrack(likedSongs[0], likedSongs);
    }
  };

  return (
    <div className="pb-32 min-h-full bg-gradient-to-b from-primary/10 to-transparent">
      <header className="p-8 md:p-12 flex flex-col md:flex-row items-end gap-8 bg-gradient-to-b from-primary/20 to-transparent">
        <div className="w-48 h-48 md:w-64 md:h-64 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] bg-gradient-to-br from-primary to-red-400 flex items-center justify-center rounded-2xl">
          <Heart className="h-24 w-24 md:h-32 md:w-32 fill-white text-white" />
        </div>
        <div className="space-y-4">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Playlist</span>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white uppercase italic">Liked Songs</h1>
          <div className="flex items-center gap-3 text-sm font-bold text-neutral-300">
            <span>AYUMUSIC</span>
            <div className="h-1 w-1 bg-neutral-600 rounded-full" />
            <span>{likedSongs.length} songs</span>
          </div>
          <Button size="lg" className="rounded-full px-10 h-14 text-lg font-bold shadow-2xl hover:scale-105 transition-transform" onClick={handlePlayAll}>
            <Play className="mr-2 h-6 w-6 fill-current" />
            Play
          </Button>
        </div>
      </header>

      <div className="p-8">
        {likedSongs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {likedSongs.map((song) => (
              <SongCard key={song.id} song={song} playlist={likedSongs} />
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
            <Heart className="h-20 w-20 text-neutral-900" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Songs you like will appear here</h2>
              <p className="text-neutral-500">Save songs by tapping the heart icon.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}