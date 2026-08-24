'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Search, Music, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Song, searchSongs, 
  applySmartRank3
} from '@/lib/music-api';
import { SongCard } from '@/components/music-player/song-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMusic } from '@/components/music-player/player-context';
import { useSearchParams } from 'next/navigation';

function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [rawSongs, setRawSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const { songPopularity } = useMusic();

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setRawSongs([]);
        return;
      }
      setLoading(true);
      try {
        const songData = await searchSongs(query);
        const uniqueSongs = Array.from(new Map(songData.map(item => [item.id, item])).values());
        setRawSongs(uniqueSongs);
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const rankedSongs = useMemo(() => {
    return applySmartRank3(rawSongs, songPopularity);
  }, [rawSongs, songPopularity]);

  return (
    <div className="p-8 pb-32 min-h-full max-w-7xl mx-auto">
      <div className="max-w-2xl relative mb-12">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-neutral-500" />
        <Input
          placeholder="Search for high-fidelity sounds, artists, or vibes..."
          className="pl-16 bg-neutral-900 border-none rounded-2xl h-16 text-xl focus-visible:ring-primary/50 shadow-2xl transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {loading && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      {query ? (
        <div className="space-y-12 animate-in fade-in duration-500">
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Music className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tighter uppercase italic">Search Results</h2>
                <p className="text-[9px] font-bold text-primary italic tracking-widest uppercase">SmartRank3 Prioritized</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {loading ? (
                Array(10).fill(0).map((_, i) => (
                  <div key={`skeleton-song-${i}`} className="space-y-3">
                    <Skeleton className="aspect-square w-full rounded-2xl" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))
              ) : rankedSongs.map((song) => (
                <SongCard key={`search-song-${song.id}`} song={song} playlist={rankedSongs} />
              ))}
            </div>
            
            {!loading && rankedSongs.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-neutral-500 italic text-xl font-bold uppercase tracking-widest">No matching frequencies found.</p>
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center opacity-40">
          <div className="bg-neutral-900 p-12 rounded-full mb-8 border border-white/5">
            <Search className="h-24 w-24 text-neutral-800" />
          </div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Artist Discovery</h2>
          <p className="text-neutral-500 max-w-sm font-medium">Search for an artist or tap their name on any track to instantly filter their high-fidelity lineage.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-neutral-500">Loading discovery engine...</div>}>
      <SearchContent />
    </Suspense>
  );
}