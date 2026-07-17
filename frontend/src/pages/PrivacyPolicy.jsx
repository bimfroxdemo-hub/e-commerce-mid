import React from 'react';
import { useApp } from '../context/AppContext';
import {
  FiShield,
  FiLock,
  FiDatabase,
  FiCheckCircle,
  FiAlertCircle
} from "react-icons/fi";

import { FaCookieBite } from "react-icons/fa6";

export default function PrivacyPolicy() {
  const { siteSettings } = useApp();
  
  return (
    <div id="privacy-page" className="min-h-screen bg-gradient-to-br from-[#F8F8F8] via-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 space-y-8 sm:space-y-12 animate-fade-in">
        
        {/* Header Section */}
        <div className="text-center space-y-4 sm:space-y-6">
          {/* Icon Badge */}
          <div className="inline-flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#007A8A] to-[#2E3192] rounded-full blur-xl opacity-30"></div>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#007A8A] to-[#2E3192] rounded-full flex items-center justify-center shadow-xl shadow-[#007A8A]/30">
                <FiShield size={32} className="text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2 sm:space-y-3">
            <div className="inline-flex items-center justify-center">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-[#007A8A]/10 to-[#2E3192]/10 border border-[#007A8A]/20 rounded-full">
                <FiLock size={12} className="text-[#007A8A]" />
                <span className="text-[9px] sm:text-[10px] text-[#007A8A] uppercase font-black tracking-[0.25em]">
                  Legal Document
                </span>
              </span>
            </div>
            
            <h1 className="font-black text-3xl sm:text-4xl lg:text-5xl text-[#1A1A3A] uppercase tracking-tight leading-tight">
              Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007A8A] to-[#2E3192]">Policy</span>
            </h1>
            
            <p className="text-[10px] sm:text-xs text-[#333333]/60 max-w-2xl mx-auto uppercase tracking-wider font-bold px-4">
              Kabiraaz Fashion Privacy Standards & Encryption Regulations
            </p>
          </div>

          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="w-12 sm:w-16 h-px bg-gradient-to-r from-transparent to-[#007A8A]"></div>
            <div className="w-2 h-2 bg-[#D4AF37] rounded-full"></div>
            <div className="w-12 sm:w-16 h-px bg-gradient-to-l from-transparent to-[#007A8A]"></div>
          </div>
        </div>

        {/* Introduction Card */}
        <div className="bg-gradient-to-br from-white to-[#007A8A]/5 border border-[#007A8A]/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg shadow-[#007A8A]/10">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#007A8A] to-[#2E3192] rounded-xl flex items-center justify-center shadow-lg shadow-[#007A8A]/30">
              <FiCheckCircle size={20} className="text-white" />
            </div>
            <div className="flex-1 space-y-3">
              <h2 className="font-black text-sm sm:text-base text-[#1A1A3A] uppercase tracking-wide">
                Our Commitment to Your Privacy
              </h2>
              <p className="text-xs sm:text-sm text-[#333333]/80 leading-relaxed font-normal">
                Kabiraaz Fashion values your absolute privacy. We store encryption tokens client-side and never sell consumer metrics. Our policy complies with GDPR and localized Indian Data Protection regulations.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="space-y-6 sm:space-y-8">
          
          {/* Section 1: Collection of Transaction Metrics */}
          <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="bg-gradient-to-r from-[#1A1A3A] to-[#2E3192] px-6 sm:px-8 py-4 sm:py-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#D4AF37]/20 rounded-xl flex items-center justify-center">
                  <FiDatabase size={18} className="text-[#D4AF37]" />
                </div>
                <h3 className="font-black text-xs sm:text-sm text-white uppercase tracking-wider">
                  1. Collection of Transaction Metrics
                </h3>
              </div>
            </div>
            <div className="p-6 sm:p-8 space-y-4">
              <p className="text-xs sm:text-sm text-[#333333]/80 leading-relaxed font-normal">
                To deliver high-end cashmere garments and customized chronographs, we require specific coordinates (your shipping address, full name, email address, phone contact). Secure biometric financial details are handled solely by PCI-DSS compliant gateways like Stripe, Paytm, or BHIM.
              </p>
              
              {/* Data Points List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  'Shipping Address',
                  'Full Name',
                  'Email Address',
                  'Phone Number',
                  'Payment Gateway Data',
                  'Order History'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-[#333333]/70">
                    <div className="w-1.5 h-1.5 bg-[#007A8A] rounded-full"></div>
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Cookies & Client-Side Cache */}
          <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="bg-gradient-to-r from-[#1A1A3A] to-[#2E3192] px-6 sm:px-8 py-4 sm:py-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#D4AF37]/20 rounded-xl flex items-center justify-center">
                  <FaCookieBite size={18} className="text-[#D4AF37]" />
                </div>
                <h3 className="font-black text-xs sm:text-sm text-white uppercase tracking-wider">
                  2. Cookies & Client-Side Cache
                </h3>
              </div>
            </div>
            <div className="p-6 sm:p-8 space-y-4">
              <p className="text-xs sm:text-sm text-[#333333]/80 leading-relaxed font-normal">
                We use local storage (client-side cache) to remember items inside your shopping bag, wishlist saves, and recent query parameters. This maximizes load speed and eliminates latency.
              </p>

              {/* Cookie Types */}
              <div className="bg-gradient-to-br from-slate-50 to-[#007A8A]/5 border border-[#007A8A]/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-3">
                <p className="text-[10px] sm:text-xs font-black text-[#1A1A3A] uppercase tracking-wider">
                  What We Store Locally:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { label: 'Shopping Cart Items', desc: 'Temporary storage of selected products' },
                    { label: 'Wishlist Preferences', desc: 'Saved items for future purchase' },
                    { label: 'Session Tokens', desc: 'Encrypted authentication data' },
                    { label: 'UI Preferences', desc: 'Theme and language settings' }
                  ].map((cookie, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-5 h-5 bg-[#007A8A]/10 rounded-lg flex items-center justify-center mt-0.5">
                        <div className="w-1.5 h-1.5 bg-[#007A8A] rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-[#1A1A3A]">{cookie.label}</p>
                        <p className="text-[10px] text-[#333333]/60 mt-0.5">{cookie.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Security Commitment Card */}
          <div className="bg-gradient-to-br from-[#1A1A3A] to-[#2E3192] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl shadow-[#1A1A3A]/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-[#D4AF37]/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FiShield size={24} className="text-[#D4AF37]" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-black text-sm sm:text-base text-white uppercase tracking-wide">
                  Bank-Level Security Encryption
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  All sensitive data is encrypted using AES-256 encryption standard. Your payment information never touches our servers.
                </p>
              </div>
            </div>
          </div>

          {/* Compliance Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: '🔒', label: 'SSL Certified', desc: 'Secure Connection' },
              { icon: '✓', label: 'GDPR Compliant', desc: 'EU Standards' },
              { icon: '🇮🇳', label: 'DPDP Act 2023', desc: 'Indian Law' },
              { icon: '💳', label: 'PCI-DSS', desc: 'Payment Security' }
            ].map((badge, idx) => (
              <div key={idx} className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl p-4 text-center hover:shadow-md hover:border-[#007A8A]/20 transition-all duration-300">
                <div className="text-2xl sm:text-3xl mb-2">{badge.icon}</div>
                <p className="text-[10px] sm:text-xs font-black text-[#1A1A3A] uppercase tracking-wide mb-1">
                  {badge.label}
                </p>
                <p className="text-[9px] text-[#333333]/60 font-medium">
                  {badge.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Last Updated Footer */}
        <div className="border-t border-gray-100 pt-6 sm:pt-8">
          <div className="bg-gradient-to-r from-slate-50 to-[#007A8A]/5 border border-[#007A8A]/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 bg-[#007A8A]/10 rounded-lg flex items-center justify-center">
                  <FiAlertCircle size={16} className="text-[#007A8A]" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-black text-[#1A1A3A] uppercase tracking-wider mb-1">
                    Document Information
                  </p>
                  <p className="text-[10px] sm:text-xs text-[#333333]/70 font-medium">
                    Last Updated: <span className="font-bold text-[#007A8A]">July 06, 2026</span>
                  </p>
                  <p className="text-[9px] text-[#333333]/60 mt-1">
                    Certified by Kabiraaz Fashion Security Compliance Node
                  </p>
                </div>
              </div>

              <a
                href="#contact"
                className="w-full sm:w-auto bg-gradient-to-r from-[#007A8A] to-[#2E3192] hover:from-[#2E3192] hover:to-[#007A8A] text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-lg shadow-[#007A8A]/30 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <FiShield size={14} />
                Report Privacy Concern
              </a>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="text-center space-y-4 pt-6 sm:pt-8">
          <p className="text-xs sm:text-sm font-bold text-[#1A1A3A] uppercase tracking-wider">
            Questions About Our Privacy Policy?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-[#333333]/70">
            <a href="mailto:privacy@kabiraaz.com" className="flex items-center gap-2 hover:text-[#007A8A] transition-colors">
              <span>📧</span>
              <span className="font-medium">privacy@kabiraaz.com</span>
            </a>
            <span className="hidden sm:inline text-gray-300">|</span>
            <a href="tel:+919876543210" className="flex items-center gap-2 hover:text-[#007A8A] transition-colors">
              <span>📞</span>
              <span className="font-medium">+91 98765 43210</span>
            </a>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-6 border-t border-gray-100">
          {[
            { icon: '🔐', text: 'Encrypted Storage' },
            { icon: '🚫', text: 'No Data Selling' },
            { icon: '✓', text: 'GDPR Compliant' },
            { icon: '🛡️', text: 'Secure Checkout' }
          ].map((trust, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[#333333]/60">
              <span className="text-base sm:text-lg">{trust.icon}</span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                {trust.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}