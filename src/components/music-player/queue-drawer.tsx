'use client';

import React, { useRef, useEffect } from 'react';
import { X, Music2, Play, Pause, GripVertical, Trash2 } from 'lucide-react';
import { useMusic, useMusicProgress } from './player-context';
import { getBestImage, decodeEntities, formatDuration } from '@/lib/music-api';
import { cn } from '@/lib/utils';

/**
 * QUEUE DRAWER
 *
 * A slide-up panel that shows the current play queue.
 * - Shows current playing song at top
 * - Lists upcoming songs
 * - Click a song to play it
 * - Remove button to remove from queue
 * - Empty state when queue is empty
 */

export function QueueDrawer() {
  const {
    isQueueOpen, setIsQueueOpen, queue, currentTrack, isPlaying,
    playTrack, removeSongFromQueue, togglePlay
  } = useMusic();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Find current song index in queue
  const currentIdx = queue.findIndex(s => s.id === currentTrack?.id);
  const upcomingSongs = currentIdx !== -1 ? queue.slice(currentIdx + 1) : queue;

  if (!isQueueOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        onPointerDown={() => setIsQueueOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full h-[85vh] bg-neutral-900/90 border-t border-white/10 rounded-t-[2.5rem] flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden backdrop-blur-2xl shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        {/* Handle */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/20 rounded-full" />

        {/* Header */}
        <header className="flex items-center justify-between px-8 pt-8 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-xl">
              <Music2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-black italic uppercase tracking-tighter text-white">Queue</h2>
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                {queue.length} songs
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsQueueOpen(false)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Queue List */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-40 space-y-2">
          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <Music2 className="h-16 w-16 text-neutral-800 mb-4" />
              <p className="text-neutral-500 text-sm font-black italic uppercase tracking-tighter">
                Queue is empty
              </p>
              <p className="text-neutral-600 text-[10px] font-bold uppercase tracking-widest mt-1">
                Play a song to add it here
              </p>
            </div>
          ) : (
            <>
              {/* Now Playing */}
              {currentTrack && currentIdx !== -1 && (
                <div className="mb-4">
                  <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-3 px-2">
                    Now Playing
                  </p>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary/10 border border-primary/20">
                    <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-neutral-900 shrink-0">
                      <img src={getBestImage(currentTrack) || ''} alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        {isPlaying ? (
                          <div className="flex gap-0.5 items-end h-3">
                            <div className="w-0.5 bg-primary animate-[bounce_0.6s_infinite_0s]" style={{ height: '60%' }} />
                            <div className="w-0.5 bg-primary animate-[bounce_0.6s_infinite_0.2s]" style={{ height: '100%' }} />
                            <div className="w-0.5 bg-primary animate-[bounce_0.6s_infinite_0.4s]" style={{ height: '40%' }} />
                          </div>
                        ) : (
                          <Pause className="h-4 w-4 text-white fill-current" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-primary truncate italic uppercase tracking-tight">
                        {decodeEntities(currentTrack.name)}
                      </p>
                      <p className="text-[10px] text-neutral-500 truncate uppercase font-black tracking-widest">
                        {currentTrack.artists.primary[0]?.name}
                      </p>
                    </div>
                    <button
                      onClick={togglePlay}
                      className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                    >
                      {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Upcoming */}
              {upcomingSongs.length > 0 && (
                <div>
                  <p className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3 px-2">
                    Next in Queue
                  </p>
                  {upcomingSongs.map((song, idx) => {
                    const isCurrentSong = song.id === currentTrack?.id;
                    return (
                      <div
                        key={`queue-${song.id}-${idx}`}
                        onClick={() => playTrack(song, queue)}
                        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors group"
                      >
                        <GripVertical className="h-4 w-4 text-neutral-700 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-neutral-900 shrink-0">
                          <img src={getBestImage(song) || ''} alt="" className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Play className="h-3 w-3 text-white fill-current" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "font-bold text-xs truncate italic uppercase tracking-tight",
                            isCurrentSong ? "text-primary" : "text-white"
                          )}>
                            {decodeEntities(song.name)}
                          </p>
                          <p className="text-[9px] text-neutral-500 truncate uppercase font-black tracking-widest">
                            {song.artists.primary[0]?.name}
                          </p>
                        </div>
                        <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest shrink-0">
                          {formatDuration(song.duration)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSongFromQueue(song.id);
                          }}
                          className="p-1.5 text-neutral-700 hover:text-red-500 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {upcomingSongs.length === 0 && currentTrack && (
                <div className="py-12 text-center">
                  <p className="text-neutral-600 text-xs font-bold uppercase tracking-widest">
                    No more songs in queue
                  </p>
                  <p className="text-neutral-700 text-[10px] font-bold uppercase tracking-widest mt-1">
                    Auto-play will add more songs
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
