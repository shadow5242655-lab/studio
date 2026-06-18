
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, Heart, ShoppingBag, Eye, Layers, Scale } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProductModal } from "./product-modal";

export function TextileGallery() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="masonry-grid pb-20">
      {PlaceHolderImages.map((item) => (
        <div 
          key={item.id} 
          className="masonry-item relative group overflow-hidden bg-card cursor-pointer border rounded-sm"
          onMouseEnter={() => setHoveredId(item.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <Dialog>
            <DialogTrigger asChild>
              <div className="relative overflow-hidden aspect-auto">
                <Image 
                  src={item.imageUrl} 
                  alt={item.description} 
                  width={800} 
                  height={1200}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4">
                  <div className="flex gap-2">
                    <Button size="icon" variant="secondary" className="rounded-full shadow-lg">
                      <ShoppingBag className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="secondary" className="rounded-full shadow-lg">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="primary" className="rounded-full shadow-lg">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-[10px] text-white/80 tracking-widest uppercase font-bold">Zoom for details</p>
                </div>
              </div>
            </DialogTrigger>
            <ProductModal garment={item} />
          </Dialog>

          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-widest text-primary uppercase font-bold">Premium Fabric</span>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Layers className="h-3 w-3" />
                <span className="text-[10px]">400 TC</span>
              </div>
            </div>
            <h3 className="font-headline text-lg group-hover:text-primary transition-colors leading-tight">
              {item.description}
            </h3>
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-semibold text-accent">From ₹1,200/m</span>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Scale className="h-3 w-3" />
                <span className="text-[10px]">Mid-weight</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
