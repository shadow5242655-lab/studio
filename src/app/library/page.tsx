'use client';

import React from 'react';
import { useMusic } from '@/components/music-player/player-context';
import { SongCard } from '@/components/music-player/song-card';
import { Heart, Music2, ListMusic } from 'lucide-react';
import Link from 'next/link';

export default function LibraryPage() {
  const { likedSongs, playlists } = useMusic();

  return (
    <div className="p-8 pb-32 space-y-12 max-w-7xl mx-auto">
      <header className="space-y-4">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase italic leading-none">Your Library</h1>
        <p className="text-neutral-400 max-w-xl font-medium">Manage your personal collection of liked tracks and sound architectures.</p>
      </header>

      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            Liked Songs
          </h2>
          <Link href="/liked" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">
            View All
          </Link>
        </div>
        
        {likedSongs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {likedSongs.slice(0, 10).map((song) => (
              <SongCard key={song.id} song={song} playlist={likedSongs} />
            ))}
          </div>
        ) : (
          <div className="bg-neutral-900/30 border border-white/5 p-12 rounded-2xl text-center space-y-4">
            <Heart className="h-12 w-12 text-neutral-800 mx-auto" />
            <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">No liked songs yet.</p>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
            <ListMusic className="h-6 w-6 text-white" />
            Playlists
          </h2>
        </div>

        {playlists.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {playlists.map((playlist) => (
              <Link 
                key={playlist.id} 
                href={`/playlists?id=${playlist.id}`}
                className="group bg-neutral-900/20 p-4 rounded-2xl transition-all hover:bg-neutral-800/50 border border-white/5"
              >
                <div className="aspect-square mb-4 rounded-xl bg-neutral-800 flex items-center justify-center overflow-hidden relative group">
                  <Music2 className="h-12 w-12 text-neutral-700" />
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-bold text-white truncate text-base italic uppercase">{playlist.name}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">{playlist.songs.length} Tracks</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-neutral-900/30 border border-white/5 p-12 rounded-2xl text-center space-y-4">
            <Music2 className="h-12 w-12 text-neutral-800 mx-auto" />
            <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">No playlists created.</p>
          </div>
        )}
      </section>
    </div>
  );
}
