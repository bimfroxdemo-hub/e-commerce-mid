import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import AtelierReels from '../components/AtelierReels';
import {
  FiChevronLeft,
  FiChevronRight,
  FiStar,
  FiArrowRight,
  FiShield,
  FiTruck,
  FiRefreshCw,
  FiAward,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home({ onNavigate, onQuickView }) {
  const {
    products = [],
    categories = [],
    recentlyViewed = [],
    siteSettings = {},
  } = useApp();

  const [heroIndex, setHeroIndex] = useState(0);

  const heroSlides = [
    {
      title: siteSettings.heroTitle || 'Modern Luxury Fashion',
      subtitle: siteSettings.heroSubtitle || 'NEW SEASON 2026',
      desc: siteSettings.heroDescription || 'Premium outfits designed for modern lifestyle.',
      image:
        siteSettings.heroImage ||
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop',
      btnText: 'Shop Collection',
      btnAction: () => onNavigate('shop'),
    },
    {
      title: siteSettings.slide2Title || 'Hand-Burnished Italian Leather',
      subtitle: siteSettings.slide2Subtitle || 'MASTER CRAFTSMANSHIP',
      desc: siteSettings.slide2Description || 'Florence-inspired full-grain leather jackets.',
      image:
        siteSettings.slide2Image ||
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
      btnText: 'Explore Collection',
      btnAction: () =>
        onNavigate('shop', {
          category: siteSettings.slide2Category || 'Men',
        }),
    },
    {
      title: siteSettings.slide3Title || 'Mulberry Silk Couture',
      subtitle: siteSettings.slide3Subtitle || 'SEASONAL EDIT',
      desc: siteSettings.slide3Description || 'Flowing silhouettes crafted from premium silks.',
      image:
        siteSettings.slide3Image ||
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop',
      btnText: 'View Collection',
      btnAction: () =>
        onNavigate('shop', {
          category: siteSettings.slide3Category || 'Women',
        }),
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const handlePrevSlide = () => {
    setHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleNextSlide = () => {
    setHeroIndex((prev) => (prev + 1) % heroSlides.length);
  };

  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 15,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return {
            ...prev,
            seconds: prev.seconds - 1,
          };
        }

        if (prev.minutes > 0) {
          return {
            ...prev,
            minutes: prev.minutes - 1,
            seconds: 59,
          };
        }

        if (prev.hours > 0) {
          return {
            hours: prev.hours - 1,
            minutes: 59,
            seconds: 59,
          };
        }

        return {
          hours: 12,
          minutes: 0,
          seconds: 0,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const featuredProducts = products
    .filter((p) => (p.tags || []).includes('featured'))
    .slice(0, 4);

  const trendingProducts = products
    .filter((p) => (p.tags || []).includes('trending'))
    .slice(0, 4);

  const todaysDeals = products
    .filter((p) => (p.tags || []).includes('deal'))
    .slice(0, 4);

  const bestSellers = products
    .filter((p) => (p.tags || []).includes('best-seller'))
    .slice(0, 4);

  return (
    <div id="home-page-container" className="bg-bg-base space-y-16 pb-16 transition-all duration-300">
      {/* 1. Hero Slider Section */}
      <section id="hero-slider" className="relative h-[650px] overflow-hidden bg-black flex items-center">
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.65, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${heroSlides[heroIndex].image})`,
              }}
            />
          </AnimatePresence>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 text-white flex flex-col items-center text-center">
          <motion.p
            key={`sub-${heroIndex}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-secondary mb-3"
          >
            {heroSlides[heroIndex].subtitle}
          </motion.p>

          <motion.h1
            key={`title-${heroIndex}`}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight font-display mb-6 uppercase"
          >
            {heroSlides[heroIndex].title}
          </motion.h1>

          <motion.p
            key={`desc-${heroIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm sm:text-lg text-gray-200 max-w-xl mx-auto mb-8 font-light"
          >
            {heroSlides[heroIndex].desc}
          </motion.p>

          <motion.div
            key={`btn-${heroIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex space-x-4 justify-center"
          >
            <button
              onClick={heroSlides[heroIndex].btnAction}
              className="bg-white text-black hover:bg-primary hover:text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-lg cursor-pointer hover:scale-105"
            >
              {heroSlides[heroIndex].btnText}
            </button>

            <button
              onClick={() => onNavigate('shop')}
              className="border border-white/60 bg-white/10 hover:bg-white/20 text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-sm transition-all cursor-pointer"
            >
              Explore Collection
            </button>
          </motion.div>
        </div>

        <button
          onClick={handlePrevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white text-white hover:text-black p-3 rounded-full backdrop-blur-xs transition-all z-20 cursor-pointer hidden md:block"
        >
          <FiChevronLeft size={18} />
        </button>

        <button
          onClick={handleNextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white text-white hover:text-black p-3 rounded-full backdrop-blur-xs transition-all z-20 cursor-pointer hidden md:block"
        >
          <FiChevronRight size={18} />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setHeroIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === heroIndex ? 'w-8 bg-white' : 'w-2 bg-white/45'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 2. Brand Value Props Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative bg-gradient-to-br from-white via-white to-slate-50/50 rounded-3xl p-6 md:p-8 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100/80 backdrop-blur-sm overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gradient-to-tr from-orange-100/30 to-pink-100/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                icon: <FiTruck size={22} />,
                title: 'Complimentary Delivery',
                desc: 'Free shipping across India above ₹999.',
                iconColor: 'text-blue-600',
                iconBg: 'bg-gradient-to-br from-blue-50 to-blue-100/70',
                glow: 'group-hover:shadow-blue-200/60',
                accent: 'from-blue-500/0 via-blue-500/70 to-blue-500/0',
              },
              {
                icon: <FiAward size={22} />,
                title: 'Elite Craft Guarantee',
                desc: '100% certified authentic premium design.',
                iconColor: 'text-orange-500',
                iconBg: 'bg-gradient-to-br from-orange-50 to-amber-100/70',
                glow: 'group-hover:shadow-orange-200/60',
                accent: 'from-orange-500/0 via-orange-500/70 to-orange-500/0',
              },
              {
                icon: <FiRefreshCw size={22} />,
                title: 'Concierge Return Policy',
                desc: 'Easy 14-day premium return portal.',
                iconColor: 'text-emerald-600',
                iconBg: 'bg-gradient-to-br from-emerald-50 to-green-100/70',
                glow: 'group-hover:shadow-emerald-200/60',
                accent: 'from-emerald-500/0 via-emerald-500/70 to-emerald-500/0',
              },
              {
                icon: <FiShield size={22} />,
                title: '256-bit Encrypted SSL',
                desc: 'Completely secure biometric payment gate.',
                iconColor: 'text-purple-600',
                iconBg: 'bg-gradient-to-br from-purple-50 to-violet-100/70',
                glow: 'group-hover:shadow-purple-200/60',
                accent: 'from-purple-500/0 via-purple-500/70 to-purple-500/0',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 rounded-2xl transition-all duration-500 hover:bg-white/80 cursor-pointer"
              >
                <div
                  className={`absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-gradient-to-r ${item.accent} group-hover:w-3/4 transition-all duration-500 rounded-full`}
                />

                <div className="relative flex-shrink-0">
                  <div
                    className={`absolute inset-0 ${item.iconBg} rounded-2xl blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-500`}
                  />
                  <div
                    className={`relative p-3.5 ${item.iconBg} rounded-2xl shadow-sm ${item.glow} group-hover:shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6`}
                  >
                    <div className={`${item.iconColor} transition-transform duration-500 group-hover:rotate-6`}>
                      {item.icon}
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] md:text-xs font-bold text-gray-800 uppercase tracking-wider leading-snug group-hover:text-gray-900 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed group-hover:text-gray-600 transition-colors">
                    {item.desc}
                  </p>
                </div>

                {idx < 3 && (
                  <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 h-10 w-px bg-gradient-to-b from-transparent via-gray-200/80 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Browse Premium Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="h-[2px] w-8 bg-gradient-to-r from-primary to-transparent" />
              <span className="text-[10px] text-primary uppercase font-bold tracking-[0.25em]">
                Explore Ateliers
              </span>
            </div>

            <h2 className="font-display font-extrabold text-2xl md:text-3xl text-black mt-2 uppercase tracking-tight">
              Shop By Category
            </h2>
          </div>

          <button
            onClick={() => onNavigate('shop')}
            className="group relative text-xs font-bold text-primary flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
          >
            <span>Browse All Categories</span>
            <FiArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-5">
          {categories.map((cat, idx) => (
            <div
              key={cat.id || cat._id || idx}
              onClick={() => onNavigate('shop', { category: cat.slug || cat.name })}
              className="group relative bg-white rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 aspect-[4/5]"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="absolute inset-0 rounded-2xl md:rounded-3xl ring-1 ring-inset ring-gray-100 group-hover:ring-2 group-hover:ring-primary/30 transition-all duration-500 z-20 pointer-events-none" />

              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={
                    cat.image ||
                    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600'
                  }
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
              </div>

              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/0 group-hover:from-black/90 transition-all duration-500" />

              <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <span className="text-[8px] font-bold text-white bg-white/20 backdrop-blur-md px-2 py-1 rounded-full border border-white/30">
                  NEW
                </span>
              </div>

              <div className="absolute inset-0 flex flex-col justify-end p-4 text-white z-20">
                <div className="h-[2px] w-8 bg-primary mb-2 group-hover:w-12 transition-all duration-500" />

                <h3 className="font-display font-bold text-sm md:text-base tracking-wider uppercase leading-tight group-hover:translate-x-1 transition-transform duration-300">
                  {cat.name}
                </h3>

                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-[9px] md:text-[10px] text-gray-300 font-medium">
                    {cat.productCount || 0} Premium Items
                  </p>

                  <div className="w-6 h-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 border border-white/20">
                    <FiArrowRight size={10} className="text-white" />
                  </div>
                </div>
              </div>

              <div className="absolute top-0 left-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
                <div className="absolute top-3 left-3 w-4 h-[1.5px] bg-white/60" />
                <div className="absolute top-3 left-3 w-[1.5px] h-4 bg-white/60" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FLASH SALE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-hidden">
        <div className="relative bg-[#0a0a0a] text-white rounded-[2rem] overflow-hidden shadow-2xl border border-white/5">
          <div className="absolute -top-40 -right-20 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[130px]" />
          <div className="absolute -bottom-40 left-1/4 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[130px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]" />

          <div className="relative z-10 border-b border-white/10 overflow-hidden py-2.5 bg-white/[0.02]">
            <div className="flex whitespace-nowrap animate-marquee">
              {Array(2)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center gap-8 px-4" />
                ))}
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 p-8 sm:p-10 lg:p-14 items-center min-h-[600px]">
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left z-20">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-secondary opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-secondary" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">
                  Flash Sale · Ends Tonight
                </span>
              </div>

              <h2 className="font-display font-extrabold text-4xl sm:text-6xl uppercase tracking-tight leading-[0.95]">
                The Outlet
                <br />
                <span className="text-secondary">Vault</span>
              </h2>

              <p className="text-sm text-gray-400 font-light max-w-md mx-auto lg:mx-0">
                Elite access to limited run collections. Get up to{' '}
                <span className="text-white font-medium">40% off</span> the entire vault.
              </p>

              <div className="flex items-center justify-center lg:justify-start gap-3">
                {[
                  { label: 'HRS', val: timeLeft.hours },
                  { label: 'MIN', val: timeLeft.minutes },
                  { label: 'SEC', val: timeLeft.seconds },
                ].map((t, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="bg-white text-black rounded-xl w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-2xl font-bold font-mono">
                      {String(t.val).padStart(2, '0')}
                    </div>
                    <span className="text-[9px] uppercase text-gray-500 font-bold mt-2">
                      {t.label}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onNavigate('shop', { filter: 'deal' })}
                className="bg-secondary text-white text-xs font-bold uppercase tracking-[0.15em] px-9 py-4 rounded-full flex items-center gap-2 mx-auto lg:mx-0 hover:scale-105 transition-all"
              >
                Shop The Vault <FiArrowRight />
              </button>
            </div>

            <div className="lg:col-span-6 relative h-[450px] sm:h-[550px] flex items-center justify-center">
              <div className="absolute w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full border border-dashed border-white/10 animate-[spin_30s_linear_infinite]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="animate-[spin_30s_linear_infinite_reverse] flex flex-col items-center group cursor-pointer">
                    <div className="relative">
                      <img
                        src="https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=200"
                        alt="Women"
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-white/20 object-cover shadow-2xl group-hover:scale-110 transition-transform"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-secondary text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                        -40%
                      </div>
                    </div>
                    <span className="mt-2 bg-black/80 px-2 py-0.5 rounded-full text-[8px] font-bold text-white tracking-widest">
                      WOMEN
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                  <div className="animate-[spin_30s_linear_infinite_reverse] flex flex-col items-center group cursor-pointer">
                    <div className="relative">
                      <img
                        src="https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=200"
                        alt="Kids"
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-white/20 object-cover shadow-2xl group-hover:scale-110 transition-transform"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-secondary text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                        -30%
                      </div>
                    </div>
                    <span className="mt-2 bg-black/80 px-2 py-0.5 rounded-full text-[8px] font-bold text-white tracking-widest">
                      KIDS
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] rounded-full border border-white/5 animate-[spin_20s_linear_infinite_reverse]">
                <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2">
                  <div className="animate-[spin_20s_linear_infinite] flex flex-col items-center group cursor-pointer">
                    <div className="relative">
                      <img
                        src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=200"
                        alt="Men"
                        className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 border-white/20 object-cover shadow-2xl group-hover:scale-110 transition-transform"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-secondary text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                        -40%
                      </div>
                    </div>
                    <span className="mt-2 bg-black/80 px-2 py-0.5 rounded-full text-[8px] font-bold text-white tracking-widest">
                      MEN
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 w-32 h-32 sm:w-44 sm:h-44 rounded-full bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl border border-white/20 flex flex-col items-center justify-center shadow-2xl">
                <p className="text-[10px] uppercase tracking-widest text-gray-300">UP TO</p>
                <div className="flex items-start">
                  <span className="text-5xl sm:text-7xl font-display font-black text-secondary">40</span>
                  <span className="text-2xl font-bold text-secondary mt-2">%</span>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-gray-300">OFF VAULT</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Today's Deals Section */}
      {todaysDeals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div>
            <span className="text-[10px] text-primary uppercase font-bold tracking-[0.2em]">
              Exclusive Markdown
            </span>
            <h2 className="font-display font-extrabold text-2xl text-black mt-1 uppercase">
              Today's Luxury Deals
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {todaysDeals.map((item) => (
              <ProductCard
                key={item.id || item._id}
                product={item}
                onNavigate={onNavigate}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div>
            <span className="text-[10px] text-primary uppercase font-bold tracking-[0.2em]">
              Handpicked Masterpieces
            </span>
            <h2 className="font-display font-extrabold text-2xl text-black mt-1 uppercase">
              Featured Collection
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((item) => (
              <ProductCard
                key={item.id || item._id}
                product={item}
                onNavigate={onNavigate}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        </section>
      )}

      {/* 7. Premium Glassmorphism Banners */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="relative rounded-3xl overflow-hidden h-[420px] group">
            <img
              src="https://media.istockphoto.com/id/1293366109/photo/this-one-match-perfect-with-me.webp?a=1&b=1&s=612x612&w=0&k=20&c=e0bOeR004rMmcAvXUYAIiJZJ01pgAFX7ThFqfzyvMac="
              alt="Men's Collection"
              className="absolute inset-0 w-full h-full object-cover brightness-90 group-hover:scale-105 transition-transform duration-1000"
            />

            <div className="absolute inset-6 bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-8 flex flex-col justify-between group-hover:bg-black/30 transition-all duration-500">
              <div className="inline-flex w-fit">
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">
                  ✦ Exclusive
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-display font-black text-4xl text-white uppercase leading-none">
                    Italian
                    <br />
                    Leather
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Timeless pieces crafted by artisans with 75+ years of expertise
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold px-3 py-1.5 rounded-full border border-white/30">
                    Handcrafted
                  </span>
                  <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold px-3 py-1.5 rounded-full border border-white/30">
                    Full-Grain
                  </span>
                  <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold px-3 py-1.5 rounded-full border border-white/30">
                    Lifetime Warranty
                  </span>
                </div>

                <button
                  onClick={() => onNavigate('shop', { category: 'Men' })}
                  className="w-full bg-white hover:bg-amber-400 text-black font-bold py-4 rounded-2xl uppercase text-sm tracking-wider transition-all duration-300 hover:scale-[1.03] shadow-2xl"
                >
                  Shop Men's Collection →
                </button>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden h-[420px] group">
            <img
              src="https://images.unsplash.com/photo-1593010932917-92bd21088dee?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d29tYW4lMjBmYXNodGlvbnxlbnwwfHwwfHx8MA%3D%3D"
              alt="Women's Collection"
              className="absolute inset-0 w-full h-full object-cover brightness-110 group-hover:scale-105 transition-transform duration-1000"
            />

            <div className="absolute inset-6 bg-white/25 backdrop-blur-2xl border border-white/30 rounded-2xl p-8 flex flex-col justify-between group-hover:bg-white/35 transition-all duration-500">
              <div className="inline-flex w-fit">
                <span className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">
                  ✦ New Season
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-display font-black text-4xl text-slate-900 uppercase leading-none">
                    Pure
                    <br />
                    Cashmere
                  </h3>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    The softest fibers from the Himalayas, woven into luxury
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="bg-slate-900/20 backdrop-blur-sm text-slate-900 text-[10px] font-semibold px-3 py-1.5 rounded-full border border-slate-900/30">
                    Ultra-Soft
                  </span>
                  <span className="bg-slate-900/20 backdrop-blur-sm text-slate-900 text-[10px] font-semibold px-3 py-1.5 rounded-full border border-slate-900/30">
                    Sustainable
                  </span>
                  <span className="bg-slate-900/20 backdrop-blur-sm text-slate-900 text-[10px] font-semibold px-3 py-1.5 rounded-full border border-slate-900/30">
                    Limited Edition
                  </span>
                </div>

                <button
                  onClick={() => onNavigate('shop', { category: 'Women' })}
                  className="w-full bg-slate-900 hover:bg-rose-600 text-white font-bold py-4 rounded-2xl uppercase text-sm tracking-wider transition-all duration-300 hover:scale-[1.03] shadow-2xl"
                >
                  Shop Women's Collection →
                </button>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden h-[420px] group">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80"
              alt="Kids Collection"
              className="absolute inset-0 w-full h-full object-cover brightness-95 group-hover:scale-105 transition-transform duration-1000"
            />

            <div className="absolute inset-6 bg-black/25 backdrop-blur-2xl border border-white/25 rounded-2xl p-8 flex flex-col justify-between group-hover:bg-black/35 transition-all duration-500">
              <div className="inline-flex w-fit">
                <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">
                  ✦ Little Luxe
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-display font-black text-4xl text-white uppercase leading-none">
                    Kids
                    <br />
                    Wonderland
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Premium organic cotton & playful designs made for endless adventures
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold px-3 py-1.5 rounded-full border border-white/30">
                    Organic Cotton
                  </span>
                  <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold px-3 py-1.5 rounded-full border border-white/30">
                    Playful & Durable
                  </span>
                  <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold px-3 py-1.5 rounded-full border border-white/30">
                    Safe & Soft
                  </span>
                </div>

                <button
                  onClick={() => onNavigate('shop', { category: 'Kids' })}
                  className="w-full bg-white hover:bg-emerald-400 text-black font-bold py-4 rounded-2xl uppercase text-sm tracking-wider transition-all duration-300 hover:scale-[1.03] shadow-2xl"
                >
                  Shop Kids Collection →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Trending Products Section */}
      {trendingProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div>
            <span className="text-[10px] text-primary uppercase font-bold tracking-[0.2em]">
              High-Demand Drops
            </span>
            <h2 className="font-display font-extrabold text-2xl text-black mt-1 uppercase">
              Trending Now
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((item) => (
              <ProductCard
                key={item.id || item._id}
                product={item}
                onNavigate={onNavigate}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        </section>
      )}

      {/* 9. Best Sellers Section */}
      {bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div>
            <span className="text-[10px] text-primary uppercase font-bold tracking-[0.2em]">
              The Hall of Fame
            </span>
            <h2 className="font-display font-extrabold text-2xl text-black mt-1 uppercase">
              Best Sellers
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((item) => (
              <ProductCard
                key={item.id || item._id}
                product={item}
                onNavigate={onNavigate}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        </section>
      )}

      {/* 10. Recently Viewed Carousel */}
      {recentlyViewed.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div>
            <span className="text-[10px] text-primary uppercase font-bold tracking-[0.2em]">
              Welcome Back
            </span>
            <h2 className="font-display font-extrabold text-2xl text-black mt-1 uppercase">
              Recently Viewed Items
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {recentlyViewed.slice(0, 4).map((item) => (
              <ProductCard
                key={item.id || item._id}
                product={item}
                onNavigate={onNavigate}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        </section>
      )}

      {/* 11. Testimonials Bento Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] text-primary uppercase font-bold tracking-[0.25em]">
            Global Affluence
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-black uppercase">
            What Our Patrons Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Suresh Pillai',
              rating: 5,
              role: 'Collector',
              text: 'The cashmere wool trench coat is beyond description. Weightless warmth, custom tailored drop. This is pure Indian design luxury.',
            },
            {
              name: 'Devika Roy',
              rating: 5,
              role: 'Creative Director',
              text: "Luxe Store's concierge support changed my perspective on online shopping. Extremely secure and responsive. Handled custom sizing flawlessly.",
            },
            {
              name: 'Vikram Sethi',
              rating: 4.8,
              role: 'Sartorialist',
              text: 'Italian calfskin with genuine brass zippers. Understated prestige horology. The detailing beats any high street boutique.',
            },
          ].map((testi, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, rIdx) => (
                    <FiStar key={rIdx} size={13} className="fill-current" />
                  ))}
                </div>
                <p className="text-xs text-gray-500 italic leading-relaxed">"{testi.text}"</p>
              </div>

              <div className="pt-6 border-t border-gray-50 mt-6 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-800">{testi.name}</h4>
                  <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">
                    {testi.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 12. Blog & Editorial Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <span className="text-[10px] text-primary uppercase font-bold tracking-[0.2em]">
            The Atelier Chronicles
          </span>
          <h2 className="font-display font-extrabold text-2xl text-black mt-1 uppercase">
            Style & Craft Editorials
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400',
              title: 'Sartorial Layering for Autumn Cityscapes',
              date: 'July 02, 2026',
            },
            {
              img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400',
              title: 'Evolution of the Minimalist Italian Low-Top',
              date: 'June 28, 2026',
            },
            {
              img: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=400',
              title: 'Swiss Horology & Triple Quartz Chronographs',
              date: 'June 15, 2026',
            },
          ].map((blog, i) => (
            <div
              key={i}
              className="group cursor-pointer bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src={blog.img}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-5 space-y-2">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                  {blog.date}
                </span>
                <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                  {blog.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 13. Real Instagram Reels from Admin Panel */}
      <AtelierReels siteSettings={siteSettings} onNavigate={onNavigate} />
    </div>
  );
}