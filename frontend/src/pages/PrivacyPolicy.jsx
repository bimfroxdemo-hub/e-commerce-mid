import React from 'react';
import { useApp } from '../context/AppContext';

export default function PrivacyPolicy() {
  const { siteSettings } = useApp();
  return (
    <div id="privacy-page" className="max-w-3xl mx-auto px-4 py-16 space-y-8 animate-fade-in text-gray-500 font-light text-sm leading-relaxed">
      <div className="border-b border-gray-100 pb-5">
        <h1 className="font-display font-extrabold text-3xl uppercase text-black tracking-tight">Privacy Policy</h1>
        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold">Luxe Store Privacy Standards & Encryption Regulations</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm">
        <p>Luxe Store values your absolute privacy. We store encryption tokens client-side and never sell consumer metrics. Our policy complies with GDPR and localized Indian Data Protection regulations.</p>
        
        <h3 className="font-display font-bold text-black uppercase tracking-wider text-xs sm:text-sm">1. Collection of Transaction Metrics</h3>
        <p>To deliver high-end cashmere garments and customized chronographs, we require specific coordinates (your shipping address, full name, email address, phone contact). Secure biometric financial details are handled solely by PCI-DSS compliant gateways like Stripe, Paytm, or BHIM.</p>

        <h3 className="font-display font-bold text-black uppercase tracking-wider text-xs sm:text-sm">2. Cookies & Client-Side Cache</h3>
        <p>We use local storage (client-side cache) to remember items inside your shopping bag, wishlist saves, and recent query parameters. This maximizes load speed and eliminates latency.</p>

        <p className="text-[10px] text-gray-400 font-bold uppercase">Last Updated: July 06, 2026. Certified by Luxe Security Compliance Node.</p>
      </div>
    </div>
  );
}
