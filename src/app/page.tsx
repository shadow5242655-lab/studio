'use client';

import React, { useEffect, useState } from 'react';
import { Song, getTrending } from '@/lib/music-api';
import { SongCard } from '@/components/music-player/song-card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [trending, setTrending] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const data = await getTrending();
      setTrending(data);
      setLoading(false);
    }
    init();
  }, []);

  return (
    <div className="p-8 space-y-8 pb-32">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Trending Now</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {loading ? (
          Array(10).fill(0).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))
        ) : (
          trending.map((song) => (
            <SongCard key={song.id} song={song} playlist={trending} />
          ))
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Made For You</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {!loading && trending.slice().reverse().slice(0, 5).map((song) => (
            <SongCard key={song.id} song={song} playlist={trending} />
          ))}
        </div>
      </div>
    </div>
  );
}