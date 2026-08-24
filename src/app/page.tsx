
'use client';

import React, { useEffect, useState } from 'react';
import { Song, getTrending } from '@/lib/music-api';
import { SongCard } from '@/components/music-player/song-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Play, Sparkles } from 'lucide-react';
import { useMusic } from '@/components/music-player/player-context';

export default function Home() {
  const [trending, setTrending] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { playTrack } = useMusic();

  useEffect(() => {
    async function init() {
      const data = await getTrending();
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
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white uppercase">
            The Beats of AYUMUSIC
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
            <Button variant="link" className="text-muted-foreground hover:text-primary font-bold text-xs uppercase tracking-wider">
              See All
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-xl" />
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
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Recommended For You</h2>
            <Button variant="link" className="text-muted-foreground hover:text-primary font-bold text-xs uppercase tracking-wider">
              See All
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {!loading && trending.slice().reverse().slice(0, 5).map((song) => (
              <SongCard key={song.id} song={song} playlist={trending} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
