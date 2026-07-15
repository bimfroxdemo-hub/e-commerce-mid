import React from 'react';
import { FiAward, FiShield, FiHeart } from 'react-icons/fi';

export default function About() {
  return (
    <div id="about-page" className="max-w-4xl mx-auto px-4 py-16 space-y-12 animate-fade-in text-gray-600 font-light text-sm leading-relaxed">
      <div className="text-center space-y-3">
        <span className="text-[10px] text-primary uppercase font-bold tracking-[0.25em]">Our Heritage</span>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-black uppercase tracking-tight">The Luxe Story</h1>
        <p className="text-xs text-gray-400 max-w-md mx-auto uppercase tracking-wider font-bold">Crafting bespoke couture & premium horology since 2012</p>
      </div>

      <div className="aspect-[2/1] w-full rounded-3xl overflow-hidden bg-slate-100">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800"
          alt="Boutique Workshop"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs sm:text-sm">
        <div className="space-y-4">
          <h3 className="font-display font-bold text-black uppercase tracking-wide">Pure Authentic Design</h3>
          <p>Luxe Store was founded with a singular purpose: to deliver impeccable luxury apparel directly to patrons without the inflated high-street showroom markups.</p>
          <p>We source ultra-premium Mongolian cashmere wools, handpicked full-grain Italian calfskin from Florence, and genuine Swiss chronograph assemblies. Each piece undergoes exhaustive visual inspection before receiving our wax-sealed authenticity certification.</p>
        </div>
        <div className="space-y-4">
          <h3 className="font-display font-bold text-black uppercase tracking-wide">Concierge Experience</h3>
          <p>To us, service is a sacred art. Our custom sizing, free regional priority shipping above ₹999, and easy 14-day return portal ensure absolute peace of mind during transactions.</p>
          <p>With fully verified 256-bit SSL encryptions, you can manage your shipping coordinates, check timeline charts, and chat with our head designer via secure channels.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 border-t border-b border-gray-100 py-8 text-center">
        <div>
          <p className="text-2xl font-bold text-black font-mono">14k+</p>
          <p className="text-[10px] uppercase text-gray-400 tracking-wider mt-1">Patrons Served</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-black font-mono">100%</p>
          <p className="text-[10px] uppercase text-gray-400 tracking-wider mt-1">Authentic Certified</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-black font-mono">24/7</p>
          <p className="text-[10px] uppercase text-gray-400 tracking-wider mt-1">Concierge Line</p>
        </div>
      </div>
    </div>
  );
}
