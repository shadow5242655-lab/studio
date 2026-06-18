
"use client";

import React from "react";
import { X, Trash2, ArrowRight } from "lucide-react";
import { SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function CartDrawer() {
  const cartItems = PlaceHolderImages.slice(0, 3).map((item, idx) => ({
    ...item,
    qty: 1,
    price: [2400, 1800, 3500][idx]
  }));

  const total = cartItems.reduce((acc, item) => acc + item.price, 0);

  return (
    <SheetContent className="w-full sm:max-w-md bg-card flex flex-col p-0 border-l">
      <SheetHeader className="p-6 border-b flex-row items-center justify-between space-y-0">
        <SheetTitle className="font-headline text-xl">Collection Cart</SheetTitle>
        <SheetClose asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </SheetClose>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {cartItems.map((item) => (
          <div key={item.id} className="flex gap-4 group">
            <div className="relative h-24 w-20 overflow-hidden rounded bg-secondary flex-shrink-0">
              <Image src={item.imageUrl} alt={item.description} fill className="object-cover transition-transform group-hover:scale-105" />
            </div>
            <div className="flex flex-col justify-between flex-1 py-1">
              <div>
                <h4 className="text-sm font-medium leading-tight">{item.description}</h4>
                <p className="text-xs text-muted-foreground mt-1">Premium Collection</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">₹{item.price}</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-sm">
                    <button className="px-2 py-1 text-xs hover:bg-muted">-</button>
                    <span className="px-2 text-xs">1</span>
                    <button className="px-2 py-1 text-xs hover:bg-muted">+</button>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t bg-secondary/30 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="text-lg font-bold">₹{total}</span>
        </div>
        <p className="text-[10px] text-muted-foreground text-center italic">
          Shipping and artisanal handling calculated at checkout.
        </p>
        <Button className="w-full py-6 text-base font-medium group">
          Secure Checkout
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </SheetContent>
  );
}
