import React from 'react';
import { Phone, MapPin, Star, ShoppingBag, CheckCircle2, Clock, Mail } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const reviews = [
    {
      name: "Rajesh Kumar",
      location: "Lakhimpur",
      text: "Excellent quality fabrics. I bought a wedding suit from here and the material is top-notch. Highly recommended for traditional wear.",
      rating: 5
    },
    {
      name: "Priya Sharma",
      location: "Mahewa Ganj",
      text: "Shiv Clothes House has a huge collection. I found exactly what I was looking for. The best part is that everything is available under one roof.",
      rating: 5
    },
    {
      name: "Amit Patel",
      location: "Kheri",
      text: "Very reasonable prices and very friendly staff. They have a great variety of daily wear and festive clothes. Truly a one-stop shop.",
      rating: 4
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg sm:text-xl md:text-2xl font-headline font-bold text-primary tracking-tight leading-tight">
            SHIV CLOTHES HOUSE <span className="hidden sm:inline">AND GARMENTS</span>
            <span className="sm:hidden block text-xs">AND GARMENTS</span>
          </h1>
          <div className="hidden md:flex gap-6 text-sm font-medium uppercase tracking-wider">
            <a href="#about" className="hover:text-primary transition-colors">About</a>
            <a href="#collection" className="hover:text-primary transition-colors">Collection</a>
            <a href="#reviews" className="hover:text-primary transition-colors">Reviews</a>
            <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
          </div>
          <a href="tel:+919452921477" className="bg-primary text-white px-3 py-2 rounded-sm text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0">
            <Phone className="h-4 w-4" />
            <span className="hidden xs:inline">Call Now</span>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-headline font-bold leading-[1.1]">
              Your Premier <br />
              <span className="text-primary italic">Clothing Destination</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed">
              Welcome to SHIV CLOTHES HOUSE AND GARMENTS. We pride ourselves on providing the highest quality textiles and ready-made garments. Whether it's festive, formal, or casual—we have it all.
            </p>
            <div className="flex flex-wrap gap-3 pt-2 md:pt-4">
              <div className="flex items-center gap-2 bg-background px-3 py-1.5 border rounded-full">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-xs sm:text-sm font-semibold">Everything is Available</span>
              </div>
              <div className="flex items-center gap-2 bg-background px-3 py-1.5 border rounded-full">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-xs sm:text-sm font-semibold">Artisanal Quality</span>
              </div>
            </div>
          </div>
          <div className="relative aspect-square md:aspect-[4/5] rounded-sm overflow-hidden shadow-2xl border-4 md:border-8 border-background">
            <Image 
              src={PlaceHolderImages[2].imageUrl} 
              alt="Premium Collection" 
              fill 
              className="object-cover"
              data-ai-hint="clothing shop"
            />
          </div>
        </div>
      </section>

      {/* Availability Banner */}
      <section className="bg-primary py-8 md:py-12 text-white overflow-hidden relative">
        <div className="flex whitespace-nowrap animate-pulse overflow-hidden">
          <p className="text-lg sm:text-2xl md:text-4xl font-headline font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] px-4 shrink-0">
            * ALL THINGS ARE AVAILABLE IN MY SHOP * ALL THINGS ARE AVAILABLE IN MY SHOP * ALL THINGS ARE AVAILABLE IN MY SHOP *
          </p>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-24 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          <div className="md:col-span-2 space-y-4 md:space-y-6">
            <h3 className="text-2xl md:text-3xl font-headline font-bold italic border-l-4 border-primary pl-4">About Our Shop</h3>
            <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
              Located at Dakghar road, Mahewa Ganj, Choraha, Lakhimpur, SHIV CLOTHES HOUSE AND GARMENTS has been a trusted name in fashion for years. We understand the rich heritage of Indian textiles and bring you a curated selection of sarees, lehengas, suits, shirts, and much more.
            </p>
            <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
              Our philosophy is simple: provide every customer with the perfect outfit. <strong>All things are available in my shop</strong>, from the finest silk fabrics for special occasions to comfortable cotton wear for everyday life. We don't just sell clothes; we provide a tradition of excellence.
            </p>
          </div>
          <div className="bg-primary/5 p-6 md:p-8 rounded-sm space-y-6 border border-primary/10">
            <h4 className="text-xl font-headline font-bold">Why Choose Us?</h4>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <ShoppingBag className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm">Complete variety for Men, Women & Kids</span>
              </li>
              <li className="flex gap-3">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm">Quick tailoring and alterations</span>
              </li>
              <li className="flex gap-3">
                <Star className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm">Premium quality hand-picked fabrics</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-16 md:py-24 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10 md:mb-16 space-y-2 md:space-y-4">
            <h3 className="text-3xl md:text-4xl font-headline font-bold italic text-primary">Customer Stories</h3>
            <p className="text-sm md:text-base text-muted-foreground">What our valued patrons say about us</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {reviews.map((review, i) => (
              <div key={i} className="bg-background p-6 md:p-8 border rounded-sm shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="italic text-muted-foreground mb-6 leading-relaxed text-sm md:text-base">"{review.text}"</p>
                <div className="border-t pt-4">
                  <p className="font-bold text-sm md:text-base">{review.name}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest">{review.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-24 max-w-7xl mx-auto px-6">
        <div className="bg-card border rounded-sm overflow-hidden grid md:grid-cols-2">
          <div className="p-8 md:p-12 space-y-6 md:space-y-8">
            <h3 className="text-3xl md:text-4xl font-headline font-bold italic">Contact Us</h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Visit us today or get in touch for any inquiries regarding collections, bulk orders, or custom designs.
            </p>
            <div className="space-y-6 md:space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">Main Hotline</p>
                  <p className="text-lg md:text-xl font-bold">+91 94529 21477</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">Secondary Line</p>
                  <p className="text-lg md:text-xl font-bold">+91 88403 66167</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">Our Location</p>
                  <p className="text-sm md:text-base font-bold">Dakghar road, Mahewa Ganj, Choraha</p>
                  <p className="text-sm md:text-base">Lakhimpur, Uttar Pradesh 261506</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative h-[300px] md:h-full min-h-[300px]">
            <Image 
              src={PlaceHolderImages[0].imageUrl} 
              alt="Shop Interior" 
              fill 
              className="object-cover"
              data-ai-hint="textile shop"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 md:py-12 border-t bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
          <p className="text-xl md:text-2xl font-headline font-bold text-primary uppercase tracking-tight">SHIV CLOTHES HOUSE AND GARMENTS</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] md:tracking-[0.4em]">
            Quality • Trust • Tradition
          </p>
          <div className="pt-6 md:pt-8 text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-widest">
            © {new Date().getFullYear()} SHIV CLOTHES HOUSE AND GARMENTS. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
