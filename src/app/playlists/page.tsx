'use client';

import React, { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMusic } from '@/components/music-player/player-context';
import { SongCard } from '@/components/music-player/song-card';
import { Music2, Play, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

function PlaylistDetailsContent() {
  const searchParams = useSearchParams();
  const playlistId = searchParams.get('id');
  const { playlists, deletePlaylist, playTrack } = useMusic();

  const playlist = useMemo(() => 
    playlists.find(p => p.id === playlistId), 
  [playlists, playlistId]);

  if (!playlistId) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500">
        Select a playlist to view details.
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-neutral-500">Loading playlist...</p>
      </div>
    );
  }

  return (
    <div className="pb-32 min-h-full">
      <header className="p-8 md:p-12 flex flex-col md:flex-row items-end gap-8 bg-gradient-to-b from-neutral-800 to-transparent">
        <div className="w-48 h-48 md:w-64 md:h-64 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] bg-neutral-700 flex items-center justify-center rounded-2xl relative group overflow-hidden">
          <Music2 className="h-24 w-24 md:h-32 md:w-32 text-neutral-500" />
          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="space-y-4 flex-1">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Playlist</span>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white uppercase italic">{playlist.name}</h1>
          <div className="flex items-center gap-3 text-sm font-bold text-neutral-300">
            <span>AYUMUSIC User</span>
            <div className="h-1 w-1 bg-neutral-600 rounded-full" />
            <span>{playlist.songs.length} songs</span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              size="lg" 
              className="rounded-full px-10 h-14 text-lg font-bold shadow-2xl hover:scale-105 transition-transform"
              onClick={() => playlist.songs.length > 0 && playTrack(playlist.songs[0], playlist.songs)}
              disabled={playlist.songs.length === 0}
            >
              <Play className="mr-2 h-6 w-6 fill-current" />
              Play
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-14 w-14 rounded-full text-neutral-400 hover:text-primary hover:bg-primary/10"
              onClick={() => {
                if (confirm('Are you sure you want to delete this playlist?')) {
                  deletePlaylist(playlist.id);
                  window.location.href = '/library';
                }
              }}
            >
              <Trash2 className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-8">
        {playlist.songs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {playlist.songs.map((song) => (
              <SongCard key={song.id} song={song} playlist={playlist.songs} />
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
            <Music2 className="h-20 w-20 text-neutral-900" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">This playlist is empty</h2>
              <p className="text-neutral-500">Search for songs and add them to this playlist.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlaylistDetailsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full text-neutral-500">Loading soundscape...</div>}>
      <PlaylistDetailsContent />
    </Suspense>
  );
}