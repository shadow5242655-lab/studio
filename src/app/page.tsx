'use client';

import React, { useEffect, useState } from 'react';
import { Song, getTrending } from '@/lib/music-api';
import { SongCard } from '@/components/music-player/song-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Play, Sparkles, Plus, Loader2 } from 'lucide-react';
import { useMusic } from '@/components/music-player/player-context';

export default function Home() {
  const [trending, setTrending] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const { playTrack } = useMusic();

  useEffect(() => {
    async function init() {
      const data = await getTrending(1);
      setTrending(data);
      setLoading(false);
    }
    init();
  }, []);

  const handleHeroPlay = () => {
    if (trending.length > 0) {
      playTrack(trending[0], trending);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const newData = await getTrending(nextPage);
    if (newData.length > 0) {
      setTrending(prev => [...prev, ...newData]);
      setPage(nextPage);
    }
    setLoadingMore(false);
  };

  return (
    <div className="pb-32">
      {/* Hero Banner */}
      <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden bg-neutral-900">
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent z-10" />
        <img 
          src="https://picsum.photos/seed/ayuhero/1600/800" 
          alt="Banner" 
          className="w-full h-full object-cover opacity-50"
          data-ai-hint="music concert"
        />
        <div className="absolute bottom-0 left-0 p-8 md:p-12 z-20 space-y-4 max-w-2xl">
          <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
            <Sparkles className="h-4 w-4" />
            Featured Artist
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white uppercase italic">
            AYUMUSIC
          </h1>
          <p className="text-neutral-300 text-sm md:text-lg line-clamp-2">
            Experience the latest and greatest in high-fidelity music streaming. Explore trending tracks curated just for you.
          </p>
          <div className="flex gap-4 pt-2">
            <Button size="lg" className="rounded-full px-8 font-bold gap-2" onClick={handleHeroPlay}>
              <Play className="h-5 w-5 fill-current" />
              Listen Now
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 font-bold border-white/20 text-white hover:bg-white/10">
              Details
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-12">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Trending Now</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {loading ? (
              Array(10).fill(0).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))
            ) : (
              trending.map((song, index) => (
                <SongCard key={`${song.id}-${index}`} song={song} playlist={trending} />
              ))
            )}
          </div>

          {!loading && (
            <div className="mt-12 flex justify-center">
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full border-primary/20 hover:bg-primary/10 px-10 gap-2 font-bold transition-all"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
                {loadingMore ? 'Loading More...' : 'Show More Music'}
              </Button>
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Recommended For You</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {!loading && trending.slice(0, 5).reverse().map((song, index) => (
              <SongCard key={`rec-${song.id}-${index}`} song={song} playlist={trending} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
