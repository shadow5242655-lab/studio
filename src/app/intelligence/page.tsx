'use client';

import React, { useState, useEffect } from 'react';
import { useMusic } from '@/components/music-player/player-context';
import { generateVibePlaylist } from '@/ai/flows/vibe-playlist-flow';
import { generateEmotionJourney } from '@/ai/flows/emotion-journey-flow';
import { generateMusicPersona } from '@/ai/flows/music-persona-flow';
import { searchSongs } from '@/lib/music-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, History, Brain, Zap, ShieldAlert, Trash2, Plus, Loader2, Music2, Wind } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function IntelligencePage() {
  const { 
    playedHistory, removeFromHistory, clearHistory, 
    exclusionRules, addExclusionRule, removeExclusionRule,
    tasteProfile, setTasteProfile, createPlaylist, likedSongs
  } = useMusic();
  
  const { toast } = useToast();
  const [vibeInput, setVibeInput] = useState('');
  const [loadingVibe, setLoadingVibe] = useState(false);
  
  const [fromMood, setFromMood] = useState('');
  const [toMood, setToMood] = useState('');
  const [loadingJourney, setLoadingJourney] = useState(false);
  
  const [loadingPersona, setLoadingPersona] = useState(false);
  const [exclusionInput, setExclusionInput] = useState('');

  const handleMixVibe = async () => {
    if (!vibeInput) return;
    setLoadingVibe(true);
    try {
      const result = await generateVibePlaylist({ vibe: vibeInput });
      const foundSongs = await Promise.all(result.searchTerms.map(term => searchSongs(term)));
      const songs = foundSongs.map(res => res[0]).filter(Boolean);
      createPlaylist(result.playlistName, songs);
      toast({ title: 'AI Mix Ready', description: `Playlist "${result.playlistName}" added to your library.` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Intelligence Error', description: 'Could not mix the vibe.' });
    } finally {
      setLoadingVibe(false);
    }
  };

  const handleStartJourney = async () => {
    if (!fromMood || !toMood) return;
    setLoadingJourney(true);
    try {
      const result = await generateEmotionJourney({ fromMood, toMood });
      const allSearchTerms = result.stages.flatMap(s => s.searchTerms);
      const foundSongs = await Promise.all(allSearchTerms.map(term => searchSongs(term)));
      const songs = foundSongs.map(res => res[0]).filter(Boolean);
      createPlaylist(result.journeyName, songs);
      toast({ title: 'Journey Initiated', description: `"${result.journeyName}" transition playlist created.` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Journey Error', description: 'Could not map the journey.' });
    } finally {
      setLoadingJourney(false);
    }
  };

  const handleGeneratePersona = async () => {
    setLoadingPersona(true);
    try {
      // Use recent liked songs or history as seed
      const seed = likedSongs.map(s => s.name).slice(0, 10);
      const result = await generateMusicPersona({ history: seed });
      setTasteProfile(result);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Persona Error', description: 'Could not read your frequency.' });
    } finally {
      setLoadingPersona(false);
    }
  };

  return (
    <div className="p-8 pb-32 max-w-6xl mx-auto space-y-12">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-[0.2em] uppercase">
          <Brain className="h-3 w-3" />
          Neural Sound Engineering
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase italic leading-none">Intelligence</h1>
        <p className="text-neutral-400 max-w-2xl text-lg font-medium">Control your history, architect your taste, and let AI bridge your emotional spectrum.</p>
      </header>

      <Tabs defaultValue="taste" className="space-y-8">
        <TabsList className="bg-neutral-900 border border-white/5 p-1 rounded-xl h-auto flex flex-wrap gap-1">
          <TabsTrigger value="taste" className="rounded-lg py-3 px-6 gap-2 font-bold uppercase italic tracking-tighter data-[state=active]:bg-primary">
            <Brain className="h-4 w-4" /> Taste Profile
          </TabsTrigger>
          <TabsTrigger value="mixer" className="rounded-lg py-3 px-6 gap-2 font-bold uppercase italic tracking-tighter data-[state=active]:bg-primary">
            <Zap className="h-4 w-4" /> AI Mixer
          </TabsTrigger>
          <TabsTrigger value="journey" className="rounded-lg py-3 px-6 gap-2 font-bold uppercase italic tracking-tighter data-[state=active]:bg-primary">
            <Wind className="h-4 w-4" /> Emotion Journey
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg py-3 px-6 gap-2 font-bold uppercase italic tracking-tighter data-[state=active]:bg-primary">
            <History className="h-4 w-4" /> History Control
          </TabsTrigger>
          <TabsTrigger value="rules" className="rounded-lg py-3 px-6 gap-2 font-bold uppercase italic tracking-tighter data-[state=active]:bg-primary">
            <ShieldAlert className="h-4 w-4" /> Exclusions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="taste" className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-neutral-900 border-white/5 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-black italic uppercase italic tracking-tighter">Current Persona</CardTitle>
                <CardDescription>Your poetic listening identity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {tasteProfile ? (
                  <div className="space-y-6">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                      <h3 className="text-3xl font-black text-primary italic uppercase mb-2">{tasteProfile.personaTitle}</h3>
                      <p className="text-neutral-300 leading-relaxed italic">"{tasteProfile.description}"</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-[10px] font-black uppercase text-neutral-500 mb-1">Dominant Mood</p>
                        <p className="font-bold text-white">{tasteProfile.dominantMood}</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-[10px] font-black uppercase text-neutral-500 mb-1">Recommendation</p>
                        <p className="font-bold text-white">{tasteProfile.recommendationStyle}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <Music2 className="h-12 w-12 text-neutral-800 mx-auto" />
                    <p className="text-neutral-500 text-sm">No profile generated yet.</p>
                  </div>
                )}
                <Button className="w-full font-bold h-12 gap-2" onClick={handleGeneratePersona} disabled={loadingPersona}>
                  {loadingPersona ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {tasteProfile ? 'Recalibrate Persona' : 'Generate Profile'}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-white/5 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-black italic uppercase italic tracking-tighter">Taste Adjustments</CardTitle>
                <CardDescription>Refine how the AI understands you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-neutral-500">The AI builds your profile based on liked tracks and playtime. You can clear your history to reset this balance.</p>
                <div className="pt-4">
                  <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-4 py-2">Verified Architecture</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mixer" className="animate-in fade-in slide-in-from-bottom-4 max-w-2xl mx-auto text-center space-y-8">
           <div className="space-y-4">
             <h2 className="text-4xl font-black italic uppercase tracking-tighter">Vibe Mixer</h2>
             <p className="text-neutral-400">Describe a specific vibe, setting, or aesthetic. Our AI will blend a seamless playlist for it.</p>
           </div>
           <div className="relative group">
             <Input 
               placeholder="e.g., A rainy night drive in a 1980s futuristic Tokyo..."
               className="h-20 text-xl px-8 bg-neutral-900 border-white/10 rounded-2xl focus:ring-primary shadow-2xl"
               value={vibeInput}
               onChange={(e) => setVibeInput(e.target.value)}
             />
             <Button 
               size="lg" 
               className="mt-6 h-14 px-12 rounded-full font-black text-lg gap-3 shadow-primary/20 shadow-2xl" 
               onClick={handleMixVibe}
               disabled={loadingVibe || !vibeInput}
             >
               {loadingVibe ? <Loader2 className="h-6 w-6 animate-spin" /> : <Zap className="h-6 w-6" />}
               CREATE MIX
             </Button>
           </div>
        </TabsContent>

        <TabsContent value="journey" className="animate-in fade-in slide-in-from-bottom-4 max-w-2xl mx-auto space-y-12">
           <div className="text-center space-y-4">
             <h2 className="text-4xl font-black italic uppercase tracking-tighter">Emotion Journey</h2>
             <p className="text-neutral-400">Scientifically designed sound bridges to move you from where you are to where you want to be.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest px-2">Current State</label>
               <Input 
                 placeholder="e.g. Stressed, Angry" 
                 className="h-14 bg-neutral-900 border-white/10 rounded-xl"
                 value={fromMood}
                 onChange={(e) => setFromMood(e.target.value)}
               />
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest px-2">Target State</label>
               <Input 
                 placeholder="e.g. Focused, Serene" 
                 className="h-14 bg-neutral-900 border-white/10 rounded-xl"
                 value={toMood}
                 onChange={(e) => setToMood(e.target.value)}
               />
             </div>
           </div>

           <Button 
             className="w-full h-16 rounded-2xl font-black text-xl gap-3 shadow-2xl" 
             onClick={handleStartJourney}
             disabled={loadingJourney || !fromMood || !toMood}
           >
             {loadingJourney ? <Loader2 className="h-6 w-6 animate-spin" /> : <Wind className="h-6 w-6" />}
             INITIATE BRIDGE
           </Button>
        </TabsContent>

        <TabsContent value="history" className="animate-in fade-in slide-in-from-bottom-4 space-y-8">
           <div className="flex items-center justify-between">
             <div className="space-y-1">
               <h2 className="text-3xl font-black italic uppercase tracking-tighter">Playback History</h2>
               <p className="text-neutral-500">Edit your recent history to keep recommendations pure.</p>
             </div>
             <Button variant="destructive" className="font-bold gap-2" onClick={() => confirm('Clear all history?') && clearHistory()}>
               <Trash2 className="h-4 w-4" /> Clear All
             </Button>
           </div>

           {playedHistory.length > 0 ? (
             <div className="grid grid-cols-1 gap-2">
               {playedHistory.map((songId) => (
                 <div key={`hist-${songId}`} className="group flex items-center justify-between p-4 bg-neutral-900/50 rounded-xl border border-white/5 hover:bg-neutral-800 transition-all">
                    <div className="flex items-center gap-4">
                      <Music2 className="h-5 w-5 text-neutral-700" />
                      <span className="text-sm font-bold text-white truncate max-w-xs">{songId}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-primary transition-opacity"
                      onClick={() => removeFromHistory(songId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                 </div>
               ))}
             </div>
           ) : (
             <div className="py-20 text-center space-y-4 bg-neutral-900/20 rounded-2xl border border-dashed border-white/5">
               <History className="h-12 w-12 text-neutral-800 mx-auto" />
               <p className="text-neutral-500 font-bold uppercase italic tracking-widest text-xs">No history recorded yet.</p>
             </div>
           )}
        </TabsContent>

        <TabsContent value="rules" className="animate-in fade-in slide-in-from-bottom-4 max-w-3xl mx-auto space-y-8">
           <div className="space-y-4">
             <h2 className="text-4xl font-black italic uppercase tracking-tighter">Smart Exclusions</h2>
             <p className="text-neutral-400">Blacklist specific artists or genres to permanently exclude them from all AI-generated suggestions.</p>
           </div>

           <div className="flex gap-4">
             <Input 
               placeholder="Enter Artist, Song or Genre to exclude..." 
               className="h-14 bg-neutral-900 border-white/10 rounded-xl"
               value={exclusionInput}
               onChange={(e) => setExclusionInput(e.target.value)}
             />
             <Button className="h-14 px-8 rounded-xl font-bold" onClick={() => {
               if (exclusionInput) {
                 addExclusionRule('artist', exclusionInput);
                 setExclusionInput('');
               }
             }}>
               <Plus className="h-5 w-5 mr-2" /> Add Rule
             </Button>
           </div>

           <div className="space-y-3">
             {exclusionRules.map(rule => (
               <div key={rule.id} className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/10">
                 <div className="flex items-center gap-3">
                   <ShieldAlert className="h-4 w-4 text-primary" />
                   <span className="font-bold text-white uppercase italic tracking-tighter">{rule.value}</span>
                   <Badge variant="secondary" className="text-[8px] uppercase">{rule.type}</Badge>
                 </div>
                 <Button variant="ghost" size="icon" onClick={() => removeExclusionRule(rule.id)}>
                   <Trash2 className="h-4 w-4 text-neutral-500" />
                 </Button>
               </div>
             ))}
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
