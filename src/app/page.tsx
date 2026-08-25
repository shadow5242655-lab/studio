'use client';

import React, { useEffect, useState, useRef, memo, useMemo, useCallback } from 'react';
import { Song, getTrending, searchSongs, applySmartRank3, analyzeMood, mapMoodToGenre, decodeEntities } from '@/lib/music-api';
import { SongCard } from '@/components/music-player/song-card';
import { Star, Zap, Play, BarChart3, Wind, Flame, Radio, Sparkles, Brain, Loader2 } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useMusic } from '@/components/music-player/player-context';
import { useToast } from '@/hooks/use-toast';

const MusicSection = memo(function MusicSection({ title, initialQuery, icon: Icon, songs: externalSongs }: { title: string; initialQuery?: string; icon: any; songs?: Song[] }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const { songPopularity } = useMusic();
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchSongs = useCallback(async (p: number) => {
    if (externalSongs && p === 1) {
      setSongs(externalSongs);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      let data: Song[] = [];
      if (!initialQuery && !externalSongs) {
        data = await getTrending(p);
      } else if (initialQuery) {
        data = await searchSongs(initialQuery, p);
      }
      setSongs(prev => {
        const next = p === 1 ? data : [...prev, ...data];
        // Deduplicate
        return Array.from(new Map(next.map(item => [item.id, item])).values());
      });
    } catch (e) {
      console.error("Discovery error", e);
    } finally {
      setLoading(false);
    }
  }, [initialQuery, externalSongs]);

  useEffect(() => {
    fetchSongs(page);
  }, [page, fetchSongs]);

  // Infinite horizontal discovery intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !externalSongs) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1, rootMargin: '400px' }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [loading, externalSongs]);

  const rankedSongs = useMemo(() => applySmartRank3(songs, songPopularity), [songs, songPopularity]);

  if (!loading && songs.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">{title}</h2>
        </div>
      </div>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-6 px-6 md:px-12 pb-6">
          {rankedSongs.map((song) => (
            <div key={song.id} className="w-[200px]">
              <SongCard song={song} playlist={rankedSongs} />
            </div>
          ))}
          {loading && Array(4).fill(0).map((_, i) => (
            <div key={`skeleton-${i}`} className="w-[180px] h-[260px] bg-neutral-900 animate-pulse rounded-2xl" />
          ))}
          <div ref={observerTarget} className="w-20 shrink-0" />
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
});

export default function Home() {
  const { playRandomTrack } = useMusic();
  const { toast } = useToast();
  const [moodText, setMoodText] = useState('');
  const [moodSongs, setMoodSongs] = useState<Song[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);

  const handleMoodDetection = async () => {
    if (!moodText.trim()) return;
    setIsDetecting(true);
    try {
      const emotion = await analyzeMood(moodText);
      const genre = mapMoodToGenre(emotion);
      const results = await searchSongs(genre);
      setMoodSongs(results.slice(0, 15));
      toast({ title: "Mood Synced", description: `Detected "${emotion.toUpperCase()}". Curating ${genre} frequencies.` });
    } catch (e) {
      const fallbackGenre = mapMoodToGenre("neutral");
      const results = await searchSongs(fallbackGenre);
      setMoodSongs(results.slice(0, 15));
      toast({ variant: "destructive", title: "API Resonance Failure", description: "Defaulting to fallback frequencies." });
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="pb-40 space-y-20 pt-8 animate-in fade-in duration-1000">
      <header className="px-6 md:px-12 py-12 relative overflow-hidden min-h-[60vh] flex flex-col justify-center">
        <div className="absolute inset-0 z-0 opacity-40">
           <img 
            src="https://picsum.photos/seed/music-resonance-pro/1600/900" 
            alt="Hero Background" 
            className="w-full h-full object-cover brightness-[0.3]"
            data-ai-hint="music background"
           />
           <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        </div>
        
        <div className="relative z-10 space-y-8 max-w-4xl pt-20">
          <div className="flex items-center gap-3">
            <div className="h-1 w-12 bg-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Verified Frequency</span>
          </div>
          
          <h1 className="text-6xl md:text-[8rem] font-black tracking-tighter italic uppercase leading-none text-white">
            AYUMUSIC
          </h1>
          
          {/* Neural Mood Input Cluster */}
          <div className="max-w-xl bg-[#121212] p-6 rounded-[2rem] border border-white/5 shadow-2xl space-y-4 animate-in slide-in-from-left duration-700">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#1DB954]">
              <Brain className="h-3 w-3" />
              How are you feeling right now?
            </div>
            <div className="flex gap-2">
              <Input 
                placeholder="e.g., I'm feeling very energetic and happy today..."
                value={moodText}
                onChange={(e) => setMoodText(e.target.value)}
                className="bg-black/40 border-white/10 rounded-xl h-12 focus-visible:ring-[#1DB954]"
              />
              <Button 
                onClick={handleMoodDetection}
                disabled={isDetecting}
                className="bg-[#1DB954] text-black font-black uppercase tracking-tighter rounded-xl px-6 h-12 hover:bg-[#1DB954]/90 lag-free-tap"
              >
                {isDetecting ? <Loader2 className="h-5 w-5 animate-spin" /> : "DETECT"}
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <Button 
              size="lg" 
              onClick={playRandomTrack}
              className="h-16 px-12 rounded-full font-black text-lg gap-3 bg-primary text-white hover:scale-105 transition-transform lag-free-tap shadow-2xl"
            >
              <Play className="h-6 w-6 fill-current" />
              EXPLORE
            </Button>
            <Link href="/insights">
              <Button size="lg" variant="outline" className="h-16 px-10 rounded-full font-black text-lg gap-3 border-white/20 text-white hover:bg-white/5 lag-free-tap">
                <BarChart3 className="h-5 w-5" />
                INSIGHTS
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="space-y-24">
        {moodSongs.length > 0 && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <MusicSection title="Mood Matches for You" songs={moodSongs} icon={Brain} />
          </div>
        )}
        <MusicSection title="Trending Pulse" initialQuery="Atif Aslam Hits Tera Hone Laga Hoon" icon={Star} />
        <MusicSection title="PUNJABI BEATS" initialQuery="New Punjabi Hits 2024" icon={Zap} />
        <MusicSection title="LOFI SANCTUARY" initialQuery="Lofi Hip Hop Chill" icon={Wind} />
        <MusicSection title="BHOJPURI RHYTHMS" initialQuery="Bhojpuri Super Hits" icon={Flame} />
        <MusicSection title="HARYANVI SWAG" initialQuery="Haryanvi Pop" icon={Radio} />
      </div>
    </div>
  );
}
