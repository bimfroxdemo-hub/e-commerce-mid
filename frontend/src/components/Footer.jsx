import React, { useState } from 'react';
import { FiMail, FiInstagram, FiTwitter, FiPhone, FiMapPin, FiCheckCircle } from 'react-icons/fi';
import { FaWhatsapp, FaFacebookF } from 'react-icons/fa';
import { useApp } from '../context/AppContext';

export default function Footer({ onNavigate }) {
  const { siteSettings = {} } = useApp();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // ✅ Dynamic values from Admin Settings
  const brandName = siteSettings?.heroTitle || "KABIRAAZ FASHION";
  const brandDescription = siteSettings?.heroDescription || "A sanctuary of elite design, crafting bespoke cashmeres, hand-burnished Italian calfskin, and tailored chronographs.";
  const contactPhone = siteSettings?.contactPhone || "+91 98765 43210";
  const contactEmail = siteSettings?.contactEmail || "concierge@kabiraazfashion.com";
  const address = siteSettings?.address || "New Delhi, India";
  const instagramUrl = siteSettings?.instagram || "https://instagram.com/kabiraaz_fashion";
  const whatsappUrl = siteSettings?.whatsapp || "https://wa.me/919876543210";
  const facebookUrl = siteSettings?.facebook || "https://facebook.com";
  const twitterUrl = siteSettings?.twitter || "https://twitter.com";
  const copyrightLine = siteSettings?.copyright || "Kabiraaz Fashion India Ltd. All Designs Reserved.";

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer id="premium-store-footer" className="bg-[#1A1A3A] text-gray-300 pt-12 sm:pt-16 pb-6 sm:pb-8 border-t border-[#007A8A]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 pb-8 sm:pb-12 border-b border-[#007A8A]/20">
        
        {/* ✅ 1. BRAND BOX - Dynamic from Settings */}
        <div className="space-y-4 text-center sm:text-left">
          <button
            onClick={() => onNavigate('home')}
            className="text-lg sm:text-xl font-bold tracking-[0.25em] font-display text-white uppercase hover:text-[#D4AF37] transition-colors cursor-pointer"
          >
            {brandName}
          </button>
          <p className="text-xs leading-relaxed text-gray-400 max-w-xs mx-auto sm:mx-0">
            {brandDescription}
          </p>
          
          {/* Social Links - Dynamic URLs from Settings */}
          <div className="flex items-center justify-center sm:justify-start space-x-3 pt-2 text-gray-400">
            {instagramUrl && (
              <a 
                href={instagramUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#D4AF37] transition-colors bg-white/5 p-2 rounded-full cursor-pointer hover:bg-[#D4AF37]/10 border border-transparent hover:border-[#D4AF37]/20"
                title="Instagram"
              >
                <FiInstagram size={14} />
              </a>
            )}
            {whatsappUrl && (
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#007A8A] transition-colors bg-white/5 p-2 rounded-full cursor-pointer hover:bg-[#007A8A]/10 border border-transparent hover:border-[#007A8A]/20"
                title="WhatsApp"
              >
                <FaWhatsapp size={14} />
              </a>
            )}
            {facebookUrl && (
              <a 
                href={facebookUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#2E3192] transition-colors bg-white/5 p-2 rounded-full cursor-pointer hover:bg-[#2E3192]/10 border border-transparent hover:border-[#2E3192]/20"
                title="Facebook"
              >
                <FaFacebookF size={13} />
              </a>
            )}
            {twitterUrl && (
              <a 
                href={twitterUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#007A8A] transition-colors bg-white/5 p-2 rounded-full cursor-pointer hover:bg-[#007A8A]/10 border border-transparent hover:border-[#007A8A]/20"
                title="Twitter"
              >
                <FiTwitter size={14} />
              </a>
            )}
          </div>
        </div>

        {/* ✅ 2. CATEGORIES QUICK LINKS */}
        <div className="text-center sm:text-left">
          <h4 className="font-display font-semibold text-xs tracking-widest text-white uppercase mb-4">
            Shop Boutiques
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <button
                onClick={() => onNavigate('shop', { category: 'Men' })}
                className="hover:text-[#D4AF37] transition-colors text-gray-400 cursor-pointer text-left"
              >
                Men's Tailored
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('shop', { category: 'Women' })}
                className="hover:text-[#D4AF37] transition-colors text-gray-400 cursor-pointer text-left"
              >
                Women's Couture
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('shop', { category: 'Kids' })}
                className="hover:text-[#D4AF37] transition-colors text-gray-400 cursor-pointer text-left"
              >
                Organic Kids
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('shop', { category: 'Accessories' })}
                className="hover:text-[#D4AF37] transition-colors text-gray-400 cursor-pointer text-left"
              >
                Prestige Accessories
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('shop', { category: 'Footwear' })}
                className="hover:text-[#D4AF37] transition-colors text-gray-400 cursor-pointer text-left"
              >
                Minimalist Footwear
              </button>
            </li>
          </ul>
        </div>

        {/* ✅ 3. CORPORATE SERVICES & SUPPORT */}
        <div className="text-center sm:text-left">
          <h4 className="font-display font-semibold text-xs tracking-widest text-white uppercase mb-4">
            Concierge Support
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <button
                onClick={() => onNavigate('faq')}
                className="hover:text-[#D4AF37] transition-colors text-gray-400 cursor-pointer text-left"
              >
                Frequently Asked FAQ
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('about')}
                className="hover:text-[#D4AF37] transition-colors text-gray-400 cursor-pointer text-left"
              >
                The Atelier's Story
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('contact')}
                className="hover:text-[#D4AF37] transition-colors text-gray-400 cursor-pointer text-left"
              >
                Get in Touch (24/7)
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('privacy')}
                className="hover:text-[#D4AF37] transition-colors text-gray-400 cursor-pointer text-left"
              >
                Privacy Policy
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('terms')}
                className="hover:text-[#D4AF37] transition-colors text-gray-400 cursor-pointer text-left"
              >
                Terms of Use
              </button>
            </li>
          </ul>
        </div>

        {/* ✅ 4. PREMIUM NEWSLETTER BOX */}
        <div className="space-y-4 text-center sm:text-left">
          <h4 className="font-display font-semibold text-xs tracking-widest text-white uppercase mb-2">
            Subscribe to Fashion News
          </h4>
          <p className="text-xs text-gray-400 max-w-xs mx-auto sm:mx-0">
            Sign up to unlock complimentary concierge benefits, early-bird luxury drops, and VIP invitations.
          </p>
          
          {/* Newsletter Form */}
          <form onSubmit={handleSubscribe} className="space-y-2">
            <div className="relative text-left">
              <input
                type="email"
                placeholder="Enter email address"
                required
                className="w-full bg-white/5 border border-[#007A8A]/30 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 text-white placeholder-gray-500 pr-10 transition-all hover:border-[#007A8A]/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#007A8A] hover:text-[#D4AF37] transition-colors cursor-pointer"
                title="Subscribe"
              >
                <FiMail size={14} />
              </button>
            </div>
          </form>

          {/* Success Message */}
          {subscribed && (
            <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-xs text-[#007A8A] bg-[#007A8A]/10 p-2 rounded-lg animate-pulse border border-[#007A8A]/20">
              <FiCheckCircle size={12} className="flex-shrink-0" />
              <span>Subscription logged. Welcome to elite privilege!</span>
            </div>
          )}

          {/* Contact Info - Dynamic from Settings */}
          <div className="pt-2 text-xs text-gray-400 space-y-1.5">
            {address && (
              <p className="flex items-center justify-center sm:justify-start space-x-2 hover:text-gray-200 transition-colors">
                <FiMapPin size={12} className="text-[#007A8A] flex-shrink-0" />
                <span>{address}</span>
              </p>
            )}
            <p className="flex items-center justify-center sm:justify-start space-x-2 hover:text-gray-200 transition-colors">
              <FiPhone size={12} className="text-[#007A8A] flex-shrink-0" />
              <a href={`tel:${contactPhone}`} className="hover:text-[#D4AF37] transition-colors cursor-pointer">
                {contactPhone}
              </a>
            </p>
            <p className="flex items-center justify-center sm:justify-start space-x-2 hover:text-gray-200 transition-colors">
              <FiMail size={12} className="text-[#007A8A] flex-shrink-0" />
              <a href={`mailto:${contactEmail}`} className="hover:text-[#D4AF37] transition-colors cursor-pointer">
                {contactEmail}
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* ✅ COPYRIGHT - Dynamic from Settings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 space-y-3 sm:space-y-0">
        <div className="text-center sm:text-left">
          &copy; {new Date().getFullYear()} {copyrightLine}
        </div>
        <div className="flex flex-wrap justify-center sm:justify-end gap-3 sm:gap-4 md:gap-6">
          <button
            onClick={() => onNavigate('privacy')}
            className="hover:text-[#D4AF37] transition-colors cursor-pointer"
          >
            Privacy
          </button>
          <span className="text-[#007A8A]/30">|</span>
          <button
            onClick={() => onNavigate('terms')}
            className="hover:text-[#D4AF37] transition-colors cursor-pointer"
          >
            Terms
          </button>
          <span className="text-[#007A8A]/30">|</span>
          <button
            onClick={() => onNavigate('refund')}
            className="hover:text-[#D4AF37] transition-colors cursor-pointer"
          >
            Returns & Refunds
          </button>
        </div>
      </div>
    </footer>
  );
}