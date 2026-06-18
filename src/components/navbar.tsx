"use client";

import React from "react";
import { Scissors } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-md px-6 py-4 md:py-5 border-white/5">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="h-8 w-8 md:h-10 md:w-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Scissors className="h-4 w-4 md:h-5 md:h-5 text-primary" />
          </div>
          <h1 className="text-sm md:text-2xl font-headline font-bold tracking-tight text-primary uppercase">
            SHIV CLOTHES HOUSE AND GARMENTS
          </h1>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          <a href="#about" className="hover:text-primary transition-colors">About</a>
          <a href="#reviews" className="hover:text-primary transition-colors">Testimonials</a>
          <a href="#contact" className="hover:text-primary transition-colors">Location</a>
        </div>
      </div>
    </nav>
  );
}