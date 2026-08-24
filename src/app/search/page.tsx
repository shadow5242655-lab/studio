'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Song, searchSongs } from '@/lib/music-api';
import { SongCard } from '@/components/music-player/song-card';
import { Skeleton } from '@/components/ui/skeleton';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      const data = await searchSongs(query);
      setResults(data);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="p-8 pb-32">
      <div className="max-w-md relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
        <Input
          placeholder="What do you want to listen to?"
          className="pl-10 bg-neutral-800 border-none rounded-full h-12 text-lg focus-visible:ring-white/20"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {query ? (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">Search results for "{query}"</h2>
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
              results.map((song) => (
                <SongCard key={song.id} song={song} playlist={results} />
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-neutral-800 p-8 rounded-full mb-6">
            <Search className="h-16 w-16 text-neutral-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Start searching</h2>
          <p className="text-muted-foreground">Find your favorite songs, artists, and albums.</p>
        </div>
      )}
    </div>
  );
}