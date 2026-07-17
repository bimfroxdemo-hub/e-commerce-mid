import React from 'react';
import { useApp } from '../context/AppContext';

export default function Terms() {
  const { siteSettings } = useApp();

  return (
    <main
      id="terms-page"
      className="min-h-screen w-full overflow-hidden bg-[#F8F8F8] px-4 py-10 font-sans text-[#333333] sm:px-6 sm:py-14 lg:px-8 lg:py-20"
    >
      <div className="mx-auto w-full max-w-4xl space-y-8 animate-fade-in sm:space-y-10">

        {/* Header */}
        <section className="rounded-2xl border border-[#E0E0E0] bg-white p-5 shadow-sm sm:rounded-3xl sm:p-8">
          <div className="flex items-start gap-3">
            <div className="mt-1 h-10 w-1 shrink-0 rounded-full bg-gradient-to-b from-[#D4AF37] to-[#007A8A]" />

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#D4AF37] sm:text-[10px]">
                Legal & Guidelines
              </p>

              <h1 className="mt-2 font-display text-2xl font-black uppercase tracking-tight text-[#1A1A3A] sm:text-3xl md:text-4xl">
                Terms of Use
              </h1>

              <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#666666] sm:text-xs">
                Standard Client Terms & Patron Rules
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <article className="rounded-2xl border border-[#E0E0E0] bg-white p-5 shadow-sm sm:rounded-3xl sm:p-8 lg:p-10">
          <div className="space-y-6 text-xs leading-7 text-[#333333] sm:text-sm">

            <div className="rounded-2xl border border-[#007A8A]/20 bg-[#007A8A]/5 p-4 sm:p-5">
              <p className="leading-7 text-[#333333]">
                {siteSettings.terms}
              </p>
            </div>

            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/15 text-xs font-black text-[#8A6D16]">
                  01
                </span>

                <h3 className="font-display text-xs font-black uppercase tracking-wider text-[#1A1A3A] sm:text-sm">
                  Authentic Certified Designs
                </h3>
              </div>

              <p className="pl-0 text-[#333333] sm:pl-11">
                Luxe Store represents that all products sold on our platform are
                original, luxury design pieces. All measurements, fabrics,
                specifications, wool percentages, leather grade calfskin and gold
                casings are entirely accurate as described.
              </p>
            </section>

            <div className="h-px bg-[#E0E0E0]" />

            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#007A8A]/10 text-xs font-black text-[#007A8A]">
                  02
                </span>

                <h3 className="font-display text-xs font-black uppercase tracking-wider text-[#1A1A3A] sm:text-sm">
                  Billing & Verified UPI
                </h3>
              </div>

              <p className="pl-0 text-[#333333] sm:pl-11">
                By placing an order, you certify that you have the authorization
                to perform transactions with the specified payment coordinates.
                Unverified or suspicious billing activities may be blocked
                instantly from accessing our services.
              </p>
            </section>

            <div className="rounded-2xl border border-[#D4AF37]/25 bg-[#D4AF37]/10 p-4 sm:ml-11 sm:p-5">
              <p className="text-[10px] font-bold uppercase leading-relaxed tracking-wider text-[#8A6D16] sm:text-xs">
                Last Updated: July 06, 2026
              </p>

              <p className="mt-1 text-[10px] leading-relaxed text-[#666666] sm:text-xs">
                Certified by Luxe Atelier Plaza Legal Department.
              </p>
            </div>
          </div>
        </article>

        {/* Footer Note */}
        <div className="text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#666666] sm:text-[10px]">
            Kabiraaz Fashion · Your trust, our responsibility
          </p>
        </div>
      </div>
    </main>
  );
}