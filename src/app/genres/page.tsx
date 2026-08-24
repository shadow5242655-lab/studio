'use client';

import React, { useState, useEffect, useRef } from 'react';
import { searchSongs } from '@/lib/music-api';
import { SongCard } from '@/components/music-player/song-card';
import { Music2, Flame, CloudRain, Coffee, PartyPopper, Disc, Moon, Radio, Zap, Activity, Sparkles } from 'lucide-react';

const genres = [
  { name: 'Pop', icon: Disc, color: 'from-pink-500' },
  { name: 'Rock', icon: Flame, color: 'from-orange-500' },
  { name: 'Lofi', icon: CloudRain, color: 'from-blue-500' },
  { name: 'Acoustic', icon: Coffee, color: 'from-amber-500' },
  { name: 'Dance', icon: PartyPopper, color: 'from-purple-500' },
  { name: 'Focus', icon: Music2, color: 'from-emerald-500' },
];

const stations = [
  { name: 'Good night', icon: Moon, color: 'from-indigo-950', query: 'Soft Lofi Sleep' },
  { name: 'Fresh Radar', icon: Radio, color: 'from-blue-900', query: 'New Hit Music 2024' },
  { name: 'After Dark', icon: Zap, color: 'from-purple-950', query: 'Phonk Late Night' },
  { name: 'Deep Signal', icon: Activity, color: 'from-neutral-900', query: 'Deep Ambient Bass' },
];

export default function GenresPage() {
  const [selectedItem, setSelectedItem] = useState(genres[0].name);
  const [selectedQuery, setSelectedQuery] = useState(genres[0].name);
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const startPos = useRef<{ x: number, y: number, time: number } | null>(null);

  useEffect(() => {
    async function fetchGenre() {
      setLoading(true);
      const data = await searchSongs(selectedQuery);
      // Deduplicate results
      const uniqueSongs = Array.from(new Map(data.map(item => [item.id, item])).values());
      setSongs(uniqueSongs);
      setLoading(false);
    }
    fetchGenre();
  }, [selectedQuery]);

  const handlePointerDown = (e: React.PointerEvent) => {
    startPos.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handlePointerUp = (name: string, query: string) => (e: React.PointerEvent) => {
    if (!startPos.current) return;
    const dx = Math.abs(e.clientX - startPos.current.x);
    const dy = Math.abs(e.clientY - startPos.current.y);
    const dt = Date.now() - startPos.current.time;
    
    // Validate interaction threshold
    if (dx < 10 && dy < 10 && dt < 300) {
      setSelectedItem(name);
      setSelectedQuery(query);
    }
    startPos.current = null;
  };

  const handlePointerCancel = () => {
    startPos.current = null;
  };

  return (
    <div className="p-8 pb-32 space-y-12 max-w-7xl mx-auto animate-in fade-in duration-700">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-[0.2em] uppercase">
          <Sparkles className="h-3 w-3" />
          Frequency Curation
        </div>
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">Discovery</h1>
        <p className="text-neutral-400 max-w-lg font-medium">Architect your sound journey through curated genres and high-fidelity stations.</p>
      </header>

      {/* Genres Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-neutral-500">Global Genres</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {genres.map((genre) => (
            <button
              key={genre.name}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp(genre.name, genre.name)}
              onPointerCancel={handlePointerCancel}
              className={`relative h-28 rounded-2xl overflow-hidden group transition-all p-5 text-left lag-free-tap border border-white/5 ${
                selectedItem === genre.name ? 'ring-2 ring-primary scale-105' : 'hover:scale-105 hover:bg-white/5'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} to-black opacity-40`} />
              <div className="relative z-10 flex flex-col justify-between h-full">
                <genre.icon className="h-6 w-6 text-white" />
                <span className="font-black uppercase italic text-sm text-white tracking-tighter">{genre.name}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Mood Stations Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-neutral-500">Mood Stations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stations.map((station) => (
            <button
              key={station.name}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp(station.name, station.query)}
              onPointerCancel={handlePointerCancel}
              className={`relative h-32 rounded-3xl overflow-hidden group transition-all p-6 text-left lag-free-tap border border-white/5 ${
                selectedItem === station.name ? 'ring-2 ring-primary scale-105' : 'hover:scale-105 hover:bg-white/5'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${station.color} to-black opacity-60`} />
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <station.icon className="h-8 w-8 text-primary fill-primary/20" />
                  <div className="h-1 w-8 bg-white/20 rounded-full" />
                </div>
                <div className="space-y-1">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Curated</span>
                   <p className="font-black uppercase italic text-lg text-white tracking-tighter leading-none">{station.name}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Results Section */}
      <section className="space-y-8 pt-8 border-t border-white/5">
        <div className="flex items-center justify-between">
           <h2 className="text-3xl font-black italic uppercase tracking-tighter">
             Resonating: <span className="text-primary">{selectedItem}</span>
           </h2>
           <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">High-Fidelity Results</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {loading ? (
            Array(10).fill(0).map((_, i) => (
              <div key={`genre-skeleton-${i}`} className="h-48 bg-neutral-900 rounded-xl animate-pulse" />
            ))
          ) : (
            songs.map((song) => (
              <SongCard key={`genre-song-${song.id}`} song={song} playlist={songs} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
