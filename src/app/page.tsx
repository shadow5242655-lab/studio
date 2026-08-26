'use client';

import React, { useEffect, useState, useRef, memo } from 'react';
import { Song, searchSongs, getBestImage, decodeEntities, getTrending } from '@/lib/music-api';
import { 
  Heart, Play, Music2, Search, Loader2, Sparkles, Shuffle, X, Menu, Smartphone, ListFilter, Coffee, HeartIcon, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMusic } from '@/components/music-player/player-context';
import { cn } from '@/lib/utils';

const VibeButton = ({ icon: Icon, label, query, onClick }: { icon: any, label: string, query: string, onClick: (q: string) => void }) => (
  <button 
    onClick={() => onClick(query)}
    className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] rounded-xl border border-white/5 whitespace-nowrap hover:bg-white/10 transition-all active:scale-95"
  >
    <Icon className="h-4 w-4 text-neutral-400" />
    <span className="text-xs font-bold text-white uppercase tracking-tight">{label}</span>
  </button>
);

export default function Home() {
  const { playTrack, toggleLike, isLiked, currentTrack } = useMusic();
  const [displaySongs, setDisplaySongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const results = await getTrending();
      setDisplaySongs(results.slice(0, 15));
    } catch (e) {
      console.error("AYUMUSIC: Load failed", e);
    } finally {
      setLoading(false);
    }
  };

  const handleVibeClick = async (vibe: string) => {
    setLoading(true);
    setIsSearching(true);
    try {
      const results = await searchSongs(vibe);
      setDisplaySongs(results);
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!searchQuery.trim()) {
      if (isSearching) loadInitialData();
      return;
    }
    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      setIsSearching(true);
      const results = await searchSongs(searchQuery);
      setDisplaySongs(results);
      setLoading(false);
    }, 500);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery]);

  if (loading && !isSearching) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white font-sans animate-in fade-in duration-500">
      
      {/* Top Header Branding */}
      <header className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1 rounded-full shadow-[0_0_10px_rgba(255,0,0,0.5)]">
            <Music2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black italic tracking-tighter uppercase">AYUMUSIC</span>
        </div>
        <button className="p-2 text-neutral-400">
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Discovery Hub */}
      <div className="px-6 space-y-8">
        
        {/* Search Node */}
        <div className="flex items-center gap-3">
           <Music2 className="h-6 w-6 text-primary" />
           <div className="flex-1 relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600" />
             <Input 
               placeholder="Search for sounds..." 
               className="pl-11 pr-4 bg-[#1a1a1a] border-none rounded-2xl h-12 focus-visible:ring-primary/40 text-sm"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
           <div className="flex items-center gap-4 text-neutral-400">
              <Smartphone className="h-5 w-5" />
              <ListFilter className="h-5 w-5" />
           </div>
        </div>

        {!isSearching && (
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1a1a1a] to-black p-8 border border-white/5 shadow-2xl space-y-6">
            <div className="absolute top-0 right-0 p-8 text-white/5 -rotate-12 pointer-events-none">
              <Music2 className="h-48 w-48" />
            </div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-primary uppercase tracking-[0.2em]">
               NO ADS • NO SIGN-UP
            </div>
            
            <div className="space-y-3">
              <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-[0.85]">AYUMUSIC</h1>
              <p className="text-sm font-medium text-neutral-400 leading-relaxed max-w-[240px]">
                High-fidelity sound resonance straight from the source. Millions of tracks in <span className="text-primary font-bold">320 kbps</span>.
              </p>
            </div>

            <div className="flex gap-4 pt-2">
              <Button 
                onClick={() => playTrack(displaySongs[0], displaySongs)}
                className="rounded-full bg-primary text-white font-black uppercase italic tracking-tight gap-3 h-12 px-8 shadow-2xl shadow-primary/20"
              >
                <Play className="h-4 w-4 fill-current" /> Play Trending
              </Button>
              <Button 
                variant="secondary"
                className="rounded-full bg-[#1a1a1a] border border-white/5 text-white font-black uppercase italic tracking-tight gap-3 h-12 px-8"
              >
                <Shuffle className="h-4 w-4" /> Shuffle
              </Button>
            </div>
          </div>
        )}

        {/* Pick A Vibe Section */}
        <section className="space-y-5">
           <h2 className="text-xl font-black italic uppercase tracking-tighter">Pick A Vibe</h2>
           <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-6 px-6">
             <VibeButton icon={HeartIcon} label="Romance" query="Romantic Hits" onClick={handleVibeClick} />
             <VibeButton icon={Sparkles} label="Party" query="Party Dance Hits" onClick={handleVibeClick} />
             <VibeButton icon={Coffee} label="Lo-fi" query="Lo-fi Hip Hop Relax" onClick={handleVibeClick} />
             <VibeButton icon={Zap} label="Workout" query="Gym Workout Motivation" onClick={handleVibeClick} />
           </div>
        </section>

        {/* Daily Picks Section */}
        <section className="space-y-6 pb-20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black italic uppercase tracking-tighter">Daily Picks</h2>
            <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest gap-2 bg-white/5 rounded-full px-4 h-8" onClick={() => playTrack(displaySongs[0], displaySongs)}>
              <Play className="h-3 w-3 fill-current" /> Play all
            </Button>
          </div>
          
          <div className="space-y-3">
            {displaySongs.map((song) => (
              <div 
                key={song.id}
                onClick={() => playTrack(song, displaySongs)}
                className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-[1.5rem] border border-white/5 transition-all active:bg-white/5 group cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-14 w-14 rounded-xl overflow-hidden bg-neutral-900 shrink-0 relative border border-white/5">
                    <img src={getBestImage(song) || ''} className="h-full w-full object-cover" alt="" />
                    {currentTrack?.id === song.id && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(255,0,0,0.8)]" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={cn(
                      "font-bold text-sm leading-tight italic uppercase tracking-tight truncate", 
                      currentTrack?.id === song.id ? "text-primary" : "text-white"
                    )}>
                      {decodeEntities(song.name)}
                    </p>
                    <p className="text-[10px] text-neutral-500 truncate uppercase mt-1 font-black tracking-widest">
                      {song.artists.primary[0]?.name}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
                  className="p-2 text-neutral-700 hover:text-primary transition-colors"
                >
                  <Heart className={cn("h-5 w-5", isLiked(song.id) && "fill-primary text-primary")} />
                </button>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
