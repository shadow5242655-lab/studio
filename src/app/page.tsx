'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Song, getTrending, formatDuration, searchSongs } from '@/lib/music-api';
import { SongCard } from '@/components/music-player/song-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Play, Sparkles, Loader2, Clock, Info, TrendingUp, Heart } from 'lucide-react';
import { useMusic } from '@/components/music-player/player-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Home() {
  const [trending, setTrending] = useState<Song[]>([]);
  const [recommendations, setRecommendations] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const { playTrack, totalListeningTime, playedHistory, likedSongs } = useMusic();
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

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
            Featured Experience
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white uppercase italic">
            AYUMUSIC
          </h1>
          <p className="text-neutral-300 text-sm md:text-lg line-clamp-2">
            High-fidelity streaming for the uncompromising listener. Discover your sound, track your stats, and build your legacy.
          </p>
          <div className="flex gap-4 pt-2">
            <Button size="lg" className="rounded-full px-8 font-bold gap-2" onClick={() => trending.length > 0 && playTrack(trending[0], trending)}>
              <Play className="h-5 w-5 fill-current" />
              Listen Now
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="rounded-full px-8 font-bold border-white/20 text-white hover:bg-white/10 gap-2">
                  <Info className="h-4 w-4" />
                  Stats
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-neutral-900 border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Your Journey</DialogTitle>
                </DialogHeader>
                <div className="py-8 space-y-6">
                  <div className="flex items-center gap-4 bg-white/5 p-6 rounded-2xl border border-white/5">
                    <div className="bg-primary/20 p-4 rounded-full">
                      <Clock className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">Listening Time</p>
                      <p className="text-3xl font-black tracking-tighter text-white italic">{formatTotalTime(totalListeningTime)}</p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-16">
        {recommendations.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Personalized for You</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {recommendations.map((song) => (
                <SongCard key={`rec-${song.id}`} song={song} playlist={recommendations} />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-neutral-800 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Global Charts</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))
            ) : (
              trending.map((song) => (
                <SongCard key={`trending-${song.id}`} song={song} playlist={trending} />
              ))
            )}
          </div>

          <div ref={sentinelRef} className="h-20 flex items-center justify-center mt-10">
            {loadingMore && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
          </div>
        </section>
      </div>
    </div>
  );
}
