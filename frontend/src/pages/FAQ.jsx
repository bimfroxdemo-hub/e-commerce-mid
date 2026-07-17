import React, { useState } from 'react';
import { FiChevronDown, FiHelpCircle } from 'react-icons/fi';

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    { 
      q: "Are all garments certified authentic original designs?", 
      a: "Yes. Every item sold on Kabiraaz Fashion is designed, woven, and finished inside our private partner ateliers across Florence and New Delhi. Every shipment contains a unique wax-sealed authenticity certification code." 
    },
    { 
      q: "What is your return & exchange window?", 
      a: "We offer a complimentary 14-day return and exchange window. Simply click 'Request Return' in your orders dashboard, and our courier agent will arrive to perform a quality check and collect the item. Sizing swaps are free." 
    },
    { 
      q: "Is cash on delivery (COD) supported across India?", 
      a: "Yes. We support cash on delivery for over 18,000 pincodes across India at zero extra processing charge. Keep your cash or a banking UPI QR code ready on the day of shipment arrival." 
    },
    { 
      q: "Can I schedule a tailor alignment fitting?", 
      a: "Absolutely. Patrons within Delhi NCR, Mumbai, and Bengaluru can arrange for a master tailor to visit their residence for measurements or drapery adjustment tests. Contact concierge hotline +91 98765 43210 to book." 
    },
    { 
      q: "Where can I find my shipment tracking ID?", 
      a: "Once your item is dispatched via BlueDart, your unique AWB tracking ID will appear in your 'My Orders' section. You can check the live tracking timeline charts directly on our user panel." 
    }
  ];

  return (
    <div id="faq-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 space-y-8 sm:space-y-12 animate-fade-in">
      {/* Header Section */}
      <div className="text-center space-y-3 sm:space-y-4">
        {/* Badge */}
        <div className="inline-flex items-center justify-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-[#007A8A]/10 to-[#2E3192]/10 border border-[#007A8A]/20 rounded-full">
            <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-pulse"></span>
            <span className="text-[9px] sm:text-[10px] text-[#007A8A] uppercase font-black tracking-[0.25em]">
              Atelier Solutions
            </span>
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="font-black text-2xl sm:text-3xl lg:text-4xl text-[#1A1A3A] uppercase tracking-tight leading-tight">
          Concierge <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007A8A] to-[#2E3192]">FAQ</span>
        </h1>

        {/* Subtitle */}
        <p className="text-[10px] sm:text-xs text-[#333333]/60 max-w-2xl mx-auto uppercase tracking-wider font-bold px-4">
          Frequently asked answers regarding delivery, tailor, and craftsmanship
        </p>

        {/* Decorative Line */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <div className="w-8 sm:w-12 h-px bg-gradient-to-r from-transparent to-[#007A8A]"></div>
          <div className="w-2 h-2 bg-[#D4AF37] rounded-full"></div>
          <div className="w-8 sm:w-12 h-px bg-gradient-to-l from-transparent to-[#007A8A]"></div>
        </div>
      </div>

      {/* FAQ Items */}
      <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className={`border rounded-xl sm:rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ${
                isOpen 
                  ? 'border-[#007A8A]/30 bg-gradient-to-br from-white to-[#007A8A]/5 shadow-md shadow-[#007A8A]/10' 
                  : 'border-gray-100 bg-white hover:border-[#007A8A]/20 hover:shadow-md'
              }`}
            >
              {/* Question Button */}
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full text-left p-4 sm:p-5 lg:p-6 flex justify-between items-start sm:items-center gap-3 transition-all duration-200 hover:bg-slate-50/50 cursor-pointer group"
              >
                <span className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isOpen 
                      ? 'bg-gradient-to-br from-[#007A8A] to-[#2E3192] text-white shadow-lg shadow-[#007A8A]/30' 
                      : 'bg-[#007A8A]/10 text-[#007A8A] group-hover:bg-[#007A8A]/20'
                  }`}>
                    <FiHelpCircle size={16} className={isOpen ? 'scale-110' : ''} />
                  </div>

                  {/* Question Text */}
                  <span className={`font-bold text-xs sm:text-sm lg:text-base uppercase tracking-wide leading-snug transition-colors duration-200 ${
                    isOpen ? 'text-[#1A1A3A]' : 'text-[#333333] group-hover:text-[#1A1A3A]'
                  }`}>
                    {faq.q}
                  </span>
                </span>

                {/* Chevron Icon */}
                <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  isOpen 
                    ? 'bg-[#D4AF37]/20 text-[#D4AF37] rotate-180' 
                    : 'bg-gray-100 text-gray-400 group-hover:bg-[#007A8A]/10 group-hover:text-[#007A8A]'
                }`}>
                  <FiChevronDown size={16} />
                </div>
              </button>
              
              {/* Answer */}
              {isOpen && (
                <div className="border-t border-[#007A8A]/10 bg-gradient-to-br from-slate-50/50 to-[#007A8A]/5 animate-fade-in">
                  <div className="p-4 sm:p-5 lg:p-6 pl-12 sm:pl-14 lg:pl-16">
                    <p className="text-xs sm:text-sm leading-relaxed text-[#333333]/80 font-normal">
                      {faq.a}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="pt-8 sm:pt-12 text-center space-y-4">
        <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-gradient-to-br from-[#1A1A3A] to-[#2E3192] rounded-2xl sm:rounded-3xl shadow-xl shadow-[#1A1A3A]/20">
          <div className="text-center sm:text-left space-y-1">
            <p className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Still have questions?
            </p>
            <p className="text-[10px] text-white/60 font-medium">
              Our concierge team is available 24/7
            </p>
          </div>
          
          <a
            href="tel:+919876543210"
            className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#B8941F] text-[#1A1A3A] px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-lg shadow-[#D4AF37]/30 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
          >
            <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Contact Concierge
          </a>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-gray-100">
          {[
            { icon: '🔒', text: 'Secure Payments' },
            { icon: '📦', text: 'Free Delivery' },
            { icon: '↩️', text: '14-Day Returns' },
            { icon: '✓', text: 'Certified Authentic' }
          ].map((badge, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[#333333]/60">
              <span className="text-base sm:text-lg">{badge.icon}</span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                {badge.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}