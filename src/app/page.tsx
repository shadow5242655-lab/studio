'use client';

import React, { useEffect, useState } from 'react';
import { Song, getTrending, searchSongs } from '@/lib/music-api';
import { SongCard } from '@/components/music-player/song-card';
import { TrendingUp, Music2, Disc, Zap, Activity } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

function MusicSection({ title, initialQuery, icon: Icon, songs: externalSongs }: { title: string; initialQuery?: string; icon: any; songs?: Song[] }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (externalSongs) {
      setSongs(externalSongs);
      setLoading(false);
      return;
    }
    const fetch = async () => {
      setLoading(true);
      const data = initialQuery ? await searchSongs(initialQuery) : await getTrending();
      setSongs(data);
      setLoading(false);
    };
    fetch();
  }, [initialQuery, externalSongs]);

  if (!loading && songs.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">{title}</h2>
        </div>
      </div>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-6 px-6 md:px-12 pb-6">
          {loading ? (
            Array(6).fill(0).map((_, i) => <div key={i} className="w-[180px] h-[260px] glass-card animate-pulse rounded-2xl" />)
          ) : (
            songs.map((song) => <div key={song.id} className="w-[200px]"><SongCard song={song} playlist={songs} /></div>)
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}

export default function Home() {
  return (
    <div className="pb-40 space-y-16 pt-8 animate-in fade-in duration-1000">
      <header className="px-6 md:px-12">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-primary font-bold tracking-[0.2em] text-[10px] uppercase">
            <Activity className="h-3 w-3 animate-pulse" />
            Live Discovery
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-2 italic uppercase leading-none">
            The <span className="text-primary">Resonance</span>
          </h1>
          <p className="text-neutral-400 font-medium text-lg uppercase tracking-widest">Premium High-Fidelity Sound Discovery.</p>
        </div>
      </header>

      <MusicSection title="Trending Pulse" icon={TrendingUp} />
      <MusicSection title="Studio Originals" initialQuery="New Release" icon={Disc} />
      <MusicSection title="Acoustic Resonance" initialQuery="Unplugged" icon={Music2} />
      <MusicSection title="Neural Mix" initialQuery="Top Charts" icon={Zap} />
    </div>
  );
}