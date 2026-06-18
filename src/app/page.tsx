
import React from 'react';
import { Phone, MapPin, Star, ShoppingBag, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { Navbar } from '@/components/navbar';
import { CategoryExplorer } from '@/components/category-explorer';
import { TextileGallery } from '@/components/textile-gallery';
import { CurationConsultant } from '@/components/curation-consultant';
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
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-12 md:py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div className="space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase">
              <Sparkles className="h-3 w-3" />
              Est. Quality Tradition
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-headline font-bold leading-[1.1]">
              Exquisite <br />
              <span className="text-primary italic">Garments & Textiles</span>
            </h2>
            <p className="text-sm md:text-lg text-muted-foreground max-w-lg leading-relaxed">
              Step into the world of SHIV CLOTHES HOUSE AND GARMENTS. We offer a professional collection of premium fabrics and ready-made attire for every generation.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-2 bg-background px-3 py-1.5 border rounded-full shadow-sm">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Everything is Available</span>
              </div>
              <div className="flex items-center gap-2 bg-background px-3 py-1.5 border rounded-full shadow-sm">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Premium Selection</span>
              </div>
            </div>
          </div>
          <div className="relative aspect-[4/5] rounded-sm overflow-hidden shadow-2xl border-4 md:border-[12px] border-background rotate-1 hover:rotate-0 transition-transform duration-500">
            <Image 
              src={PlaceHolderImages[0].imageUrl} 
              alt="Premium Ethnic Collection" 
              fill 
              className="object-cover"
              data-ai-hint="indian sherwani"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
              <p className="text-white font-headline text-xl italic">The Wedding Collection</p>
            </div>
          </div>
        </div>
      </section>

      {/* Availability Banner */}
      <section className="bg-primary py-4 md:py-6 text-white overflow-hidden relative">
        <div className="flex whitespace-nowrap animate-pulse">
          <p className="text-sm sm:text-lg md:text-2xl font-headline font-bold uppercase tracking-[0.2em] px-4">
            * ALL THINGS ARE AVAILABLE IN MY SHOP * ALL THINGS ARE AVAILABLE IN MY SHOP * ALL THINGS ARE AVAILABLE IN MY SHOP *
          </p>
        </div>
      </section>

      {/* Collection Gallery */}
      <section id="collection" className="py-20 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4">
            <h3 className="text-3xl md:text-4xl font-headline font-bold italic border-l-4 border-primary pl-4">Our Professional Gallery</h3>
            <p className="text-muted-foreground max-w-xl">Browse through our curated selection of high-end textiles and masterfully tailored garments.</p>
          </div>
          <CategoryExplorer />
        </div>
        <TextileGallery />
      </section>

      {/* AI Curation Consultant */}
      <div className="bg-secondary/10">
        <div className="max-w-7xl mx-auto px-6">
          <CurationConsultant />
        </div>
      </div>

      {/* About Section */}
      <section id="about" className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 space-y-6">
            <h3 className="text-3xl font-headline font-bold italic">Heritage of Excellence</h3>
            <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
              Located at Dakghar road, Mahewa Ganj, Choraha, Lakhimpur, <strong>SHIV CLOTHES HOUSE AND GARMENTS</strong> has established itself as a premier fashion destination. We specialize in bringing the finest craftsmanship of the Indian subcontinent to your doorstep.
            </p>
            <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
              Our shop is a testament to quality, where <strong>all things are available</strong> for Men, Women, and Kids. From the intricate weaves of silk sarees to the modern cuts of linen shirts, we ensure every piece meets the highest standards of professionalism and comfort.
            </p>
          </div>
          <div className="md:col-span-5 relative aspect-square rounded-sm overflow-hidden shadow-xl border border-primary/10">
            <Image 
              src={PlaceHolderImages[1].imageUrl} 
              alt="Artisanal Weaving" 
              fill 
              className="object-cover"
              data-ai-hint="silk saree"
            />
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 bg-secondary/20 border-y border-primary/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h3 className="text-3xl md:text-4xl font-headline font-bold italic text-primary underline underline-offset-8 decoration-primary/20">Patron Testimonials</h3>
            <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-[0.2em] font-bold">Trusted by families for generations</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review, i) => (
              <div key={i} className="bg-background p-8 border rounded-sm shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex gap-1 mb-6">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="italic text-muted-foreground mb-8 leading-relaxed text-sm md:text-base">"{review.text}"</p>
                <div className="flex items-center gap-4 border-t pt-6">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{review.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{review.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 max-w-7xl mx-auto px-6">
        <div className="bg-card border rounded-sm overflow-hidden grid md:grid-cols-2 shadow-2xl">
          <div className="p-8 md:p-16 space-y-10">
            <div className="space-y-4">
              <h3 className="text-3xl md:text-5xl font-headline font-bold italic">Visit Our Store</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Experience the collection in person. Our experts are ready to assist you in finding the perfect attire for any occasion.
              </p>
            </div>
            
            <div className="space-y-8">
              <div className="flex items-center gap-6 group">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Call our Hotline</p>
                  <p className="text-xl md:text-2xl font-bold">+91 94529 21477</p>
                  <p className="text-sm font-medium text-primary">+91 88403 66167</p>
                </div>
              </div>
              <div className="flex items-start gap-6 group">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Our Location</p>
                  <p className="text-base md:text-xl font-bold leading-tight">Dakghar road, Mahewa Ganj, Choraha</p>
                  <p className="text-sm md:text-base">Lakhimpur, Uttar Pradesh 261506</p>
                </div>
              </div>
              <div className="flex items-center gap-6 group">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Shop Hours</p>
                  <p className="text-base md:text-lg font-bold">10:00 AM - 9:00 PM</p>
                  <p className="text-[10px] text-muted-foreground italic font-medium">Open All Days</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative h-[400px] md:h-auto min-h-[400px] group overflow-hidden">
            <Image 
              src={PlaceHolderImages[3].imageUrl} 
              alt="Shop Front" 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              data-ai-hint="bridal lehenga"
            />
            <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
          <div className="space-y-2">
            <p className="text-2xl md:text-4xl font-headline font-bold text-primary uppercase tracking-tight">SHIV CLOTHES HOUSE AND GARMENTS</p>
            <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-[0.4em] font-bold">
              Quality • Trust • Tradition
            </p>
          </div>
          <div className="flex justify-center gap-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Men</a>
            <a href="#" className="hover:text-primary transition-colors">Women</a>
            <a href="#" className="hover:text-primary transition-colors">Kids</a>
            <a href="#" className="hover:text-primary transition-colors">Fabrics</a>
          </div>
          <div className="pt-12 text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium border-t border-primary/5 inline-block px-12">
            © {new Date().getFullYear()} SHIV CLOTHES HOUSE AND GARMENTS. Lakhimpur, UP. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
