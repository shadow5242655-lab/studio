'use client';

import React from 'react';
import { useMusic } from '@/components/music-player/player-context';
import { SongCard } from '@/components/music-player/song-card';
import { Heart, Music2, ListMusic } from 'lucide-react';
import Link from 'next/link';

export default function LibraryPage() {
  const { likedSongs, playlists } = useMusic();

  return (
    <div className="p-8 pb-32 space-y-12">
      <header className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic">Library</h1>
        <p className="text-neutral-400 max-w-xl">Your personal collection of tracks and playlists, curated by you.</p>
      </header>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-red-400 p-2 rounded-lg">
              <Heart className="h-5 w-5 fill-white text-white" />
            </div>
            Liked Songs
          </h2>
          <Link href="/liked" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">
            View All
          </Link>
        </div>
        
        {likedSongs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {likedSongs.slice(0, 5).map((song) => (
              <SongCard key={song.id} song={song} playlist={likedSongs} />
            ))}
          </div>
        ) : (
          <div className="bg-neutral-900/50 border border-white/5 p-12 rounded-3xl text-center space-y-4">
            <Heart className="h-12 w-12 text-neutral-800 mx-auto" />
            <p className="text-neutral-500 font-medium">Songs you like will appear here.</p>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="bg-neutral-800 p-2 rounded-lg">
              <ListMusic className="h-5 w-5 text-white" />
            </div>
            Your Playlists
          </h2>
        </div>

        {playlists.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {playlists.map((playlist) => (
              <Link 
                key={playlist.id} 
                href={`/playlists?id=${playlist.id}`}
                className="group bg-neutral-900/30 p-5 rounded-2xl transition-all hover:bg-neutral-800/80 border border-white/5"
              >
                <div className="aspect-square mb-5 rounded-xl bg-neutral-800 flex items-center justify-center overflow-hidden shadow-2xl relative group">
                  <Music2 className="h-16 w-16 text-neutral-700" />
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-bold text-white truncate">{playlist.name}</h3>
                <p className="text-xs text-muted-foreground">{playlist.songs.length} tracks</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-neutral-900/50 border border-white/5 p-12 rounded-3xl text-center space-y-4">
            <Music2 className="h-12 w-12 text-neutral-800 mx-auto" />
            <p className="text-neutral-500 font-medium">Create your first playlist in the sidebar.</p>
          </div>
        )}
      </section>
    </div>
  );
}