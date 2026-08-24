'use client';

import React, { useState, useEffect } from 'react';
import { searchSongs } from '@/lib/music-api';
import { SongCard } from '@/components/music-player/song-card';
import { Button } from '@/components/ui/button';
import { Music2, Sparkles, Flame, CloudRain, Coffee, PartyPopper } from 'lucide-react';

const genres = [
  { name: 'Pop', icon: Sparkles, color: 'from-pink-500' },
  { name: 'Rock', icon: Flame, color: 'from-orange-500' },
  { name: 'Lofi', icon: CloudRain, color: 'from-blue-500' },
  { name: 'Acoustic', icon: Coffee, color: 'from-amber-500' },
  { name: 'Dance', icon: PartyPopper, color: 'from-purple-500' },
  { name: 'Focus', icon: Music2, color: 'from-emerald-500' },
];

export default function GenresPage() {
  const [selectedGenre, setSelectedGenre] = useState(genres[0].name);
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchGenre() {
      setLoading(true);
      const data = await searchSongs(selectedGenre);
      setSongs(data);
      setLoading(false);
    }
    fetchGenre();
  }, [selectedGenre]);

  return (
    <div className="p-8 pb-32 space-y-12">
      <header className="space-y-4">
        <h1 className="text-5xl font-black tracking-tighter uppercase italic">Explore Genres</h1>
        <p className="text-neutral-400 max-w-lg">Discover music tailored to your mood or style.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {genres.map((genre) => (
          <button
            key={genre.name}
            onClick={() => setSelectedGenre(genre.name)}
            className={`relative h-24 rounded-2xl overflow-hidden group transition-all p-4 text-left ${
              selectedGenre === genre.name ? 'ring-2 ring-primary scale-105' : 'hover:scale-105'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} to-black opacity-60`} />
            <div className="relative z-10 flex flex-col justify-between h-full">
              <genre.icon className="h-6 w-6 text-white" />
              <span className="font-black uppercase italic text-sm text-white">{genre.name}</span>
            </div>
          </button>
        ))}
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          Best of <span className="text-primary italic">{selectedGenre}</span>
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {loading ? (
            Array(10).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-neutral-900 rounded-xl animate-pulse" />
            ))
          ) : (
            songs.map((song) => (
              <SongCard key={song.id} song={song} playlist={songs} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
