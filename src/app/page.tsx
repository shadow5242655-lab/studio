
import { Navbar } from "@/components/navbar";
import { CategoryExplorer } from "@/components/category-explorer";
import { TextileGallery } from "@/components/textile-gallery";
import { CurationConsultant } from "@/components/curation-consultant";
import { ArrowRight, History, Sparkles, MoveDown, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-6 w-full">
        {/* Hero Section */}
        <section className="py-20 flex flex-col items-center text-center gap-8 border-b border-primary/10">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="h-px w-8 bg-primary/50" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">Established 1984</span>
              <div className="h-px w-8 bg-primary/50" />
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-bold leading-[1.1] tracking-tight">
              Woven with <span className="text-primary italic">Heritage</span>, <br />
              Worn with <span className="text-accent italic">Pride</span>.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Discover Shiv Garment House—where traditional craftsmanship meets contemporary design. 
              Explore our curated selection of premium silks, fine muslins, and artisanal weaves.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="rounded-sm px-10 py-7 text-base font-medium group">
              Explore Gallery
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-sm px-10 py-7 text-base font-medium border-primary/20 hover:bg-primary/5">
              <History className="mr-2 h-4 w-4" />
              Our Heritage
            </Button>
          </div>

          <div className="pt-8 flex flex-col items-center gap-2 text-muted-foreground opacity-50">
            <span className="text-[10px] uppercase tracking-widest font-bold">Scroll to discover</span>
            <MoveDown className="h-4 w-4 animate-bounce" />
          </div>
        </section>

        {/* Category & Gallery Section */}
        <section className="py-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-headline">The Visual Textile <span className="text-primary">Gallery</span></h2>
              <p className="text-sm text-muted-foreground">Sort our premium inventory by material, weave, and heritage type.</p>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">New Arrivals</p>
                <p className="text-sm font-semibold text-primary">Summer Cotton '24</p>
              </div>
            </div>
          </div>
          
          <CategoryExplorer />
          <TextileGallery />
        </section>

        {/* AI Style Consultant Section */}
        <CurationConsultant />

        {/* Brand Philosophy Section */}
        <section className="py-24 border-t border-primary/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4 group">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/5 text-primary transition-transform group-hover:scale-110">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-headline text-xl">Artisanal Sourcing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We work directly with master weavers from Benares, Chanderi, and Kanchipuram to bring you authentic textiles.
              </p>
            </div>
            <div className="space-y-4 group">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/5 text-primary transition-transform group-hover:scale-110">
                <History className="h-6 w-6" />
              </div>
              <h3 className="font-headline text-xl">Generational Heritage</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Established over three decades ago, Shiv Garments has been a trusted name for quality and tradition.
              </p>
            </div>
            <div className="space-y-4 group">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/5 text-primary transition-transform group-hover:scale-110">
                <Scissors className="h-6 w-6" />
              </div>
              <h3 className="font-headline text-xl">Bespoke Tailoring</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Beyond fabrics, our master tailors provide custom stitching services to ensure a perfect fit for every occasion.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-secondary/30 border-t border-primary/10 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1 space-y-4">
            <h2 className="text-xl font-headline font-bold text-primary">SHIV GARMENTS</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Premium artisanal textiles and traditional wear for the modern connoisseur. 
              Quality heritage clothing since 1984.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest">Collections</h4>
            <ul className="text-xs space-y-2 text-muted-foreground">
              <li className="hover:text-primary cursor-pointer transition-colors">Festive Wear</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Wedding Trousseau</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Casual Linen</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Artisanal Accessories</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest">Client Care</h4>
            <ul className="text-xs space-y-2 text-muted-foreground">
              <li className="hover:text-primary cursor-pointer transition-colors">Shipping Information</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Returns & Exchanges</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Sizing Guide</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Wholesale Inquiries</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest">Stay Connected</h4>
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                <span className="text-[10px] font-bold">IG</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                <span className="text-[10px] font-bold">FB</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                <span className="text-[10px] font-bold">PN</span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-4 italic">© 2024 Shiv Garment House. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
