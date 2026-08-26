'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, History, Library } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * @fileOverview High-fidelity navigation bar restored and matched to user screenshot.
 */

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'HOME', icon: Home, href: '/' },
    { name: 'EXPLORE', icon: Search, href: '/genres' },
    { name: 'ECHOES', icon: History, href: '/insights' },
    { name: 'LIBRARY', icon: Library, href: '/library' },
  ];

  return (
    <nav className="h-20 bg-black border-t border-white/5 flex items-center shrink-0 z-[60] pb-2">
      <div className="flex w-full max-w-7xl mx-auto items-center justify-between px-6">
        
        {/* Pixel-Perfect Custom "N" Logo Node */}
        <div className="relative flex items-center justify-center w-12 h-12">
          <div className="absolute w-10 h-10 rounded-full border border-white/20" />
          <div className="absolute w-10 h-10 rounded-full border border-white/20 translate-x-1.5" />
          <span className="relative font-black text-xl text-white tracking-tighter">N</span>
        </div>

        <div className="flex flex-1 justify-around ml-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-300 lag-free-tap",
                  isActive ? "text-primary" : "text-neutral-500"
                )}
              >
                <item.icon className={cn("h-6 w-6", isActive && "text-primary")} />
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-tight italic text-center leading-none",
                  isActive ? "text-primary" : "text-neutral-500"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
