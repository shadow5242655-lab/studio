import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white">
      {/* Navigation */}
      <nav className="p-6 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-headline font-bold tracking-tighter text-primary uppercase">
            Shiv Garments
          </h1>
          <div className="space-x-8 text-sm uppercase tracking-widest text-zinc-400">
            <a href="#" className="hover:text-primary transition-colors">Collections</a>
            <a href="#" className="hover:text-primary transition-colors">Artisans</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-3xl space-y-8">
          <header>
            <h2 className="text-5xl md:text-7xl font-headline font-bold leading-tight">
              Timeless <span className="italic text-primary">Textiles</span>
            </h2>
            <p className="mt-4 text-zinc-400 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
              Exquisite hand-loomed fabrics and premium traditional wear, 
              crafted by master artisans for the modern connoisseur.
            </p>
          </header>

          <section className="pt-8">
            <button className="px-10 py-4 bg-primary text-white text-sm uppercase tracking-[0.2em] font-bold hover:bg-primary/90 transition-all rounded-sm shadow-2xl">
              Explore The Vault
            </button>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 border-t border-zinc-800 text-center">
        <p className="text-xs text-zinc-500 uppercase tracking-widest">
          © {new Date().getFullYear()} Shiv Clothes House & Garments. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
