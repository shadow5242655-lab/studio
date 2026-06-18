
import React from 'react';
import { Phone, MapPin, Star, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/navbar';

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
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-secondary/30">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase">
            <Sparkles className="h-3 w-3" />
            Quality Tradition
          </div>
          <h2 className="text-4xl md:text-7xl font-headline font-bold leading-tight uppercase tracking-tight">
            SHIV CLOTHES HOUSE <br />
            <span className="text-primary italic">AND GARMENTS</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Providing premium fabrics and ready-made attire for every generation with trust and excellence.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <div className="flex items-center gap-2 bg-background px-4 py-2 border rounded-full shadow-sm">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider">Everything Available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Availability Banner */}
      <section className="bg-primary py-4 text-white overflow-hidden relative border-y border-white/10">
        <div className="flex whitespace-nowrap animate-pulse">
          <p className="text-lg md:text-2xl font-headline font-bold uppercase tracking-[0.2em] px-4">
            * ALL THINGS ARE AVAILABLE IN MY SHOP * ALL THINGS ARE AVAILABLE IN MY SHOP * ALL THINGS ARE AVAILABLE IN MY SHOP *
          </p>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 max-w-4xl mx-auto px-6">
        <div className="space-y-10 text-center">
          <h3 className="text-3xl font-headline font-bold italic border-b-2 border-primary/20 pb-4 inline-block">Heritage of Excellence</h3>
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed text-left md:text-center">
            <p>
              Located at Dakghar road, Mahewa Ganj, Choraha, Lakhimpur, <strong>SHIV CLOTHES HOUSE AND GARMENTS</strong> has established itself as a premier destination for those seeking quality and variety.
            </p>
            <p>
              Our shop is a testament to quality, where <strong>all things are available</strong> for Men, Women, and Kids. We pride ourselves on offering professional service and a selection that meets the highest standards of comfort and style.
            </p>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 bg-secondary/20 border-y border-primary/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h3 className="text-3xl md:text-4xl font-headline font-bold italic text-primary underline underline-offset-8 decoration-primary/20">Patron Testimonials</h3>
            <p className="text-sm text-muted-foreground uppercase tracking-[0.2em] font-bold">Trusted by families for generations</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review, i) => (
              <div key={i} className="bg-background p-10 border rounded-sm shadow-sm hover:shadow-xl transition-all duration-300 text-center">
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="italic text-muted-foreground mb-10 leading-relaxed text-base">"{review.text}"</p>
                <div className="border-t pt-8">
                  <p className="font-bold text-sm tracking-wide">{review.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-1">{review.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 max-w-4xl mx-auto px-6">
        <div className="bg-card border rounded-sm p-8 md:p-16 shadow-2xl space-y-16">
          <div className="text-center space-y-4">
            <h3 className="text-3xl md:text-5xl font-headline font-bold italic">Visit Our Store</h3>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Experience our professional hospitality in person. Our experts are ready to assist you.
            </p>
          </div>
          
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="flex items-center gap-6 group">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Call our Hotline</p>
                <p className="text-2xl font-bold">+91 94529 21477</p>
                <p className="text-sm font-medium text-primary mt-1">+91 88403 66167</p>
              </div>
            </div>
            <div className="flex items-start gap-6 group">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Our Location</p>
                <p className="text-xl font-bold">Dakghar road, Mahewa Ganj, Choraha</p>
                <p className="text-sm font-medium">Lakhimpur, Uttar Pradesh 261506</p>
              </div>
            </div>
            <div className="flex items-center gap-6 group">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Shop Hours</p>
                <p className="text-xl font-bold">10:00 AM - 9:00 PM</p>
                <p className="text-[10px] text-muted-foreground italic font-medium uppercase tracking-widest mt-1">Open All Days</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-10">
          <div className="space-y-4">
            <p className="text-3xl md:text-4xl font-headline font-bold text-primary uppercase tracking-tight">SHIV CLOTHES HOUSE AND GARMENTS</p>
            <p className="text-xs text-muted-foreground uppercase tracking-[0.5em] font-bold">
              Quality • Trust • Tradition
            </p>
          </div>
          <div className="pt-10 text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-semibold border-t border-primary/5 inline-block px-12">
            © {new Date().getFullYear()} SHIV CLOTHES HOUSE AND GARMENTS. Lakhimpur, UP.
          </div>
        </div>
      </footer>
    </div>
  );
}
