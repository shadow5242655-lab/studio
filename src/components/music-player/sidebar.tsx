
'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Search, Library, PlusSquare, Heart, Music2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useMusic } from './player-context';

export function Sidebar() {
  const pathname = usePathname();
  const { likedSongs } = useMusic();

  const navItems = [
    { name: 'Home', icon: Home, href: '/' },
    { name: 'Search', icon: Search, href: '/search' },
    { name: 'Library', icon: Library, href: '/library' },
  ];

  return (
    <div className="w-64 bg-black flex flex-col gap-2 p-2 h-full border-r border-white/5 shrink-0 z-40">
      <div className="p-5 mb-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-1.5 rounded-lg group-hover:scale-110 transition-transform">
            <Music2 className="h-6 w-6 text-white" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-white uppercase italic">AYUMUSIC</span>
        </Link>
      </div>

      <nav className="flex flex-col gap-1 px-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all group",
              pathname === item.href 
                ? "text-white bg-white/10" 
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon className={cn(
              "h-5 w-5 transition-colors",
              pathname === item.href ? "text-primary" : "text-muted-foreground group-hover:text-white"
            )} />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="mt-8 flex flex-col gap-1 px-2">
        <button className="flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:text-white hover:bg-white/5 transition-all group">
          <div className="bg-neutral-800 text-white p-1 rounded-sm group-hover:bg-neutral-700">
            <PlusSquare className="h-4 w-4" />
          </div>
          Create Playlist
        </button>
        <Link 
          href="/liked"
          className={cn(
            "flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all group",
            pathname === '/liked' ? "text-white bg-white/10" : "text-muted-foreground hover:text-white hover:bg-white/5"
          )}
        >
          <div className="bg-gradient-to-br from-primary to-red-400 text-white p-1 rounded-sm">
            <Heart className="h-4 w-4 fill-white" />
          </div>
          <span className="flex-1">Liked Songs</span>
          {likedSongs.length > 0 && (
            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">
              {likedSongs.length}
            </span>
          )}
        </Link>
      </div>

      <div className="mt-auto p-6 border-t border-white/5">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-50 hover:opacity-100 transition-opacity cursor-default">
          Legal • Privacy • AYUMUSIC © 2024
        </p>
      </div>
    </div>
  );
}
