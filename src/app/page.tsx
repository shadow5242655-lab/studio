
'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Song, getTrending, searchSongs } from '@/lib/music-api';
import { SongCard } from '@/components/music-player/song-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Play, Loader2, Clock, Info, TrendingUp } from 'lucide-react';
import { useMusic } from '@/components/music-player/player-context';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Home() {
  const [trending, setTrending] = useState<Song[]>([]);
  const [recommendations, setRecommendations] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const { playTrack, totalListeningTime, likedSongs } = useMusic();
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const heroImage = PlaceHolderImages.find(img => img.id === 'music-hero');

  const fetchTrending = useCallback(async (pageNum: number) => {
    try {
      const data = await getTrending(pageNum);
      return data;
    } catch (error) {
      return [];
    }
  }, []);

  const fetchRecommendations = useCallback(async () => {
    if (likedSongs.length === 0) return;
    const seed = likedSongs[0].artists.primary[0].name;
    const data = await searchSongs(seed);
    const uniqueRecs = Array.from(new Map(data.map(item => [item.id, item])).values());
    setRecommendations(uniqueRecs.slice(0, 5));
  }, [likedSongs]);

  useEffect(() => {
    async function init() {
      const data = await fetchTrending(1);
      const uniqueData = Array.from(new Map(data.map(item => [item.id, item])).values());
      setTrending(uniqueData);
      setLoading(false);
      fetchRecommendations();
    }
    init();
  }, [fetchTrending, fetchRecommendations]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const newData = await fetchTrending(nextPage);
    if (newData.length > 0) {
      setTrending(prev => {
        const existingIds = new Set(prev.map(s => s.id));
        const uniqueNewData = newData.filter(s => !existingIds.has(s.id));
        return [...prev, ...uniqueNewData];
      });
      setPage(nextPage);
    }
    setLoadingMore(false);
  }, [page, loadingMore, fetchTrending]);

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    observerRef.current = observer;
    return () => observerRef.current?.disconnect();
  }, [loading, loadingMore, handleLoadMore]);

  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${remainingSeconds}s`;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="pb-32">
      {/* Hero */}
      <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden bg-neutral-900">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
        <img 
          src={heroImage?.imageUrl || "https://picsum.photos/seed/music-studio-neon/1600/900"} 
          alt="Hero" 
          className="w-full h-full object-cover opacity-60"
          data-ai-hint={heroImage?.imageHint || "music studio"}
        />
        <div className="absolute bottom-0 left-0 p-6 md:p-12 z-20 space-y-4 max-w-3xl">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white uppercase italic leading-[0.8]">
            AYUMUSIC
          </h1>
          <p className="text-neutral-300 text-sm md:text-xl max-w-lg font-medium">
            Listen to millions of songs in high fidelity. Your sanctuary for sound.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button size="lg" className="rounded-full px-8 md:px-12 font-black gap-3 h-14 text-lg hover:scale-105 transition-transform" onClick={() => trending.length > 0 && playTrack(trending[0], trending)}>
              <Play className="h-6 w-6 fill-current" />
              PLAY NOW
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="rounded-full px-8 font-bold border-white/10 text-white hover:bg-white/5 gap-3 h-14">
                  <Info className="h-4 w-4" />
                  STATS
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-neutral-950 border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Listening History</DialogTitle>
                </DialogHeader>
                <div className="py-8 space-y-6">
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-center gap-4">
                    <Clock className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-xs font-bold uppercase text-neutral-500">Total Time</p>
                      <p className="text-2xl font-black text-white italic">{formatTotalTime(totalListeningTime)}</p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-12 space-y-20">
        {/* Personalized Section */}
        {recommendations.length > 0 && (
          <section>
            <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic mb-8">For You</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {recommendations.map((song) => (
                <SongCard key={`rec-${song.id}`} song={song} playlist={recommendations} />
              ))}
            </div>
          </section>
        )}

        {/* Trending Section */}
        <section>
          <div className="flex items-center gap-4 mb-8">
             <TrendingUp className="h-6 w-6 text-primary" />
             <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">Trending</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {loading ? (
              Array(10).fill(0).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square w-full rounded-2xl bg-neutral-900" />
                  <Skeleton className="h-4 w-3/4 bg-neutral-900" />
                </div>
              ))
            ) : (
              trending.map((song) => (
                <SongCard key={`trending-${song.id}`} song={song} playlist={trending} />
              ))
            )}
          </div>

          <div ref={sentinelRef} className="h-40 flex items-center justify-center">
            {loadingMore && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
          </div>
        </section>
      </div>
    </div>
  );
}
