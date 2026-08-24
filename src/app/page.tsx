
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
      // Deduplicate
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
      {/* Immersive Hero Section */}
      <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent z-10" />
        
        <img 
          src={heroImage?.imageUrl || "https://picsum.photos/seed/music-festival-pro/1600/900"} 
          alt="Music Experience" 
          className="w-full h-full object-cover opacity-80 scale-105"
          data-ai-hint={heroImage?.imageHint || "music festival"}
        />
        
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 z-20 space-y-6 max-w-4xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1 w-12 bg-primary rounded-full" />
            <span className="text-xs font-black uppercase tracking-[0.4em] text-white/70">Verified Experience</span>
          </div>
          
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white uppercase italic leading-[0.85]">
            AYUMUSIC
          </h1>
          
          <p className="text-neutral-300 text-lg md:text-2xl max-w-xl font-medium leading-tight">
            Dive into high-fidelity sound. Your sanctuary for pure acoustic resonance.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <Button 
              size="lg" 
              className="rounded-full px-10 md:px-16 font-black gap-3 h-16 text-xl hover:scale-105 transition-transform bg-primary text-white shadow-[0_0_30px_rgba(255,0,0,0.3)]" 
              onClick={() => trending.length > 0 && playTrack(trending[0], trending)}
            >
              <Play className="h-7 w-7 fill-current" />
              PLAY NOW
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="rounded-full px-10 font-bold border-white/20 text-white hover:bg-white/10 gap-3 h-16 backdrop-blur-sm">
                  <Info className="h-5 w-5" />
                  INSIGHTS
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-neutral-950 border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Listening Architecture</DialogTitle>
                </DialogHeader>
                <div className="py-8 space-y-6">
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-center gap-4">
                    <Clock className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-xs font-bold uppercase text-neutral-500">Total Playtime</p>
                      <p className="text-2xl font-black text-white italic">{formatTotalTime(totalListeningTime)}</p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-12 space-y-24">
        {/* Personalized Recommendations */}
        {recommendations.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Made For You</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {recommendations.map((song) => (
                <SongCard key={`rec-${song.id}`} song={song} playlist={recommendations} />
              ))}
            </div>
          </section>
        )}

        {/* Trending Hits */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-4">
             <TrendingUp className="h-8 w-8 text-primary" />
             <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Trending Now</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {loading ? (
              Array(10).fill(0).map((_, i) => (
                <div key={`skeleton-${i}`} className="space-y-4">
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
            {loadingMore && <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />}
          </div>
        </section>
      </div>
    </div>
  );
}
