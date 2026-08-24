
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Song, getTrending, searchSongs } from '@/lib/music-api';
import { SongCard } from '@/components/music-player/song-card';
import { Button } from '@/components/ui/button';
import { Play, Info, TrendingUp, ChevronRight, Loader2, Music2, Heart, Zap, Disc, Mic2, Flame } from 'lucide-react';
import { useMusic } from '@/components/music-player/player-context';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

function MusicSection({ title, initialQuery, icon: Icon }: { title: string; initialQuery?: string; icon: any }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSongs = useCallback(async () => {
    try {
      // Fetch a larger batch (30 songs) to provide a deep scroll experience as requested
      const data = initialQuery 
        ? await searchSongs(initialQuery, 1)
        : await getTrending(1);
      
      // Attempt to get a bit more data for better scrolling
      const data2 = initialQuery 
        ? await searchSongs(initialQuery, 2)
        : await getTrending(2);
      
      const combined = [...data, ...data2];
      const uniqueData = Array.from(new Map(combined.map(item => [item.id, item])).values());
      return uniqueData;
    } catch (error) {
      return [];
    }
  }, [initialQuery]);

  useEffect(() => {
    async function init() {
      const data = await fetchSongs();
      setSongs(data);
      setLoading(false);
    }
    init();
  }, [fetchSongs]);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-xl">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase italic leading-none">{title}</h2>
        </div>
      </div>

      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-6 px-6 md:px-12 pb-6">
          {loading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={`skeleton-${title}-${i}`} className="w-[200px] h-[280px] bg-neutral-900 animate-pulse rounded-2xl" />
            ))
          ) : (
            <>
              {songs.map((song) => (
                <div key={`${title}-${song.id}`} className="w-[200px]">
                  <SongCard song={song} playlist={songs} />
                </div>
              ))}
            </>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}

export default function Home() {
  const { totalListeningTime } = useMusic();
  const heroImage = PlaceHolderImages.find(img => img.id === 'music-hero');

  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="pb-32">
      {/* Immersive Hero Section */}
      <div className="relative min-h-[500px] md:h-[70vh] w-full overflow-hidden bg-black flex items-end">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent z-10" />
        
        <img 
          src={heroImage?.imageUrl || "https://picsum.photos/seed/music-festival-pro/1600/900"} 
          alt="Music Experience" 
          className="absolute inset-0 w-full h-full object-cover opacity-80 scale-105"
          data-ai-hint={heroImage?.imageHint || "music festival"}
        />
        
        <div className="relative flex flex-col justify-end p-6 md:p-12 z-20 space-y-4 md:space-y-6 max-w-4xl w-full">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1 w-12 bg-primary rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/70">Verified Experience</span>
          </div>
          
          <h1 className="text-5xl md:text-9xl font-black tracking-tighter text-white uppercase italic leading-[0.85]">
            AYUMUSIC
          </h1>
          
          <p className="text-neutral-300 text-base md:text-2xl max-w-xl font-medium leading-tight">
            Dive into high-fidelity sound. Your sanctuary for pure acoustic resonance.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4 pb-4">
            <Button 
              size="lg" 
              className="rounded-full px-8 md:px-16 font-black gap-3 h-14 md:h-16 text-lg md:text-xl hover:scale-105 transition-transform bg-primary text-white shadow-[0_0_30px_rgba(255,0,0,0.3)]" 
            >
              <Play className="h-6 w-6 md:h-7 md:w-7 fill-current" />
              EXPLORE
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="rounded-full px-8 font-bold border-white/20 text-white hover:bg-white/10 gap-3 h-14 md:h-16 backdrop-blur-sm">
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
                    <Music2 className="h-8 w-8 text-primary" />
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

      <div className="py-16 md:py-24 space-y-16 md:space-y-24">
        {/* All Major Sections */}
        <MusicSection title="Trending Hits" icon={TrendingUp} />
        <MusicSection title="Punjabi Beats" initialQuery="Punjabi" icon={Zap} />
        <MusicSection title="Bhojpuri Soul" initialQuery="Bhojpuri" icon={Flame} />
        <MusicSection title="Romantic Frequencies" initialQuery="Romantic" icon={Heart} />
        <MusicSection title="Hip Hop Voltage" initialQuery="Hip Hop" icon={Mic2} />
        <MusicSection title="EDM Spectrum" initialQuery="EDM" icon={Disc} />
        <MusicSection title="Sad Melodies" initialQuery="Sad" icon={Zap} />
        <MusicSection title="Lofi Sanctuary" initialQuery="Lofi" icon={Music2} />
      </div>
    </div>
  );
}
