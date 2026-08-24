'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Song, getTrending, searchSongs } from '@/lib/music-api';
import { SongCard } from '@/components/music-player/song-card';
import { TrendingUp, Music2, Heart, Disc, Activity, Zap, Wind, CloudRain, Coffee } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useMusic } from '@/components/music-player/player-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const MOOD_STATIONS = [
  { name: 'Fresh Radar', icon: Zap, query: 'Latest Hits', color: 'from-cyan-500' },
  { name: 'After Dark', icon: Wind, query: 'Techno Midnight', color: 'from-indigo-500' },
  { name: 'Good Night', icon: CloudRain, query: 'Sleep Relax', color: 'from-blue-600' },
  { name: 'Lofi Sanctuary', icon: Coffee, query: 'Lofi Hip Hop', color: 'from-amber-600' },
];

function MusicSection({ title, initialQuery, icon: Icon, songs: externalSongs }: { title: string; initialQuery?: string; icon: any; songs?: Song[] }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const smartRank = (list: Song[]) => {
    return [...list].sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const isACover = aName.includes('cover') || aName.includes('reprise');
      const isBCover = bName.includes('cover') || bName.includes('reprise');
      if (!isACover && isBCover) return -1;
      if (isACover && !isBCover) return 1;
      return 0;
    });
  };

  useEffect(() => {
    if (externalSongs) {
      setSongs(smartRank(externalSongs));
      setLoading(false);
      return;
    }
    const fetch = async () => {
      setLoading(true);
      const data = initialQuery ? await searchSongs(initialQuery) : await getTrending();
      setSongs(smartRank(data));
      setLoading(false);
    };
    fetch();
  }, [initialQuery, externalSongs]);

  if (!loading && songs.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Icon className="h-6 w-6 text-primary neon-glow" />
          </div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">{title}</h2>
        </div>
      </div>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-6 px-6 md:px-12 pb-6">
          {loading ? (
            Array(6).fill(0).map((_, i) => <div key={i} className="w-[180px] h-[260px] glass-card animate-pulse rounded-2xl" />)
          ) : (
            songs.map((song) => <div key={song.id} className="w-[200px]"><SongCard song={song} playlist={songs} /></div>)
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}

export default function Home() {
  const { userStats, playTrack } = useMusic();
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [moodSongs, setMoodSongs] = useState<Song[]>([]);

  useEffect(() => {
    if (activeMood) {
      const station = MOOD_STATIONS.find(s => s.name === activeMood);
      if (station) {
        searchSongs(station.query).then(setMoodSongs);
      }
    }
  }, [activeMood]);

  return (
    <div className="pb-40 space-y-16 pt-8 animate-in fade-in duration-1000">
      <header className="px-6 md:px-12 flex flex-col md:flex-row gap-8 items-start justify-between">
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-2 italic uppercase italic leading-none">
            The <span className="text-primary neon-glow">Resonance</span>
          </h1>
          <p className="text-neutral-400 font-medium text-lg uppercase tracking-widest">Premium High-Fidelity Discovery Engine.</p>
        </div>

        {/* Pulse Stats Card */}
        <div className="glass-card p-6 rounded-[2rem] w-full md:w-80 space-y-4 border-primary/20">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Listening Pulse</h3>
            <Activity className="h-4 w-4 text-primary animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-black italic uppercase">{Math.floor(userStats.minutesListened)}</p>
              <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Minutes</p>
            </div>
            <div>
              <p className="text-2xl font-black italic uppercase">{userStats.tracksPlayed}</p>
              <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Tracks</p>
            </div>
          </div>
        </div>
      </header>

      {/* Mood Stations */}
      <section className="px-6 md:px-12 space-y-6">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Mood Stations</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {MOOD_STATIONS.map((mood) => (
            <button
              key={mood.name}
              onPointerDown={() => setActiveMood(mood.name === activeMood ? null : mood.name)}
              className={cn(
                "h-24 rounded-3xl p-6 glass-card text-left transition-all lag-free-tap overflow-hidden relative group",
                activeMood === mood.name ? "ring-2 ring-primary bg-primary/10" : "hover:bg-white/5"
              )}
            >
              <div className={cn("absolute inset-0 opacity-10 bg-gradient-to-br", mood.color)} />
              <div className="relative z-10 flex flex-col justify-between h-full">
                <mood.icon className={cn("h-6 w-6 transition-colors", activeMood === mood.name ? "text-primary" : "text-white")} />
                <span className="font-black uppercase italic text-xs tracking-widest">{mood.name}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {activeMood && (
        <MusicSection title={`${activeMood} Selection`} songs={moodSongs} icon={Zap} />
      )}

      <MusicSection title="Trending Pulse" icon={TrendingUp} />
      <MusicSection title="Studio Originals" initialQuery="New Release" icon={Disc} />
      <MusicSection title="Acoustic Resonance" initialQuery="Unplugged" icon={Music2} />
      <MusicSection title="Neural Mix" initialQuery="Top Charts" icon={Zap} />
    </div>
  );
}
