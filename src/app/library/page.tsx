'use client';

import React, { useState } from 'react';
import { useMusic } from '@/components/music-player/player-context';
import { SongCard } from '@/components/music-player/song-card';
import { Heart, Music2, ListMusic, Sparkles, Loader2, Award } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { generateMusicPersona, MusicPersonaOutput } from '@/ai/flows/music-persona-flow';

export default function LibraryPage() {
  const { likedSongs, playlists, playedHistory } = useMusic();
  const [persona, setPersona] = useState<MusicPersonaOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePersona = async () => {
    if (playedHistory.length === 0) return;
    setIsGenerating(true);
    try {
      const result = await generateMusicPersona({ history: playedHistory });
      setPersona(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 pb-32 space-y-16 max-w-7xl mx-auto">
      <header className="space-y-6">
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white uppercase italic leading-none">Your <br/> <span className="text-primary">Sanctuary</span></h1>
        <p className="text-neutral-400 max-w-xl text-lg font-medium leading-relaxed">The curation of your personal sound identity. Every track a brick in your sonic legacy.</p>
      </header>

      {/* AI Persona Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-900 to-black rounded-[3rem] p-10 border border-white/5">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] -z-10" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-6 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-[0.2em] uppercase">
              <Sparkles className="h-3 w-3" />
              Sonic Analysis
            </div>
            {persona ? (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">{persona.personaTitle}</h2>
                <p className="text-neutral-400 italic text-lg leading-relaxed">"{persona.description}"</p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <div className="bg-white/5 border border-white/10 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                    Mood: <span className="text-primary">{persona.dominantMood}</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                    Discovery: <span className="text-primary">{persona.recommendationStyle}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Music Persona</h2>
                <p className="text-neutral-400">Discover the spiritual archetype of your listening history through our Studio AI.</p>
                <Button 
                  onClick={handleGeneratePersona} 
                  disabled={isGenerating || playedHistory.length === 0}
                  className="rounded-full px-10 h-12 font-black uppercase tracking-[0.2em] gap-3"
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
                  Identify Me
                </Button>
              </div>
            )}
          </div>
          <div className="relative h-48 w-48 bg-primary/5 rounded-full flex items-center justify-center border border-primary/10 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
             <Music2 className="h-24 w-24 text-primary/10" />
             <div className="absolute inset-0 border border-white/5 rounded-full animate-ping duration-[3s]" />
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-4">
            <Heart className="h-8 w-8 text-primary fill-primary" />
            Loved Frequencies
          </h2>
          <Link href="/liked" className="text-xs font-black uppercase tracking-[0.3em] text-primary hover:underline">
            Expand All
          </Link>
        </div>
        
        {likedSongs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {likedSongs.slice(0, 10).map((song) => (
              <SongCard key={song.id} song={song} playlist={likedSongs} />
            ))}
          </div>
        ) : (
          <div className="bg-neutral-900/30 border border-white/5 p-20 rounded-[2rem] text-center space-y-6">
            <Heart className="h-16 w-16 text-neutral-800 mx-auto" />
            <p className="text-neutral-500 font-black uppercase tracking-[0.2em]">Your frequency is currently silent.</p>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-4">
            <ListMusic className="h-8 w-8 text-white" />
            Sound Architectures
          </h2>
        </div>

        {playlists.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {playlists.map((playlist) => (
              <Link 
                key={playlist.id} 
                href={`/playlists?id=${playlist.id}`}
                className="group bg-neutral-900/20 p-6 rounded-[2rem] transition-all hover:bg-neutral-800/50 border border-white/5"
              >
                <div className="aspect-square mb-6 rounded-3xl bg-neutral-800 flex items-center justify-center overflow-hidden shadow-2xl relative group">
                  <Music2 className="h-20 w-20 text-neutral-700" />
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-black text-white truncate text-lg italic uppercase">{playlist.name}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">{playlist.songs.length} Tracks</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-neutral-900/30 border border-white/5 p-20 rounded-[2rem] text-center space-y-6">
            <Music2 className="h-16 w-16 text-neutral-800 mx-auto" />
            <p className="text-neutral-500 font-black uppercase tracking-[0.2em]">Build your first sonic structure.</p>
          </div>
        )}
      </section>
    </div>
  );
}
