import React, { useState } from 'react';
import { FiChevronDown, FiHelpCircle } from 'react-icons/fi';

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    { q: "Are all garments certified authentic original designs?", a: "Yes. Every item sold on Luxe Store is designed, woven, and finished inside our private partner ateliers across Florence and New Delhi. Every shipment contains a unique wax-sealed authenticity certification code." },
    { q: "What is your return & exchange window?", a: "We offer a complimentary 14-day return and exchange window. Simply click 'Request Return' in your orders dashboard, and our courier agent will arrive to perform a quality check and collect the item. Sizing swaps are free." },
    { q: "Is cash on delivery (COD) supported across India?", a: "Yes. We support cash on delivery for over 18,000 pincodes across India at zero extra processing charge. Keep your cash or a banking UPI QR code ready on the day of shipment arrival." },
    { q: "Can I schedule a tailor alignment fitting?", a: "Absolutely. Patrons within Delhi NCR, Mumbai, and Bengaluru can arrange for a master tailor to visit their residence for measurements or drapery adjustment tests. Contact concierge hotline +91 98765 43210 to book." },
    { q: "Where can I find my shipment tracking ID?", a: "Once your item is dispatched via BlueDart, your unique AWB tracking ID will appear in your 'My Orders' section. You can check the live tracking timeline charts directly on our user panel." }
  ];

  return (
    <div id="faq-page" className="max-w-3xl mx-auto px-4 py-16 space-y-10 animate-fade-in text-gray-600 font-light text-sm">
      <div className="text-center space-y-3">
        <span className="text-[10px] text-primary uppercase font-bold tracking-[0.25em]">Atelier solutions</span>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-black uppercase tracking-tight">Concierge FAQ</h1>
        <p className="text-xs text-gray-400 max-w-md mx-auto uppercase tracking-wider font-bold">Frequently asked answers regarding delivery, tailor, and craftsmanship</p>
      </div>

      <div className="space-y-4 pt-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="border border-gray-100 rounded-2xl bg-white overflow-hidden shadow-xs"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full text-left p-5 flex justify-between items-center transition-colors hover:bg-slate-50/50 cursor-pointer"
              >
                <span className="font-bold text-gray-800 text-xs sm:text-sm uppercase tracking-wide flex items-center space-x-2">
                  <FiHelpCircle className="text-primary" />
                  <span>{faq.q}</span>
                </span>
                <FiChevronDown
                  className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  size={16}
                />
              </button>
              
              {isOpen && (
                <div className="p-5 border-t border-gray-50 bg-slate-50 text-xs leading-relaxed text-gray-500 font-light animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
