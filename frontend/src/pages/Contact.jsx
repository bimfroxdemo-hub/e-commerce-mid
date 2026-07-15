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
    <div id="contact-page" className="max-w-5xl mx-auto px-4 py-16 space-y-12 animate-fade-in text-gray-600 font-light text-sm">
      <div className="text-center space-y-3">
        <span className="text-[10px] text-primary uppercase font-bold tracking-[0.25em]">Concierge desk</span>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-black uppercase tracking-tight">Contact Luxe Store</h1>
        <p className="text-xs text-gray-400 max-w-md mx-auto uppercase tracking-wider font-bold">Connect with our head tailors & support managers 24/7</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact coordinates */}
        <div className="space-y-6">
          <h3 className="font-display font-bold text-black uppercase tracking-wide">Our Headquarters</h3>
          <p className="text-xs sm:text-sm leading-relaxed">Visit our flagship design studio to browse master rolls, discuss sizing adjustments with our tailors, or experience fabric drape tests.</p>

          <div className="space-y-4">
            <div className="flex items-start space-x-3.5">
              <FiMapPin className="text-primary mt-1" size={16} />
              <div>
                <span className="font-bold text-gray-700 text-xs uppercase block">Atelier Address</span>
                <p className="text-xs text-gray-500 mt-1">Luxe Atelier Plaza, DLF Emporio, Vasant Kunj, New Delhi - 110070</p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <FiPhone className="text-primary mt-1" size={16} />
              <div>
                <span className="font-bold text-gray-700 text-xs uppercase block">Concierge Hotline</span>
                <p className="text-xs text-gray-500 mt-1">+91 98765 43210</p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <FiMail className="text-primary mt-1" size={16} />
              <div>
                <span className="font-bold text-gray-700 text-xs uppercase block">Design Office Email</span>
                <p className="text-xs text-gray-500 mt-1">concierge@luxestore.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="space-y-1 text-xs">
            <label className="font-bold text-gray-700 uppercase">Patron Name</label>
            <input
              type="text"
              required
              className="w-full bg-slate-50 border border-transparent py-2.5 px-3 rounded-xl focus:outline-none focus:bg-white focus:border-primary text-xs"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-gray-700 uppercase">Email Address</label>
            <input
              type="email"
              required
              className="w-full bg-slate-50 border border-transparent py-2.5 px-3 rounded-xl focus:outline-none focus:bg-white focus:border-primary text-xs"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-gray-700 uppercase">Message</label>
            <textarea
              required
              rows={4}
              className="w-full bg-slate-50 border border-transparent py-2.5 px-3 rounded-xl focus:outline-none focus:bg-white focus:border-primary text-xs"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black hover:bg-primary text-white text-[11px] font-bold uppercase tracking-widest py-3 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Submit Message Log
          </button>

          {sent && (
            <div className="flex items-center space-x-2 text-xs text-success bg-success/5 p-2 rounded-xl animate-fade-in">
              <FiCheckCircle size={14}/>
              <span>Couture ticket logged! Our tailors will reply inside 1 hour.</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
