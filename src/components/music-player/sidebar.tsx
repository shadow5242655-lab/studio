
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Home, Search, Library, PlusSquare, Heart, Music2, Compass, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useMusic } from './player-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function SidebarContent({ onNavItemClick }: { onNavItemClick?: () => void }) {
  const pathname = usePathname();
  const { likedSongs, playlists, createPlaylist } = useMusic();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const navItems = [
    { name: 'Home', icon: Home, href: '/' },
    { name: 'Search', icon: Search, href: '/search' },
    { name: 'Library', icon: Library, href: '/library' },
    { name: 'Browse Genres', icon: Compass, href: '/genres' },
  ];

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName);
      setNewPlaylistName('');
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="p-5 mb-4">
        <Link href="/" className="flex items-center gap-2 group" onClick={onNavItemClick}>
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
            onClick={onNavItemClick}
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
        <button 
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:text-white hover:bg-white/5 transition-all group"
        >
          <div className="bg-neutral-800 text-white p-1 rounded-sm group-hover:bg-neutral-700">
            <PlusSquare className="h-4 w-4" />
          </div>
          Create Playlist
        </button>
        <Link 
          href="/liked"
          onClick={onNavItemClick}
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

      <div className="mt-4 px-4 overflow-y-auto custom-scrollbar flex-1">
        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-4 opacity-50">Playlists</p>
        <div className="space-y-1">
          {playlists.map(p => (
            <Link 
              key={p.id} 
              href={`/playlists?id=${p.id}`}
              onClick={onNavItemClick}
              className="block text-sm text-muted-foreground hover:text-white py-2 truncate transition-colors"
            >
              {p.name}
            </Link>
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-neutral-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input 
              placeholder="Playlist name" 
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="bg-neutral-800 border-white/10 focus:ring-primary"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button className="bg-primary text-white" onClick={handleCreatePlaylist}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function Sidebar() {
  return (
    <div className="hidden md:flex w-64 bg-black flex-col gap-2 p-2 h-full border-r border-white/5 shrink-0 z-40">
      <SidebarContent />
    </div>
  );
}

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  
  return (
    <header className="md:hidden flex items-center justify-between p-4 bg-black/80 backdrop-blur-lg border-b border-white/5 sticky top-0 z-[55]">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="bg-primary p-1 rounded-lg">
          <Music2 className="h-5 w-5 text-white" />
        </div>
        <span className="font-black text-lg tracking-tighter text-white uppercase italic">AYUMUSIC</span>
      </Link>
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-white">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0 bg-black border-r border-white/10">
          <SidebarContent onNavItemClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
}
