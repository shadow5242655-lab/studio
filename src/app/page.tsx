'use client';

import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Star, CheckCircle2, Clock, Sparkles, Scissors } from 'lucide-react';

export default function Home() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    // Fixing potential hydration mismatch by setting the year on the client
    setCurrentYear(new Date().getFullYear());
  }, []);

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
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Scissors className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-xs md:text-xl font-headline font-bold tracking-tight text-primary uppercase">
              SHIV CLOTHES HOUSE AND GARMENTS
            </h1>
          </div>
          <div className="hidden md:flex gap-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <a href="#about" className="hover:text-primary transition-colors">About</a>
            <a href="#reviews" className="hover:text-primary transition-colors">Testimonials</a>
            <a href="#contact" className="hover:text-primary transition-colors">Location</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-12 md:py-24 grey-gradient overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6 md:space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase border border-primary/20">
            <Sparkles className="h-3 w-3" />
            Quality & Tradition
          </div>
          <h2 className="text-3xl md:text-6xl font-headline font-bold leading-tight uppercase tracking-tight">
            SHIV CLOTHES HOUSE <br />
            <span className="text-primary italic">AND GARMENTS</span>
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Providing premium fabrics and ready-made attire for every generation with trust and excellence since years.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <div className="flex items-center gap-2 bg-card px-4 py-2 border rounded-full shadow-sm border-primary/20 red-glow">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider">Professional Service</span>
            </div>
          </div>
        </div>
      </section>

      {/* Availability Banner */}
      <section className="bg-primary py-3 md:py-4 text-white overflow-hidden relative border-y border-white/10">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(8)].map((_, i) => (
            <p key={i} className="text-xs md:text-lg font-headline font-bold uppercase tracking-[0.2em] px-4">
              * ALL TYPES OF CLOTHES ARE AVAILABLE *
            </p>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 md:py-20 max-w-4xl mx-auto px-6">
        <div className="space-y-6 md:space-y-10 text-center">
          <h3 className="text-xl md:text-3xl font-headline font-bold italic border-b-2 border-primary pb-2 inline-block">Heritage of Excellence</h3>
          <div className="space-y-4 md:space-y-6 text-sm md:text-base text-muted-foreground leading-relaxed text-left md:text-center">
            <p>
              Located at Dakghar road, Mahewa Ganj, Choraha, Lakhimpur, <strong>SHIV CLOTHES HOUSE AND GARMENTS</strong> has established itself as a premier destination for those seeking quality and variety.
            </p>
            <p>
              Our shop is a testament to quality, where <strong>ALL TYPES OF CLOTHES ARE AVAILABLE</strong> for Men, Women, and Kids. We pride ourselves on offering professional service and a selection that meets the highest standards of comfort and style.
            </p>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-12 md:py-20 bg-card border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10 md:mb-16 space-y-2">
            <h3 className="text-2xl md:text-3xl font-headline font-bold italic text-primary">Patron Testimonials</h3>
            <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Trusted by families for generations</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <div key={i} className="bg-background p-6 md:p-8 border border-white/5 rounded-sm shadow-xl text-center hover:border-primary/30 transition-all duration-300">
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} className="h-3 w-3 fill-primary text-primary" />
                  ))}
                </div>
                <p className="italic text-muted-foreground mb-6 leading-relaxed text-xs md:text-sm">"{review.text}"</p>
                <div className="border-t border-white/5 pt-4">
                  <p className="font-bold text-[10px] md:text-xs tracking-wide uppercase">{review.name}</p>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] mt-1">{review.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 md:py-20 max-w-4xl mx-auto px-6">
        <div className="bg-card border border-white/5 rounded-sm p-6 md:p-12 shadow-2xl space-y-8 md:space-y-12">
          <div className="text-center space-y-2">
            <h3 className="text-2xl md:text-4xl font-headline font-bold italic text-primary">Visit Our Store</h3>
            <p className="text-muted-foreground leading-relaxed text-xs md:text-sm">
              Experience our professional hospitality in person. Our experts are ready to assist you.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-center gap-4 group">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Call Us</p>
                <p className="text-base md:text-xl font-bold">+91 94529 21477</p>
                <p className="text-[10px] font-medium text-primary mt-0.5">+91 88403 66167</p>
              </div>
            </div>
            
            <a 
              href="https://maps.app.goo.gl/3xAZF3X8wyqGK6pc6?g_st=ac" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-start gap-4 group hover:opacity-80 transition-opacity"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Our Location (Open Map)</p>
                <p className="text-sm md:text-base font-bold leading-tight underline decoration-primary/30 underline-offset-4">Dakghar road, Mahewa Ganj, Choraha</p>
                <p className="text-[9px] md:text-[10px] font-medium text-muted-foreground mt-1">Lakhimpur, Uttar Pradesh 261506</p>
              </div>
            </a>

            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Shop Hours</p>
                <p className="text-sm md:text-base font-bold">10:00 AM - 9:00 PM</p>
                <p className="text-[8px] text-muted-foreground italic font-medium uppercase tracking-widest mt-0.5">Open All Days</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 md:py-12 border-t border-white/5 bg-card">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4 md:space-y-6">
          <div className="space-y-1">
            <p className="text-lg md:text-2xl font-headline font-bold text-primary uppercase tracking-tight">SHIV CLOTHES HOUSE AND GARMENTS</p>
            <p className="text-[8px] text-muted-foreground uppercase tracking-[0.5em] font-bold">
              Quality • Trust • Tradition
            </p>
          </div>
          <div className="pt-4 text-[8px] text-muted-foreground uppercase tracking-[0.3em] font-semibold border-t border-white/5 inline-block px-4">
            © {currentYear} SHIV CLOTHES HOUSE AND GARMENTS. Lakhimpur, UP.
          </div>
        </div>
      </footer>
    </div>
  );
}
