import React from 'react';
import { useApp } from '../context/AppContext';

export default function Terms() {
  const { siteSettings } = useApp();
  return (
    <div id="terms-page" className="max-w-3xl mx-auto px-4 py-16 space-y-8 animate-fade-in text-gray-500 font-light text-sm leading-relaxed">
      <div className="border-b border-gray-100 pb-5">
        <h1 className="font-display font-extrabold text-3xl uppercase text-black tracking-tight">Terms of Use</h1>
        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold">Standard Client Terms & Patron Rules</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm">
        <p>{siteSettings.terms}</p>

        <h3 className="font-display font-bold text-black uppercase tracking-wider text-xs sm:text-sm">1. Authentic Certified Designs</h3>
        <p>Luxe Store represents that all products sold on our platform are original, luxury design pieces. All measurements, fabrics, specifications (wool percentages, leather grade calfskin, gold casings) are entirely accurate as described.</p>

        <h3 className="font-display font-bold text-black uppercase tracking-wider text-xs sm:text-sm">2. Billing & Verified UPI</h3>
        <p>By placing an order, you certify that you have the authorization to perform transactions with the specified payment coordinates. Unverified, suspicious billing activities will be blocked instantly from accessing the control nodes.</p>

        <p className="text-[10px] text-gray-400 font-bold uppercase">Last Updated: July 06, 2026. Certified by Luxe Atelier Plaza Legal Department.</p>
      </div>
    </div>
  );
}
