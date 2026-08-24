
'use client';

import React from 'react';
import { TextileGallery } from '@/components/textile-gallery';
import { CurationConsultant } from '@/components/curation-consultant';
import { CategoryExplorer } from '@/components/category-explorer';
import { CartDrawer } from '@/components/cart-drawer';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Sparkles, MapPin, Scissors } from 'lucide-react';

export default function BoutiquePage() {
  return (
    <div className="pb-32 bg-neutral-950">
      {/* High-End Header */}
      <header className="p-8 md:p-12 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-primary font-bold tracking-[0.2em] text-[10px] uppercase">
            <Sparkles className="h-3 w-3" />
            Bespoke Collection
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-white uppercase italic leading-none">
            The <span className="text-primary">Boutique</span>
          </h1>
          <p className="text-neutral-400 font-medium max-w-md">
            All types of clothes are available. Experience the intersection of premium heritage textiles and modern curation.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="lg" className="rounded-full px-8 gap-2 font-bold shadow-2xl">
                  <ShoppingBag className="h-5 w-5" />
                  View Cart
                </Button>
              </SheetTrigger>
              <CartDrawer />
            </Sheet>
            <a 
              href="https://maps.app.goo.gl/3wG8i6Z9Y6Z9Y6Z9Y" 
              target="_blank" 
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors"
            >
              <MapPin className="h-4 w-4" />
              Visit Studio
            </a>
          </div>
        </div>

        <div className="hidden lg:block w-72 h-96 relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
          <img 
            src="https://picsum.photos/seed/boutique-hero/600/800" 
            alt="Premium Textile" 
            className="w-full h-full object-cover"
            data-ai-hint="luxury garment"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-6 left-6">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Featured</p>
            <p className="font-bold text-white italic">Hand-Woven Silk</p>
          </div>
        </div>
      </header>

      <div className="p-8 space-y-24">
        {/* Category Navigation */}
        <section>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Explore Textiles</h2>
              <p className="text-sm text-neutral-500">Filter by material, weave, or occasion</p>
            </div>
          </div>
          <CategoryExplorer />
        </section>

        {/* The Gallery */}
        <section>
          <TextileGallery />
        </section>

        {/* AI Style Consultant */}
        <section className="bg-neutral-900/30 rounded-3xl p-8 md:p-12 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10" />
          <CurationConsultant />
        </section>

        {/* About & Craftsmanship */}
        <section id="about" className="grid grid-cols-1 md:grid-cols-3 gap-12 py-12 border-t border-white/5">
          <div className="space-y-4">
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Scissors className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-xl font-bold italic uppercase tracking-tighter">Artisanal Tailoring</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Every piece in the AYUMUSIC collection is hand-finished by local artisans, ensuring a unique heritage fingerprint in every stitch.
            </p>
          </div>
          <div className="space-y-4">
            <div className="h-10 w-10 bg-neutral-800 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold italic uppercase tracking-tighter">Global Shipping</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">
              We bring the best of Indian textiles to your doorstep, wherever you are in the world. Secure, tracked, and insured delivery.
            </p>
          </div>
          <div className="space-y-4">
            <div className="h-10 w-10 bg-neutral-800 rounded-full flex items-center justify-center">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold italic uppercase tracking-tighter">Studio Experience</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Visit our physical studio for a tactile experience and personalized measurements. Located in the heart of the textile hub.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
