import React from 'react';
import { FiAward, FiShield, FiHeart } from 'react-icons/fi';

export default function About() {
  return (
    <main
      id="about-page"
      className="min-h-screen w-full overflow-hidden bg-[#F8F8F8] px-4 py-10 font-sans text-[#333333] sm:px-6 sm:py-14 lg:px-8 lg:py-20"
    >
      <div className="mx-auto w-full max-w-6xl space-y-10 sm:space-y-14 lg:space-y-16 animate-fade-in">

        {/* Hero Heading */}
        <section className="mx-auto max-w-3xl space-y-3 text-center sm:space-y-4">
          <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1.5">
            <FiAward size={13} className="text-[#D4AF37]" />
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#8A6D16] sm:text-[10px]">
              Our Heritage
            </span>
          </div>

          <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-[#1A1A3A] sm:text-4xl md:text-5xl">
            The Luxe Story
          </h1>

          <p className="mx-auto max-w-xl text-[10px] font-bold uppercase leading-relaxed tracking-[0.16em] text-[#666666] sm:text-xs sm:tracking-wider">
            Crafting bespoke couture & premium horology since 2012
          </p>

          <div className="mx-auto h-1 w-16 rounded-full bg-gradient-to-r from-[#007A8A] via-[#D4AF37] to-[#2E3192]" />
        </section>

        {/* Heritage Image */}
        <section className="group relative overflow-hidden rounded-2xl border border-[#E0E0E0] bg-white shadow-[0_12px_40px_rgba(26,26,58,0.10)] sm:rounded-3xl">
          <div className="aspect-[4/3] w-full sm:aspect-[2/1]">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200"
              alt="Boutique Workshop"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1A1A3A]/60 via-transparent to-transparent" />

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 sm:bottom-6 sm:left-6 sm:right-6">
            <div className="rounded-xl border border-white/20 bg-[#1A1A3A]/75 px-3 py-2 text-white backdrop-blur-md sm:px-4">
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                Since 2012
              </p>
              <p className="mt-0.5 text-[10px] font-semibold sm:text-xs">
                Designed with intention
              </p>
            </div>

            <div className="hidden h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/50 bg-[#1A1A3A]/70 text-[#D4AF37] backdrop-blur-md sm:flex">
              <FiHeart size={17} />
            </div>
          </div>
        </section>

        {/* Story Content */}
        <section className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2 lg:gap-8">
          <article className="rounded-2xl border border-[#E0E0E0] bg-white p-5 shadow-sm sm:rounded-3xl sm:p-7 lg:p-8">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#007A8A]/10 text-[#007A8A]">
                <FiAward size={19} />
              </span>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#007A8A]">
                  The Craft
                </p>
                <h3 className="mt-1 font-display text-base font-bold uppercase tracking-wide text-[#1A1A3A] sm:text-lg">
                  Pure Authentic Design
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-xs leading-7 text-[#333333] sm:text-sm">
              <p>
                Luxe Store was founded with a singular purpose: to deliver
                impeccable luxury apparel directly to patrons without the
                inflated high-street showroom markups.
              </p>

              <p>
                We source ultra-premium Mongolian cashmere wools, handpicked
                full-grain Italian calfskin from Florence, and genuine Swiss
                chronograph assemblies. Each piece undergoes exhaustive visual
                inspection before receiving our wax-sealed authenticity
                certification.
              </p>
            </div>
          </article>

          <article className="rounded-2xl border border-[#E0E0E0] bg-[#1A1A3A] p-5 text-white shadow-sm sm:rounded-3xl sm:p-7 lg:p-8">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/15 text-[#D4AF37]">
                <FiShield size={19} />
              </span>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                  The Service
                </p>
                <h3 className="mt-1 font-display text-base font-bold uppercase tracking-wide text-white sm:text-lg">
                  Concierge Experience
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-xs leading-7 text-white/70 sm:text-sm">
              <p>
                To us, service is a sacred art. Our custom sizing, free regional
                priority shipping above ₹999, and easy 14-day return portal
                ensure absolute peace of mind during transactions.
              </p>

              <p>
                With fully verified 256-bit SSL encryptions, you can manage your
                shipping coordinates, check timeline charts, and chat with our
                head designer via secure channels.
              </p>
            </div>
          </article>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 overflow-hidden rounded-2xl border border-[#E0E0E0] bg-white shadow-sm sm:grid-cols-3 sm:rounded-3xl">
          <div className="border-b border-[#E0E0E0] px-5 py-6 text-center sm:border-b-0 sm:border-r sm:py-8">
            <p className="font-mono text-2xl font-black text-[#1A1A3A] sm:text-3xl">
              14k+
            </p>
            <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#666666] sm:text-[10px]">
              Patrons Served
            </p>
          </div>

          <div className="border-b border-[#E0E0E0] px-5 py-6 text-center sm:border-b-0 sm:border-r sm:py-8">
            <p className="font-mono text-2xl font-black text-[#007A8A] sm:text-3xl">
              100%
            </p>
            <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#666666] sm:text-[10px]">
              Authentic Certified
            </p>
          </div>

          <div className="px-5 py-6 text-center sm:py-8">
            <p className="font-mono text-2xl font-black text-[#D4AF37] sm:text-3xl">
              24/7
            </p>
            <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#666666] sm:text-[10px]">
              Concierge Line
            </p>
          </div>
        </section>

        {/* Bottom Brand Note */}
        <section className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[#D4AF37]" />
            <FiHeart size={14} className="text-[#D4AF37]" />
            <span className="h-px w-10 bg-[#D4AF37]" />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#666666]">
            Crafted for those who appreciate the extraordinary
          </p>
        </section>
      </div>
    </main>
  );
}