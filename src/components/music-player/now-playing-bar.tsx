'use client';

import React from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, 
  Music2, Heart, X, Download, Music
} from 'lucide-react';
import { useMusic, useMusicProgress } from './player-context';
import { Slider } from '@/components/ui/slider';
import { getBestImage, decodeEntities, formatDuration, getBestDownload } from '@/lib/music-api';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function NowPlayingBar() {
  const { 
    currentTrack, isPlaying, togglePlay, nextTrack, prevTrack,
    stopTrack, toggleLike, isLiked, setIsPlayerOpen
  } = useMusic();
  const { progress, duration, seek, setIsScrubbing } = useMusicProgress();

  if (!currentTrack) return null;

  const imageSrc = getBestImage(currentTrack);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getBestDownload(currentTrack);
    if (url) window.open(url, '_blank');
  };

  return (
    <div className="bg-black border-t border-white/5 px-4 pt-3 pb-2 animate-in slide-in-from-bottom duration-500 relative">
      <div className="max-w-7xl mx-auto flex flex-col gap-2">
        
        {/* Metadata and Controls Container */}
        <div className="flex items-center justify-between h-14">
          
          {/* Left: Metadata & Heart */}
          <div 
            className="flex items-center gap-3 min-w-0 flex-1 pr-4 cursor-pointer"
            onClick={() => setIsPlayerOpen(true)}
          >
            <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-[#1a1a1a] shrink-0 border border-white/5">
              {imageSrc ? (
                <Image src={imageSrc} alt="" fill className="object-cover" sizes="48px" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Music2 className="h-6 w-6 text-neutral-700" />
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-black text-white truncate italic uppercase tracking-tighter leading-none">
                {decodeEntities(currentTrack.name)}
              </span>
              <span className="text-[9px] text-neutral-500 truncate uppercase font-black tracking-widest mt-1">
                {currentTrack.artists.primary[0]?.name}
              </span>
            </div>
            <button className="p-1 text-neutral-600 ml-1" onClick={(e) => { e.stopPropagation(); toggleLike(currentTrack); }}>
               <Heart className={cn("h-4 w-4", isLiked(currentTrack.id) && "fill-primary text-primary")} />
            </button>
          </div>

          {/* Right: Playback Controls */}
          <div className="flex items-center gap-5 shrink-0">
             <button className="text-neutral-500" onClick={prevTrack}><SkipBack className="h-5 w-5 fill-current" /></button>
             <button 
               onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
               className="bg-white text-black rounded-full h-11 w-11 flex items-center justify-center shadow-lg active:scale-90 transition-transform"
             >
               {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
             </button>
             <button className="text-neutral-500" onClick={nextTrack}><SkipForward className="h-5 w-5 fill-current" /></button>
             
             <button className="text-neutral-700 p-1" onClick={handleDownload}><Download className="h-4 w-4" /></button>
             <button className="text-primary p-1" onClick={stopTrack}><Music className="h-4 w-4" /></button>
          </div>
        </div>

        {/* Bottom Row: Red Seek Line */}
        <div className="w-full flex items-center gap-3 h-1 opacity-60 hover:opacity-100 transition-opacity">
           <div className="flex-1 relative">
             <Slider
                value={[progress]}
                max={duration || 100}
                step={0.1}
                onValueChange={(vals) => {
                  setIsScrubbing(true);
                  seek(vals[0]);
                }}
                onValueCommit={() => setIsScrubbing(false)}
                className="h-1"
              />
           </div>
        </div>
      </div>
    </div>
  );
}
