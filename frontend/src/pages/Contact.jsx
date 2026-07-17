import React, { useState } from 'react';
import { FiPhone, FiMail, FiMapPin, FiCheckCircle } from 'react-icons/fi';

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (name && email) {
      setSent(true);
      setName("");
      setEmail("");
      setMsg("");

      setTimeout(() => setSent(false), 5000);
    }
  };

  return (
    <main
      id="contact-page"
      className="min-h-screen w-full overflow-hidden bg-[#F8F8F8] px-4 py-10 font-sans text-[#333333] sm:px-6 sm:py-14 lg:px-8 lg:py-20"
    >
      <div className="mx-auto w-full max-w-6xl space-y-10 animate-fade-in sm:space-y-14">

        {/* Header */}
        <section className="mx-auto max-w-3xl space-y-3 text-center sm:space-y-4">
          <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1.5">
            <FiMail size={13} className="text-[#D4AF37]" />

            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#8A6D16] sm:text-[10px]">
              Concierge Desk
            </span>
          </div>

          <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-[#1A1A3A] sm:text-4xl md:text-5xl">
            Contact Kabiraaz Fashion
          </h1>

          <p className="mx-auto max-w-xl text-[10px] font-bold uppercase leading-relaxed tracking-[0.16em] text-[#666666] sm:text-xs sm:tracking-wider">
            Connect with our head tailors & support managers 24/7
          </p>

          <div className="mx-auto h-1 w-16 rounded-full bg-gradient-to-r from-[#007A8A] via-[#D4AF37] to-[#2E3192]" />
        </section>

        {/* Content */}
        <section className="grid grid-cols-1 gap-5 sm:gap-7 lg:grid-cols-2 lg:gap-10">

          {/* Contact Information */}
          <div className="rounded-2xl border border-[#E0E0E0] bg-white p-5 shadow-sm sm:rounded-3xl sm:p-7 lg:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#007A8A]/10 text-[#007A8A]">
                <FiMapPin size={20} />
              </span>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#007A8A]">
                  Visit Us
                </p>

                <h3 className="mt-1 font-display text-base font-bold uppercase tracking-wide text-[#1A1A3A] sm:text-lg">
                  Our Headquarters
                </h3>
              </div>
            </div>

            <p className="text-xs leading-7 text-[#333333] sm:text-sm">
              Visit our flagship design studio to browse master rolls, discuss sizing
              adjustments with our tailors, or experience fabric drape tests.
            </p>

            <div className="mt-7 space-y-4">
              {/* Address */}
              <div className="flex items-start gap-3.5 rounded-2xl border border-[#E0E0E0] bg-[#F8F8F8] p-4 transition-colors hover:border-[#007A8A]/40">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#007A8A]/10 text-[#007A8A]">
                  <FiMapPin size={16} />
                </span>

                <div className="min-w-0">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-[#1A1A3A]">
                    Atelier Address
                  </span>

                  <p className="mt-1 text-xs leading-relaxed text-[#666666]">
                    Luxe Atelier Plaza, DLF Emporio, Vasant Kunj, New Delhi - 110070
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3.5 rounded-2xl border border-[#E0E0E0] bg-[#F8F8F8] p-4 transition-colors hover:border-[#007A8A]/40">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/15 text-[#D4AF37]">
                  <FiPhone size={16} />
                </span>

                <div>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-[#1A1A3A]">
                    Concierge Hotline
                  </span>

                  <p className="mt-1 text-xs text-[#666666]">
                    +91 98765 43210
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3.5 rounded-2xl border border-[#E0E0E0] bg-[#F8F8F8] p-4 transition-colors hover:border-[#007A8A]/40">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2E3192]/10 text-[#2E3192]">
                  <FiMail size={16} />
                </span>

                <div className="min-w-0">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-[#1A1A3A]">
                    Design Office Email
                  </span>

                  <p className="mt-1 break-all text-xs text-[#666666]">
                    concierge@luxestore.com
                  </p>
                </div>
              </div>
            </div>

            {/* Support Note */}
            <div className="mt-6 rounded-2xl border border-[#D4AF37]/25 bg-gradient-to-r from-[#D4AF37]/10 to-[#007A8A]/5 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A6D16]">
                Premium Support
              </p>

              <p className="mt-1 text-xs leading-relaxed text-[#666666]">
                Our concierge team is available to assist you with styling,
                sizing and order-related queries.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-[#E0E0E0] bg-white p-5 shadow-sm sm:rounded-3xl sm:p-7 lg:p-8"
          >
            <div className="mb-6">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                Send a Message
              </p>

              <h3 className="mt-1 font-display text-base font-bold uppercase tracking-wide text-[#1A1A3A] sm:text-lg">
                How Can We Help?
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-[#666666]">
                Share your requirements with us and our concierge team will get
                back to you shortly.
              </p>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A3A]">
                  Patron Name
                </label>

                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-[#E0E0E0] bg-[#F8F8F8] px-3.5 py-3 text-xs text-[#1A1A3A] outline-none transition-all placeholder:text-[#666666] focus:border-[#007A8A] focus:bg-white focus:ring-2 focus:ring-[#007A8A]/10 sm:text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A3A]">
                  Email Address
                </label>

                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  className="w-full rounded-xl border border-[#E0E0E0] bg-[#F8F8F8] px-3.5 py-3 text-xs text-[#1A1A3A] outline-none transition-all placeholder:text-[#666666] focus:border-[#007A8A] focus:bg-white focus:ring-2 focus:ring-[#007A8A]/10 sm:text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A3A]">
                  Message
                </label>

                <textarea
                  required
                  rows={5}
                  placeholder="Tell us how we can assist you..."
                  className="w-full resize-y rounded-xl border border-[#E0E0E0] bg-[#F8F8F8] px-3.5 py-3 text-xs leading-relaxed text-[#1A1A3A] outline-none transition-all placeholder:text-[#666666] focus:border-[#007A8A] focus:bg-white focus:ring-2 focus:ring-[#007A8A]/10 sm:text-sm"
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full rounded-xl bg-[#D4AF37] py-3.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#1A1A3A] shadow-sm transition-all hover:bg-[#B8941F] hover:shadow-md active:scale-[0.99] sm:text-[11px]"
              >
                Submit Message
              </button>

              {/* Success Message */}
              {sent && (
                <div className="flex items-start gap-2 rounded-xl border border-[#007A8A]/20 bg-[#007A8A]/5 p-3 text-xs text-[#007A8A] animate-fade-in">
                  <FiCheckCircle size={15} className="mt-0.5 shrink-0" />

                  <span>
                    Couture ticket logged! Our tailors will reply inside 1 hour.
                  </span>
                </div>
              )}
            </div>
          </form>
        </section>

        {/* Bottom Trust Strip */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-2xl border border-[#E0E0E0] bg-white p-4 text-center shadow-sm">
            <FiPhone className="mx-auto mb-2 text-[#D4AF37]" size={18} />
            <p className="text-[9px] font-bold uppercase tracking-wider text-[#1A1A3A]">
              24/7 Concierge
            </p>
          </div>

          <div className="rounded-2xl border border-[#E0E0E0] bg-white p-4 text-center shadow-sm">
            <FiMail className="mx-auto mb-2 text-[#007A8A]" size={18} />
            <p className="text-[9px] font-bold uppercase tracking-wider text-[#1A1A3A]">
              Fast Response
            </p>
          </div>

          <div className="rounded-2xl border border-[#E0E0E0] bg-white p-4 text-center shadow-sm">
            <FiCheckCircle className="mx-auto mb-2 text-[#2E3192]" size={18} />
            <p className="text-[9px] font-bold uppercase tracking-wider text-[#1A1A3A]">
              Dedicated Support
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}