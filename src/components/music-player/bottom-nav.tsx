'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, History, Library } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * @fileOverview High-fidelity navigation bar optimized for mobile compatibility.
 * Spreads 4 options evenly across the viewport.
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
    <nav className="h-16 bg-black border-t border-white/5 flex items-center shrink-0 z-[60] pb-1">
      <div className="flex w-full max-w-7xl mx-auto items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300 lag-free-tap flex-1",
                isActive ? "text-primary" : "text-neutral-500"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className={cn(
                "text-[8px] font-black uppercase tracking-tight italic text-center leading-none",
                isActive ? "text-primary" : "text-neutral-500"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
