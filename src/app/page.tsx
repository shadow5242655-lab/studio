'use client';

import React, { useEffect, useState } from 'react';
import { Song, getTrending, searchSongs } from '@/lib/music-api';
import { SongCard } from '@/components/music-player/song-card';
import { TrendingUp, Music2, Heart, Disc } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

function MusicSection({ title, initialQuery, icon: Icon }: { title: string; initialQuery?: string; icon: any }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = initialQuery ? await searchSongs(initialQuery) : await getTrending();
      setSongs(data);
      setLoading(false);
    };
    fetch();
  }, [initialQuery]);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-3">
          <Icon className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        </div>
      </div>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-6 px-6 md:px-12 pb-6">
          {loading ? (
            Array(6).fill(0).map((_, i) => <div key={i} className="w-[180px] h-[260px] bg-neutral-900 animate-pulse rounded-xl" />)
          ) : (
            songs.map((song) => <div key={song.id} className="w-[180px]"><SongCard song={song} playlist={songs} /></div>)
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}

export default function Home() {
  return (
    <div className="pb-40 space-y-12 pt-8">
      <header className="px-6 md:px-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome to AYUMUSIC</h1>
        <p className="text-neutral-400">Discover your next favorite sound.</p>
      </header>

      <MusicSection title="Trending Now" icon={TrendingUp} />
      <MusicSection title="Pop Hits" initialQuery="Pop" icon={Disc} />
      <MusicSection title="Acoustic Vibes" initialQuery="Acoustic" icon={Music2} />
      <MusicSection title="Romantic Favourites" initialQuery="Romantic" icon={Heart} />
    </div>
  );
}
