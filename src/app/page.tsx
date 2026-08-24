'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Song, getTrending, searchSongs } from '@/lib/music-api';
import { SongCard } from '@/components/music-player/song-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Play, Loader2, Clock, Info, TrendingUp, Sparkles, Music2 } from 'lucide-react';
import { useMusic } from '@/components/music-player/player-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Image from 'next/image';

export default function Home() {
  const [trending, setTrending] = useState<Song[]>([]);
  const [recommendations, setRecommendations] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const { playTrack, totalListeningTime, likedSongs } = useMusic();
  
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
      {/* Premium Hero */}
      <div className="relative h-[400px] md:h-[550px] w-full overflow-hidden bg-neutral-900">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-transparent z-10" />
        <img 
          src="https://picsum.photos/seed/premium-ayu/1600/900" 
          alt="Hero" 
          className="w-full h-full object-cover opacity-50 transition-transform duration-[10s] hover:scale-110"
          data-ai-hint="luxury concert"
        />
        <div className="absolute bottom-0 left-0 p-6 md:p-12 z-20 space-y-6 max-w-3xl w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            <Sparkles className="h-3 w-3" />
            Defining Excellence
          </div>
          <h1 className="text-5xl md:text-9xl font-black tracking-tighter text-white uppercase italic leading-[0.8]">
            THE <br/> <span className="text-primary">SOUND</span>
          </h1>
          <p className="text-neutral-300 text-sm md:text-xl max-w-lg leading-relaxed font-medium">
            Beyond streaming. A curated journey for the audiophile who values the texture of sound.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button size="lg" className="rounded-full px-8 md:px-12 font-black gap-3 h-14 text-lg hover:scale-105 transition-transform shadow-2xl shadow-primary/20" onClick={() => trending.length > 0 && playTrack(trending[0], trending)}>
              <Play className="h-6 w-6 fill-current" />
              PLAY NOW
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="rounded-full px-8 font-bold border-white/10 text-white hover:bg-white/5 gap-3 h-14">
                  <Info className="h-4 w-4" />
                  STUDIO STATS
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-neutral-950 border-white/10 text-white sm:max-w-md backdrop-blur-3xl">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter">Sonic History</DialogTitle>
                </DialogHeader>
                <div className="py-10 space-y-6">
                  <div className="bg-white/5 p-8 rounded-3xl border border-white/5 flex items-center gap-6">
                    <div className="bg-primary/20 p-5 rounded-full">
                      <Clock className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-2">Total Immersion</p>
                      <p className="text-4xl font-black tracking-tighter text-white italic">{formatTotalTime(totalListeningTime)}</p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-12 space-y-24">
        {/* Stories Section */}
        <section className="animate-in fade-in duration-1000 delay-300">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-black uppercase tracking-[0.4em] text-neutral-500">Music Stories</h2>
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-6 pb-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="group relative">
                  <div className="h-20 w-20 md:h-24 md:w-24 rounded-full p-[3px] bg-gradient-to-tr from-primary via-red-500 to-orange-400 cursor-pointer transition-transform hover:rotate-12 active:scale-95">
                    <div className="h-full w-full rounded-full border-[3px] border-black overflow-hidden bg-neutral-800">
                      <img 
                        src={`https://picsum.photos/seed/story-${i}/200/200`} 
                        alt="Story" 
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                  </div>
                  <span className="block text-center text-[10px] font-bold text-neutral-500 mt-2 group-hover:text-white transition-colors">Preview {i+1}</span>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>

        {/* Personalized Section */}
        {recommendations.length > 0 && (
          <section className="animate-in fade-in duration-1000 delay-500">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px flex-1 bg-white/5" />
              <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">For Your Ears</h2>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {recommendations.map((song) => (
                <SongCard key={`rec-${song.id}`} song={song} playlist={recommendations} />
              ))}
            </div>
          </section>
        )}

        {/* Trending Section */}
        <section>
          <div className="flex items-center gap-4 mb-12">
             <TrendingUp className="h-8 w-8 text-primary" />
             <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Global Pulse</h2>
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
            {loadingMore && <Loader2 className="h-10 w-10 animate-spin text-primary" />}
          </div>
        </section>

        {/* Boutique Teaser */}
        <section className="bg-gradient-to-br from-neutral-900 to-black p-12 rounded-[3rem] border border-white/5 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] -z-10 group-hover:scale-150 transition-transform duration-1000" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="space-y-6 max-w-md">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">The <span className="text-primary">Boutique</span></h2>
              <p className="text-neutral-400 font-medium leading-relaxed">
                Elevate your physical space. Hand-picked heritage garments and high-fidelity artifacts for the modern sound house.
              </p>
              <Button variant="outline" className="rounded-full px-8 h-12 border-white/20 hover:bg-white/5 font-bold uppercase tracking-widest text-xs" asChild>
                <a href="/boutique">Enter the Boutique</a>
              </Button>
            </div>
            <div className="relative w-64 h-80 rounded-2xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 border border-white/10">
              <Image 
                src="https://picsum.photos/seed/boutique-teaser/600/800" 
                alt="Boutique" 
                fill 
                className="object-cover"
                data-ai-hint="luxury garment"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
