'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Song, getTrending, searchSongs, sortSmartRank } from '@/lib/music-api';
import { SongCard } from '@/components/music-player/song-card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Flame, Heart, Zap, History, Moon, Coffee, Sparkles, Activity, User, X } from 'lucide-react';
import { useMusic } from '@/components/music-player/player-context';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function PulseStats() {
  const { userStats } = useMusic();
  return (
    <div className="mx-6 md:mx-12 p-6 rounded-3xl pulse-card sterniters-glass grid grid-cols-3 gap-8">
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase text-primary tracking-widest">Resonance Time</p>
        <p className="text-2xl font-black italic">{userStats.totalMinutes}m</p>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase text-accent tracking-widest">Tracks Synced</p>
        <p className="text-2xl font-black italic">{userStats.totalTracks}</p>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Active Lineage</p>
        <p className="text-2xl font-black italic">{userStats.activeDays.length}d</p>
      </div>
    </div>
  );
}

function MusicSection({ title, initialQuery, icon: Icon, tag }: { title: string; initialQuery?: string; icon: any; tag?: string }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { artistFilter } = useMusic();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const query = initialQuery || (tag ? `genre ${tag}` : 'trending');
      const data = initialQuery ? await searchSongs(query) : await getTrending();
      setSongs(data);
      setLoading(false);
    };
    fetch();
  }, [initialQuery, tag]);

  const filteredSongs = useMemo(() => {
    if (!artistFilter) return songs;
    return songs.filter(s => s.artists.primary.some(a => a.name === artistFilter));
  }, [songs, artistFilter]);

  if (filteredSongs.length === 0 && !loading) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-xl"><Icon className="h-6 w-6 text-primary" /></div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase italic">{title}</h2>
        </div>
      </div>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-6 px-6 md:px-12 pb-6">
          {loading ? (
            Array(8).fill(0).map((_, i) => <div key={i} className="w-[200px] h-[280px] bg-neutral-900/50 animate-pulse rounded-2xl" />)
          ) : (
            filteredSongs.map((song) => <div key={song.id} className="w-[200px]"><SongCard song={song} playlist={filteredSongs} /></div>)
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}

export default function Home() {
  const { artistFilter, setArtistFilter, likedSongs } = useMusic();

  const personalizedMix = useMemo(() => {
    if (likedSongs.length < 3) return null;
    return sortSmartRank(likedSongs).slice(0, 10);
  }, [likedSongs]);

  return (
    <div className="pb-40 space-y-16 pt-8">
      <header className="px-6 md:px-12 space-y-6">
         <div className="flex items-center justify-between">
           <div>
             <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">AYUMUSIC</h1>
             <p className="text-primary font-bold uppercase tracking-widest text-[10px] mt-2 flex items-center gap-2">
               <Activity className="h-3 w-3" /> Sterniters Evolution Engine
             </p>
           </div>
           {artistFilter && (
             <Button variant="outline" className="rounded-full gap-2 border-primary/20" onClick={() => setArtistFilter(null)}>
               <X className="h-4 w-4" /> Clear Filter: <span className="text-primary">{artistFilter}</span>
             </Button>
           )}
         </div>
         <PulseStats />
      </header>

      {/* Made for you */}
      {personalizedMix && (
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-6 md:px-12">
            <div className="bg-accent/20 p-2 rounded-xl"><Sparkles className="h-6 w-6 text-accent" /></div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase italic">Made from your listening</h2>
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-6 px-6 md:px-12 pb-6">
              {personalizedMix.map((song) => (
                <div key={`personal-${song.id}`} className="w-[200px]"><SongCard song={song} playlist={personalizedMix} /></div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>
      )}

      {/* Mood Stations */}
      <section className="px-6 md:px-12 grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { name: "Good night", icon: Moon, query: "Relaxing Hindi" },
          { name: "Fresh Radar", icon: Zap, query: "Latest Hits" },
          { name: "After Dark", icon: Flame, query: "Dark Trap" },
          { name: "Deep Signal", icon: Activity, query: "Techno" },
          { name: "Lofi Sanctuary", icon: Coffee, query: "Lofi Beats" }
        ].map((station) => (
          <button 
            key={station.name}
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl sterniters-glass hover:bg-white/5 transition-all group"
          >
            <station.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">{station.name}</span>
          </button>
        ))}
      </section>

      <MusicSection title="Trending Lineage" icon={TrendingUp} />
      <MusicSection title="After Dark Echoes" initialQuery="Late Night Vibes" icon={Moon} />
      <MusicSection title="Pure Originals" initialQuery="Studio Originals" icon={Zap} />
      <MusicSection title="Heart Frequency" initialQuery="Romantic Acoustic" icon={Heart} />
    </div>
  );
}
