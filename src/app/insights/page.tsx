'use client';

import React from 'react';
import { useMusic } from '@/components/music-player/player-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock, Music, Heart, History, TrendingUp, BarChart3, Zap } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function InsightsPage() {
  const { totalMinutes, playedHistory, likedSongs } = useMusic();

  return (
    <div className="p-8 pb-32 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-[0.2em] uppercase">
          <BarChart3 className="h-3 w-3" />
          Verified Resonance
        </div>
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white uppercase italic leading-none">Your Insights</h1>
        <p className="text-neutral-400 max-w-xl text-lg font-medium">A definitive breakdown of your sound resonance and listening lineage.</p>
      </header>

      {/* Grid for Big Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-neutral-900 border-white/5 shadow-2xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="h-20 w-20 text-primary" />
          </div>
          <CardHeader>
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Resonance Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-black italic text-white uppercase tracking-tighter">
              {totalMinutes} <span className="text-primary text-xl">MINS</span>
            </div>
            <p className="text-[10px] text-neutral-500 mt-2 font-bold uppercase tracking-widest">Total high-fidelity playback recorded</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-white/5 shadow-2xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Music className="h-20 w-20 text-white" />
          </div>
          <CardHeader>
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Track Lineage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-black italic text-white uppercase tracking-tighter">
              {playedHistory.length} <span className="text-primary text-xl">TOTAL</span>
            </div>
            <p className="text-[10px] text-neutral-500 mt-2 font-bold uppercase tracking-widest">Unique soundscapes encountered</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-white/5 shadow-2xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Heart className="h-20 w-20 text-primary" />
          </div>
          <CardHeader>
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Saved Frequencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-black italic text-white uppercase tracking-tighter">
              {likedSongs.length} <span className="text-primary text-xl">FAVS</span>
            </div>
            <p className="text-[10px] text-neutral-500 mt-2 font-bold uppercase tracking-widest">Songs marked as premium favorites</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Lineage / History Section */}
        <section className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-1 w-8 bg-primary" />
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Playback Lineage</h2>
            </div>
          </div>
          
          <ScrollArea className="h-[500px] rounded-3xl border border-white/5 bg-neutral-900/40 p-6 shadow-inner">
            <div className="space-y-3">
              {playedHistory.length > 0 ? (
                playedHistory.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="group flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-default">
                    <div className="flex items-center gap-5">
                      <span className="text-[10px] font-black text-neutral-700 group-hover:text-primary transition-colors">{String(idx + 1).padStart(2, '0')}</span>
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-base tracking-tight italic uppercase">{item.name}</span>
                        <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Resonance Verified</span>
                      </div>
                    </div>
                    <Zap className="h-4 w-4 text-primary opacity-0 group-hover:opacity-40 transition-opacity" />
                  </div>
                ))
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                  <History className="h-12 w-12 text-neutral-800" />
                  <p className="text-neutral-500 font-bold uppercase italic tracking-widest text-xs">No history recorded yet.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </section>

        {/* Side Metrics */}
        <div className="lg:col-span-4 space-y-6">
           <Card className="bg-neutral-900 border-white/5 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-black italic uppercase italic tracking-tighter flex items-center gap-2 text-primary">
                  <Activity className="h-5 w-5" />
                  Activity Density
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                       <span>Weekly Resonance</span>
                       <span>84%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full w-[84%] bg-primary shadow-[0_0_10px_rgba(255,0,0,0.3)]" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                       <span>Loyalty Quotient</span>
                       <span>92%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full w-[92%] bg-white shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
                    </div>
                 </div>
                 <p className="text-[10px] text-neutral-500 italic leading-relaxed pt-4 border-t border-white/5">
                   Your listening profile indicates a high affinity for high-fidelity frequencies. You resonance most during late-night sessions.
                 </p>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
