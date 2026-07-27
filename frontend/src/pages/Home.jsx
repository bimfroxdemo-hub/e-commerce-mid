import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import AtelierReels from '../components/AtelierReels';
import {
  FiChevronLeft,
  FiChevronRight,
  FiStar,
  FiArrowRight,
  FiShield,
  FiCornerDownLeft,
  FiTruck,
  FiRefreshCw,
  FiAward,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

/* ── tiny hook: auto-advancing touch slider ── */
function useSlider(count, autoMs = 3500) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);

  const reset = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(
      () => setIdx((p) => (p + 1) % count),
      autoMs
    );
  };

  useEffect(() => {
    reset();
    return () => clearInterval(timerRef.current);
  }, [count]);

  const prev = () => { setIdx((p) => (p - 1 + count) % count); reset(); };
  const next = () => { setIdx((p) => (p + 1) % count); reset(); };
  const go   = (i) => { setIdx(i); reset(); };

  return { idx, prev, next, go };
}

/* ── horizontal drag-to-scroll for card rows ── */
function useDragScroll() {
  const ref = useRef(null);
  const down = useRef(false);
  const startX = useRef(0);
  const scrollL = useRef(0);

  const onMouseDown = (e) => {
    down.current = true;
    startX.current = e.pageX - ref.current.offsetLeft;
    scrollL.current = ref.current.scrollLeft;
  };
  const onMouseLeave = () => (down.current = false);
  const onMouseUp    = () => (down.current = false);
  const onMouseMove  = (e) => {
    if (!down.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    ref.current.scrollLeft = scrollL.current - (x - startX.current);
  };
  return { ref, onMouseDown, onMouseLeave, onMouseUp, onMouseMove };
}

export default function Home({ onNavigate, onQuickView }) {
  const {
    products      = [],
    categories    = [],
    recentlyViewed = [],
    siteSettings  = {},
  } = useApp();

  // Safeguard: Exclude placeholder/home/collections page markers from displaying in categories grid
  const displayCategories = categories.filter(
    (cat) => 
      cat.slug?.toLowerCase() !== 'home' && 
      cat.name?.toLowerCase() !== 'home' &&
      cat.slug?.toLowerCase() !== 'home-page' &&
      cat.slug !== '/' &&
      cat.name?.toLowerCase() !== 'collections'
  );

  // Dynamic promo banners state reading configuration from local storage dynamically
  const [promoBanners, setPromoBanners] = useState(() => {
    try {
      const saved = localStorage.getItem('luxe_banners_config');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Listen to storage events to update real-time if configured in tabs
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('luxe_banners_config');
        if (saved) setPromoBanners(JSON.parse(saved));
      } catch {}
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /* ── hero slider ── */
  const heroSlides = [
    {
      title    : siteSettings.heroTitle    || 'Modern Luxury Fashion',
      subtitle : siteSettings.heroSubtitle || 'NEW SEASON 2026',
      desc     : siteSettings.heroDescription || 'Premium outfits crafted for the modern lifestyle.',
      image    : siteSettings.heroImage    || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1920&auto=format&fit=crop',
      btnText  : 'Shop Collection',
      btnAction: () => onNavigate('shop'),
    },
    {
      title    : siteSettings.slide2Title    || 'Hand-Burnished Italian Leather',
      subtitle : siteSettings.slide2Subtitle || 'MASTER CRAFTSMANSHIP',
      desc     : siteSettings.slide2Description || 'Florence-inspired full-grain leather jackets.',
      image    : siteSettings.slide2Image    || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1920&auto=format&fit=crop',
      btnText  : 'Explore Collection',
      btnAction: () => onNavigate('shop', { category: siteSettings.slide2Category || 'Men' }),
    },
    {
      title    : siteSettings.slide3Title    || 'Mulberry Silk Couture',
      subtitle : siteSettings.slide3Subtitle || 'SEASONAL EDIT',
      desc     : siteSettings.slide3Description || 'Flowing silhouettes from the finest premium silks.',
      image    : siteSettings.slide3Image    || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1920&auto=format&fit=crop',
      btnText  : 'View Collection',
      btnAction: () => onNavigate('shop', { category: siteSettings.slide3Category || 'Women' }),
    },
  ];
  const hero = useSlider(heroSlides.length, 6000);

  /* ── category slider (mobile) ── */
  const catSlider = useSlider(Math.max(1, Math.ceil(displayCategories.length / 2)), 3200);

  /* ── product row drag ── */
  const dealDrag     = useDragScroll();
  const featDrag     = useDragScroll();
  const trendDrag    = useDragScroll();
  const bsDrag       = useDragScroll();
  const recentDrag   = useDragScroll();
  const interestDrag = useDragScroll();

  /* ── countdown ── */
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 42, seconds: 15 });
  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((p) => {
        if (p.seconds > 0) return { ...p, seconds: p.seconds - 1 };
        if (p.minutes > 0) return { ...p, minutes: p.minutes - 1, seconds: 59 };
        if (p.hours   > 0) return { hours: p.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const featured   = products.filter((p) => (p.tags||[]).includes('featured')).slice(0, 8);
  const trending   = products.filter((p) => (p.tags||[]).includes('trending')).slice(0, 8);
  const deals      = products.filter((p) => (p.tags||[]).includes('deal')).slice(0, 8);
  const bestSell   = products.filter((p) => (p.tags||[]).includes('best-seller')).slice(0, 8);

  // ==========================================
  // ✅ REAL-TIME DYNAMIC INTEREST RECOMMENDATIONS
  // ==========================================
  const interestCategory = useMemo(() => {
    if (!recentlyViewed || recentlyViewed.length === 0) return null;
    const catCounts = {};
    recentlyViewed.forEach(p => {
      const catName = p.category?.name || p.category || '';
      if (catName) {
        catCounts[catName] = (catCounts[catName] || 0) + 1;
      }
    });
    
    let favoriteCategory = null;
    let maxCount = 0;
    for (const [cat, count] of Object.entries(catCounts)) {
      if (count > maxCount) {
        maxCount = count;
        favoriteCategory = cat;
      }
    }
    return favoriteCategory;
  }, [recentlyViewed]);

  const interestProducts = useMemo(() => {
    if (!interestCategory) return [];
    return products.filter(p => 
      p.isActive &&
      String(p.category?.name || p.category || '').toLowerCase() === interestCategory.toLowerCase() &&
      !recentlyViewed.some(rv => String(rv._id || rv.id) === String(p._id || p.id))
    ).slice(0, 8);
  }, [products, interestCategory, recentlyViewed]);

  /* ── shared styles ── */
  const scrollRow = {
    display              : 'flex',
    gap                  : '12px',
    overflowX            : 'auto',
    scrollSnapType       : 'x mandatory',
    WebkitOverflowScrolling: 'touch',
    paddingBottom        : '4px',
    cursor               : 'grab',
  };
  const scrollRowHide = { scrollbarWidth: 'none' };

  /* ── Section Header ── */
  const SH = ({ eyebrow, title, viewAll, onViewAll }) => (
    <div className="flex items-end justify-between mb-4 sm:mb-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-[2px] w-5 rounded-full" style={{ background: 'linear-gradient(90deg,#D4AF37,transparent)' }} />
          <span className="text-[9px] font-black uppercase tracking-[0.28em]" style={{ color: '#007A8A' }}>{eyebrow}</span>
        </div>
        <h2 className="font-sans font-bold text-lg sm:text-xl md:text-2xl tracking-tight" style={{ color: '#1A1A3A' }}>{title}</h2>
      </div>
      {viewAll && (
        <button
          onClick={onViewAll}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all duration-300"
          style={{ color: '#1A1A3A', borderColor: 'rgba(212,175,55,0.4)', backgroundColor: 'transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1A1A3A'; e.currentTarget.style.color = '#D4AF37'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#1A1A3A'; }}
        >
          View All <FiArrowRight size={11} />
        </button>
      )}
    </div>
  );

  /* ── Mobile product scroll row ── */
  const MobileRow = ({ drag, items }) => (
    <div
      ref={drag.ref}
      style={{ ...scrollRow, ...scrollRowHide }}
      onMouseDown={drag.onMouseDown}
      onMouseLeave={drag.onMouseLeave}
      onMouseUp={drag.onMouseUp}
      onMouseMove={drag.onMouseMove}
    >
      {items.map((item) => (
        <div
          key={item.id || item._id}
          style={{ minWidth: '160px', width: '160px', scrollSnapAlign: 'start', flexShrink: 0 }}
        >
          <ProductCard product={item} onNavigate={onNavigate} onQuickView={onQuickView} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="pb-16" style={{ backgroundColor: '#F4F4F6' }}>

      {/* 1. HERO */}
      <section className="relative overflow-hidden w-full" style={{ height: 'clamp(480px,82vh,760px)' }}>

        <AnimatePresence mode="sync">
          {heroSlides.map((slide, i) =>
            i === hero.idx ? (
              <motion.div key={i} className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: 'easeInOut' }}
              >
                <img
                  src={slide.image} alt={slide.title} draggable={false}
                  className="w-full h-full object-cover object-center"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1920'; }}
                />
                {/* left vignette */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(100deg,rgba(8,8,22,0.72) 0%,rgba(8,8,22,0.35) 42%,rgba(8,8,22,0.06) 70%,transparent 100%)' }} />
                {/* bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: 'linear-gradient(to top,rgba(8,8,22,0.55),transparent)' }} />
              </motion.div>
            ) : null
          )}
        </AnimatePresence>

        {/* gold top bar */}
        <div className="absolute top-0 inset-x-0 h-[3px] z-30" style={{ background: 'linear-gradient(90deg,#D4AF37,#007A8A 50%,#D4AF37)' }} />

        {/* content */}
        <div className="relative z-20 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-16 w-full">
            <AnimatePresence mode="wait">
              <motion.div key={`h-${hero.idx}`}
                initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.5 }}
                className="max-w-md"
              >
                {/* eyebrow */}
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="block w-7 h-[2px] rounded-full" style={{ backgroundColor: '#D4AF37' }} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.32em]" style={{ color: '#D4AF37' }}>
                    {heroSlides[hero.idx].subtitle}
                  </span>
                </div>

                {/* title — clean sans-serif, moderate size */}
                <h1
                  className="font-sans font-bold text-white leading-tight mb-3"
                  style={{ fontSize: 'clamp(1.75rem, 4.2vw, 3.4rem)', letterSpacing: '-0.01em', textShadow: '0 2px 24px rgba(0,0,0,0.22)' }}
                >
                  {heroSlides[hero.idx].title}
                </h1>

                <div className="w-10 h-[2px] rounded-full mb-4" style={{ backgroundColor: '#D4AF37' }} />

                <p className="text-sm font-light leading-relaxed mb-6 max-w-xs" style={{ color: 'rgba(255,255,255,0.82)' }}>
                  {heroSlides[hero.idx].desc}
                </p>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={heroSlides[hero.idx].btnAction}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] transition-all duration-300 hover:scale-105"
                    style={{ backgroundColor: '#D4AF37', color: '#1A1A3A', boxShadow: '0 6px 28px rgba(212,175,55,0.48)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c49e2f')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#D4AF37')}
                  >
                    {heroSlides[hero.idx].btnText} <FiArrowRight size={13} />
                  </button>
                  <button
                    onClick={() => onNavigate('shop')}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] transition-all duration-300 hover:scale-105"
                    style={{ backgroundColor: 'rgba(255,255,255,0.11)', border: '1.5px solid rgba(255,255,255,0.38)', color: '#fff', backdropFilter: 'blur(12px)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.11)')}
                  >
                    Browse All
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* arrows */}
        {[
          { side: 'left-4 sm:left-6', fn: hero.prev, Icon: FiChevronLeft },
          { side: 'right-4 sm:right-6', fn: hero.next, Icon: FiChevronRight },
        ].map(({ side, fn, Icon }) => (
          <button key={side} onClick={fn}
            className={`absolute ${side} top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110`}
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(212,175,55,0.42)', color: '#D4AF37', backdropFilter: 'blur(10px)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#D4AF37'; e.currentTarget.style.color = '#1A1A3A'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#D4AF37'; }}
          >
            <Icon size={18} />
          </button>
        ))}

        {/* dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => hero.go(i)} className="rounded-full transition-all duration-400"
              style={{ width: i === hero.idx ? '30px' : '7px', height: '7px', backgroundColor: i === hero.idx ? '#D4AF37' : 'rgba(212,175,55,0.35)' }}
            />
          ))}
        </div>
      </section>

      {/* 2. TRUST BADGES */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: 'linear-gradient(135deg,#1A1A3A 0%,#252560 50%,#1A1A3A 100%)', border: '1px solid rgba(212,175,55,0.15)' }}
        >
          <div className="h-[2px]" style={{ background: 'linear-gradient(90deg,transparent,#D4AF37,transparent)' }} />
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <FiTruck size={20} />,     title: 'Free Delivery',     desc: 'Orders above ₹999',           color: '#007A8A' },
              { icon: <FiAward size={20} />,     title: 'Authentic Quality', desc: '100% certified premium',      color: '#D4AF37' },
              { icon: <FiRefreshCw size={20} />, title: 'Easy Returns',      desc: '14-day hassle-free returns',  color: '#007A8A' },
              { icon: <FiShield size={20} />,    title: 'Secure Payments',   desc: '256-bit SSL encrypted',       color: '#D4AF37' },
            ].map((item, i) => (
              <div key={i}
                className="flex items-center gap-3 p-3.5 sm:p-5 transition-all duration-300"
                style={{ borderRight: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div className="flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-transform duration-300 hover:scale-110"
                  style={{ backgroundColor: `${item.color}18`, border: `1px solid ${item.color}35`, color: item.color }}
                >
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-[10px] sm:text-[11px] font-black uppercase tracking-wide" style={{ color: '#F8F8F8' }}>{item.title}</h4>
                  <p className="text-[9px] mt-0.5 hidden sm:block" style={{ color: 'rgba(248,248,248,0.45)' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-12 sm:mt-14">
        <SH eyebrow="Explore Ateliers" title="Shop By Collection" viewAll onViewAll={() => onNavigate('shop')} />

        {/* ── DESKTOP grid ── */}
        <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {displayCategories.map((cat, i) => (
            <CatCard key={cat.id || cat._id || i} cat={cat} onNavigate={onNavigate} />
          ))}
        </div>

        {/* ── MOBILE slider (2 cards per view, auto-advance) ── */}
        <div className="sm:hidden relative">
          <div className="overflow-hidden rounded-2xl">
            <AnimatePresence mode="wait">
              <motion.div key={catSlider.idx}
                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.38 }}
                className="grid grid-cols-2 gap-3"
              >
                {displayCategories
                  .slice(catSlider.idx * 2, catSlider.idx * 2 + 2)
                  .map((cat, i) => (
                    <CatCard key={cat.id || cat._id || i} cat={cat} onNavigate={onNavigate} />
                  ))}
              </motion.div>
            </AnimatePresence>
          </div>
          {/* dots */}
          <div className="flex justify-center gap-1.5 mt-3">
            {Array.from({ length: Math.ceil(displayCategories.length / 2) }).map((_, i) => (
              <button key={i} onClick={() => catSlider.go(i)}
                className="rounded-full transition-all duration-400"
                style={{ width: i === catSlider.idx ? '22px' : '6px', height: '6px', backgroundColor: i === catSlider.idx ? '#D4AF37' : 'rgba(212,175,55,0.35)' }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          ✅ NEW: "BASED ON YOUR INTERESTS" PERSONALIZATION
      ========================================== */}
      {interestCategory && interestProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-12 sm:mt-14">
          <SH 
            eyebrow="Personalized For You" 
            title={`Based on your interest in ${interestCategory}`} 
            viewAll 
            onViewAll={() => onNavigate('shop', { category: interestCategory })} 
          />
          <div className="sm:hidden">
            <MobileRow drag={interestDrag} items={interestProducts} />
          </div>
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {interestProducts.slice(0, 4).map((item) => (
              <ProductCard key={item.id || item._id} product={item} onNavigate={onNavigate} onQuickView={onQuickView} />
            ))}
          </div>
        </section>
      )}

      {/* 4. OUTLET VAULT */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-12 sm:mt-14">
        <div className="relative rounded-3xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#060614 0%,#1A1A3A 45%,#0a0a1e 100%)', border: '1px solid rgba(212,175,55,0.12)', boxShadow: '0 28px 70px rgba(10,10,30,0.4)' }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px] opacity-15 pointer-events-none" style={{ backgroundColor: '#D4AF37', transform: 'translate(35%,-35%)' }} />
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg,transparent,#D4AF37 40%,#007A8A 60%,transparent)' }} />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2">
            {/* left */}
            <div className="flex flex-col justify-center p-6 sm:p-10 md:p-12 space-y-5 sm:space-y-6 text-center lg:text-left">
              <div className="flex justify-center lg:justify-start">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full"
                  style={{ backgroundColor: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#D4AF37' }} />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: '#D4AF37' }} />
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: '#D4AF37' }}>Flash Sale · Live Now</span>
                </div>
              </div>

              <div>
                <h2 className="font-sans font-bold uppercase leading-tight" style={{ fontSize: 'clamp(2rem,5vw,3.8rem)', color: '#F8F8F8', letterSpacing: '-0.015em' }}>
                  The Outlet<br /><span style={{ color: '#D4AF37' }}>Vault</span>
                </h2>
                <p className="mt-3 text-sm font-light max-w-xs mx-auto lg:mx-0" style={{ color: 'rgba(248,248,248,0.55)' }}>
                  Up to <span className="font-semibold" style={{ color: '#D4AF37' }}>40% off</span> limited-run collections — tonight only.
                </p>
              </div>

              {/* countdown */}
              <div className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3">
                {[{ label: 'HRS', val: timeLeft.hours }, { label: 'MIN', val: timeLeft.minutes }, { label: 'SEC', val: timeLeft.seconds }].map((t, i) => (
                  <React.Fragment key={i}>
                    <div className="flex flex-col items-center">
                      <div className="rounded-xl flex items-center justify-center font-bold font-mono"
                        style={{ width: 'clamp(3rem,9vw,4.5rem)', height: 'clamp(3rem,9vw,4.5rem)', fontSize: 'clamp(1.2rem,2.8vw,2rem)', backgroundColor: '#D4AF37', color: '#1A1A3A', boxShadow: '0 6px 20px rgba(212,175,55,0.38)' }}
                      >
                        {String(t.val).padStart(2, '0')}
                      </div>
                      <span className="text-[8px] uppercase font-black mt-1.5 tracking-widest" style={{ color: 'rgba(212,175,55,0.6)' }}>{t.label}</span>
                    </div>
                    {i < 2 && <span className="text-2xl font-black mb-4" style={{ color: 'rgba(212,175,55,0.45)' }}>:</span>}
                  </React.Fragment>
                ))}
              </div>

              <div className="flex justify-center lg:justify-start">
                <button onClick={() => onNavigate('shop', { filter: 'deal' })}
                  className="inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.16em] px-7 py-3.5 rounded-full transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: '#D4AF37', color: '#1A1A3A', boxShadow: '0 6px 28px rgba(212,175,55,0.42)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c49e2f')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#D4AF37')}
                >
                  Shop The Vault <FiArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* right orbit */}
            <div className="relative flex items-center justify-center p-6 sm:p-10" style={{ minHeight: 'clamp(300px,42vw,460px)' }}>
              {/* center */}
              <div className="relative z-10 rounded-full flex flex-col items-center justify-center"
                style={{ width: 'clamp(120px,17vw,176px)', height: 'clamp(120px,17vw,176px)', background: 'radial-gradient(circle,rgba(212,175,55,0.2) 0%,rgba(0,122,138,0.1) 100%)', border: '2px solid rgba(212,175,55,0.3)', backdropFilter: 'blur(20px)', boxShadow: '0 0 70px rgba(212,175,55,0.2)' }}
              >
                <p className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(212,175,55,0.7)' }}>UP TO</p>
                <div className="flex items-start leading-none">
                  <span className="font-sans font-black" style={{ fontSize: 'clamp(2.6rem,6.5vw,4.4rem)', color: '#D4AF37' }}>40</span>
                  <span className="font-bold mt-1" style={{ fontSize: 'clamp(1.1rem,2.5vw,1.9rem)', color: '#D4AF37' }}>%</span>
                </div>
                <p className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(212,175,55,0.7)' }}>OFF VAULT</p>
              </div>

              {[
                { img: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=300&auto=format&fit=crop&q=80', label: 'WOMEN', disc: '-40%', angle: -90, r: 148 },
                { img: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=300&auto=format&fit=crop&q=80', label: 'MEN',   disc: '-40%', angle: 30,  r: 148 },
                { img: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=300&auto=format&fit=crop&q=80', label: 'KIDS',  disc: '-30%', angle: 150, r: 148 },
              ].map((it, i) => {
                const rad = (it.angle * Math.PI) / 180;
                return (
                  <div key={i} className="absolute flex flex-col items-center group cursor-pointer"
                    style={{ left: '50%', top: '50%', transform: `translate(calc(-50% + ${it.r * Math.cos(rad)}px), calc(-50% + ${it.r * Math.sin(rad)}px))` }}
                  >
                    <div className="relative">
                      <img src={it.img} alt={it.label}
                        className="rounded-full object-cover shadow-2xl group-hover:scale-110 transition-transform duration-400"
                        style={{ width: 'clamp(54px,8vw,82px)', height: 'clamp(54px,8vw,82px)', objectFit: 'cover', objectPosition: 'center top', border: '2px solid rgba(212,175,55,0.5)', boxShadow: '0 6px 20px rgba(0,0,0,0.4)' }}
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=200'; }}
                      />
                      <div className="absolute -bottom-1 -right-1 text-[7px] font-black px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: '#D4AF37', color: '#1A1A3A' }}>{it.disc}</div>
                    </div>
                    <span className="mt-1.5 px-2 py-0.5 rounded-full text-[7px] font-black tracking-widest"
                      style={{ backgroundColor: 'rgba(26,26,58,0.9)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}>{it.label}</span>
                  </div>
                );
              })}

              <div className="absolute rounded-full border border-dashed pointer-events-none"
                style={{ width: 'clamp(220px,34vw,330px)', height: 'clamp(220px,34vw,330px)', borderColor: 'rgba(212,175,55,0.1)', left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* 5. TODAY'S DEALS */}
      {deals.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-12 sm:mt-14">
          <SH eyebrow="Exclusive Markdown" title="Today's Luxury Deals" viewAll onViewAll={() => onNavigate('shop', { filter: 'deal' })} />
          {/* mobile scroll */}
          <div className="sm:hidden">
            <MobileRow drag={dealDrag} items={deals} />
          </div>
          {/* desktop grid */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {deals.slice(0, 4).map((item) => (
              <ProductCard key={item.id || item._id} product={item} onNavigate={onNavigate} onQuickView={onQuickView} />
            ))}
          </div>
        </section>
      )}

      {/* 6. FEATURED */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-12 sm:mt-14">
          <SH eyebrow="Handpicked Masterpieces" title="Featured Collection" viewAll onViewAll={() => onNavigate('shop')} />
          <div className="sm:hidden">
            <MobileRow drag={featDrag} items={featured} />
          </div>
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {featured.slice(0, 4).map((item) => (
              <ProductCard key={item.id || item._id} product={item} onNavigate={onNavigate} onQuickView={onQuickView} />
            ))}
          </div>
        </section>
      )}

      {/* 7. DYNAMIC PROMOTIONAL BANNERS (LEFT BLOCK / RIGHT BLOCK) */}
      {promoBanners && (promoBanners.banner1 || promoBanners.banner2) && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-12 sm:mt-14">
          <div className="flex items-end justify-between mb-4 sm:mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-[2px] w-5 rounded-full" style={{ background: 'linear-gradient(90deg,#D4AF37,transparent)' }} />
                <span className="text-[9px] font-black uppercase tracking-[0.28em]" style={{ color: '#007A8A' }}>Boutique Spotlights</span>
              </div>
              <h2 className="font-sans font-bold text-lg sm:text-xl md:text-2xl tracking-tight" style={{ color: '#1A1A3A' }}>Featured Spotlights</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
            {[promoBanners.banner1, promoBanners.banner2].map((banner, i) => {
              if (!banner) return null;
              return (
                <div 
                  key={i} 
                  onClick={() => onNavigate('shop')}
                  className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
                  style={{ height: 'clamp(280px,38vw,360px)' }}
                >
                  <img 
                    src={banner.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200'} 
                    alt={banner.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,8,22,0.9) 0%, rgba(8,8,22,0.3) 50%, transparent 100%)' }} />
                  <div className="absolute inset-0 flex flex-col justify-between p-6">
                    <span className="inline-block self-start text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest bg-gradient-to-r from-amber-500 to-orange-500 shadow-md">
                      {banner.badge}
                    </span>
                    <div className="space-y-2">
                      <h3 className="font-sans font-bold text-xl sm:text-2xl text-white uppercase leading-tight">
                        {banner.title}
                      </h3>
                      <p className="text-xs text-white/70 line-clamp-2 max-w-sm">
                        {banner.description}
                      </p>
                      <span className="inline-block text-[10px] font-black uppercase text-[#D4AF37] tracking-wider group-hover:translate-x-1.5 transition-transform duration-300">
                        Explore Collection →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 8. EDITORIAL BANNERS */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-12 sm:mt-14">
        <SH eyebrow="Curated Collections" title="Atelier Editions" />
        <EditorialBanners onNavigate={onNavigate} />
      </section>

      {/* 9. TRENDING */}
      {trending.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-12 sm:mt-14">
          <SH eyebrow="High-Demand Drops" title="Trending Now" viewAll onViewAll={() => onNavigate('shop')} />
          <div className="sm:hidden">
            <MobileRow drag={trendDrag} items={trending} />
          </div>
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {trending.slice(0, 4).map((item) => (
              <ProductCard key={item.id || item._id} product={item} onNavigate={onNavigate} onQuickView={onQuickView} />
            ))}
          </div>
        </section>
      )}

      {/* 10. BEST SELLERS */}
      {bestSell.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-12 sm:mt-14">
          <SH eyebrow="Hall of Fame" title="Best Sellers" viewAll onViewAll={() => onNavigate('shop')} />
          <div className="sm:hidden">
            <MobileRow drag={bsDrag} items={bestSell} />
          </div>
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {bestSell.slice(0, 4).map((item) => (
              <ProductCard key={item.id || item._id} product={item} onNavigate={onNavigate} onQuickView={onQuickView} />
            ))}
          </div>
        </section>
      )}

      {/* 11. RECENTLY VIEWED */}
      {recentlyViewed.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-12 sm:mt-14">
          <SH eyebrow="Welcome Back" title="Recently Viewed" />
          <div className="sm:hidden">
            <MobileRow drag={recentDrag} items={recentlyViewed.slice(0, 8)} />
          </div>
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {recentlyViewed.slice(0, 4).map((item) => (
              <ProductCard key={item.id || item._id} product={item} onNavigate={onNavigate} onQuickView={onQuickView} />
            ))}
          </div>
        </section>
      )}

      {/* 12. TESTIMONIALS */}
      <TestimonialsSection />

      {/* 13. BLOG */}
      <BlogSection />

      {/* 14. ATELIER REELS */}
      <div className="mt-12 sm:mt-14">
        <AtelierReels siteSettings={siteSettings} onNavigate={onNavigate} />
      </div>

      {/* 15. NEWSLETTER */}
      <NewsletterSection />
    </div>
  );
}

/* ─────────────────────────────────────────
   SUB-COMPONENTS (kept in same file)
───────────────────────────────────────── */

function CatCard({ cat, onNavigate }) {
  return (
    <div
      onClick={() => {
        if (typeof onNavigate === 'function') {
          onNavigate('shop', { category: cat.slug || cat.name });
        } else {
          console.warn("⚠️ 'onNavigate' prop is missing in Home component. Please check your App.jsx routing!");
        }
      }}
      className="group relative rounded-2xl overflow-hidden cursor-pointer shadow hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
      style={{ aspectRatio: '4/5' }}
    >
      <img
        src={cat.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop'}
        alt={cat.name}
        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.08]"
        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600'; }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-[52%] z-10"
        style={{ background: 'linear-gradient(to top,rgba(8,8,22,0.96) 0%,rgba(8,8,22,0.48) 60%,transparent 100%)' }} />
      <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ backgroundColor: 'rgba(8,8,22,0.16)' }} />
      <div className="absolute inset-0 z-20 rounded-2xl ring-0 group-hover:ring-2 ring-amber-400/40 ring-inset transition-all duration-500 pointer-events-none" />

      {/* NEW badge */}
      <div className="absolute top-2 left-2 z-30">
        <span className="text-[7px] font-black px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#D4AF37', color: '#1A1A3A' }}>NEW</span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-30 p-3">
        <div className="h-[2px] w-4 mb-1.5 rounded-full group-hover:w-8 transition-all duration-500" style={{ backgroundColor: '#D4AF37' }} />
        <h3 className="font-sans font-bold text-[11px] sm:text-xs tracking-wider uppercase text-white leading-tight">{cat.name}</h3>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-[9px] font-semibold" style={{ color: 'rgba(212,175,55,0.85)' }}>{cat.productCount || 0} Items</p>
          <div className="w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
            style={{ backgroundColor: '#D4AF37', color: '#1A1A3A' }}>
            <FiArrowRight size={8} />
          </div>
        </div>
      </div>
    </div>
  );
}

function EditorialBanners({ onNavigate }) {
  const cards = [
    {
      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=85',
      badge: '✦ Exclusive', badgeFrom: '#f59e0b', badgeTo: '#f97316',
      heading: ['Italian', 'Leather'],
      desc: 'Timeless pieces by artisans with 75+ years of expertise',
      chips: ['Handcrafted', 'Full-Grain', 'Lifetime Warranty'],
      btnText: "Shop Men's →", btnAction: () => onNavigate('shop', { category: 'Men' }),
      objectPos: 'center 20%',
    },
    {
      img: 'https://images.unsplash.com/photo-1593010932917-92bd21088dee?w=800&auto=format&fit=crop&q=85',
      badge: '✦ New Season', badgeFrom: '#f43f5e', badgeTo: '#ec4899',
      heading: ['Pure', 'Cashmere'],
      desc: 'The softest Himalayan fibers, woven into luxury',
      chips: ['Ultra-Soft', 'Sustainable', 'Limited Edition'],
      btnText: "Shop Women's →", btnAction: () => onNavigate('shop', { category: 'Women' }),
      objectPos: 'center 15%',
    },
    {
      img: 'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=800&auto=format&fit=crop&q=85',
      badge: '✦ Little Luxe', badgeFrom: '#10b981', badgeTo: '#06b6d4',
      heading: ['Kids', 'Wonderland'],
      desc: 'Premium organic cotton for endless adventures',
      chips: ['Organic Cotton', 'Playful', 'Safe & Soft'],
      btnText: "Shop Kids' →", btnAction: () => onNavigate('shop', { category: 'Kids' }),
      objectPos: 'center 30%',
    },
  ];

  const s = useSlider(cards.length, 3800);

  return (
    <>
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        {cards.map((c, i) => <EditCard key={i} c={c} />)}
      </div>

      <div className="md:hidden relative">
        <AnimatePresence mode="wait">
          <motion.div key={s.idx}
            initial={{ opacity: 0, x: 36 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -36 }} transition={{ duration: 0.38 }}
          >
            <EditCard c={cards[s.idx]} />
          </motion.div>
        </AnimatePresence>
        <div className="flex items-center justify-between mt-3">
          <button onClick={s.prev} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}>
            <FiChevronLeft size={14} />
          </button>
          <div className="flex gap-1.5">
            {cards.map((_, i) => (
              <button key={i} onClick={() => s.go(i)} className="rounded-full transition-all duration-400"
                style={{ width: i === s.idx ? '22px' : '6px', height: '6px', backgroundColor: i === s.idx ? '#D4AF37' : 'rgba(212,175,55,0.35)' }} />
            ))}
          </div>
          <button onClick={s.next} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}>
            <FiChevronRight size={14} />
          </button>
        </div>
      </div>
    </>
  );
}

function EditCard({ c }) {
  return (
    <div className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
      style={{ height: 'clamp(360px,48vw,470px)' }} onClick={c.btnAction}
    >
      <img src={c.img} alt={c.heading.join(' ')}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
        style={{ objectPosition: c.objectPos }}
        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600'; }}
      />
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(to top,rgba(8,8,22,0.92) 0%,rgba(8,8,22,0.4) 50%,rgba(8,8,22,0.04) 100%)' }} />
      <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-6">
        <span className="inline-block text-white text-[8px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-lg"
          style={{ background: `linear-gradient(135deg,${c.badgeFrom},${c.badgeTo})` }}>{c.badge}</span>
        <div className="space-y-3">
          <div>
            <h3 className="font-sans font-bold uppercase leading-tight text-white"
              style={{ fontSize: 'clamp(1.8rem,4.5vw,2.8rem)' }}>
              {c.heading[0]}<br />{c.heading[1]}
            </h3>
            <p className="mt-2 text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>{c.desc}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {c.chips.map((chip, i) => (
              <span key={i} className="text-[9px] font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', backdropFilter: 'blur(8px)' }}>
                {chip}
              </span>
            ))}
          </div>
          <button
            className="w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] shadow-xl"
            style={{ backgroundColor: '#fff', color: '#1A1A3A' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#D4AF37')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
            onClick={(e) => { e.stopPropagation(); c.btnAction(); }}
          >
            {c.btnText}
          </button>
        </div>
      </div>
    </div>
  );
}

function TestimonialsSection() {
  const testimonials = [
    { name: 'Suresh Pillai', rating: 5, role: 'Collector', initial: 'S', text: 'The cashmere wool trench coat is beyond description. Weightless warmth, perfectly tailored drop. Pure Indian design luxury.' },
    { name: 'Devika Roy',    rating: 5, role: 'Creative Director', initial: 'D', text: "Luxe Store's concierge support completely changed my perspective on online shopping. Secure, responsive, flawless." },
    { name: 'Vikram Sethi',  rating: 4.8, role: 'Sartorialist', initial: 'V', text: 'Italian calfskin with genuine brass zippers. The detailing beats any high street boutique I have visited.' },
  ];
  const s = useSlider(testimonials.length, 4000);

  return (
    <section className="mt-12 sm:mt-14 py-12 sm:py-14" style={{ backgroundColor: '#1A1A3A' }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="h-px w-14 sm:w-20" style={{ background: 'linear-gradient(90deg,transparent,#D4AF37)' }} />
            <span className="text-[9px] font-black uppercase tracking-[0.28em]" style={{ color: '#007A8A' }}>Global Patrons</span>
            <div className="h-px w-14 sm:w-20" style={{ background: 'linear-gradient(90deg,#D4AF37,transparent)' }} />
          </div>
          <h2 className="font-sans font-bold text-xl sm:text-2xl uppercase" style={{ color: '#F8F8F8' }}>What Our Patrons Say</h2>
        </div>

        <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {testimonials.map((t, i) => <TestiCard key={i} t={t} />)}
        </div>

        <div className="sm:hidden">
          <AnimatePresence mode="wait">
            <motion.div key={s.idx}
              initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }} transition={{ duration: 0.36 }}
            >
              <TestiCard t={testimonials[s.idx]} />
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center gap-1.5 mt-4">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => s.go(i)} className="rounded-full transition-all duration-400"
                style={{ width: i === s.idx ? '22px' : '6px', height: '6px', backgroundColor: i === s.idx ? '#D4AF37' : 'rgba(212,175,55,0.35)' }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestiCard({ t }) {
  return (
    <div className="relative rounded-2xl p-5 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 overflow-hidden"
      style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.12)' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)')}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(90deg,#1A1A3A,#D4AF37,#007A8A)' }} />
      <div className="absolute top-2 right-3 font-sans font-black text-6xl leading-none select-none opacity-[0.05]" style={{ color: '#D4AF37' }}>"</div>
      <div className="space-y-3">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <FiStar key={i} size={12} className="fill-current" style={{ color: '#D4AF37' }} />
          ))}
        </div>
        <p className="text-xs sm:text-sm italic leading-relaxed" style={{ color: 'rgba(248,248,248,0.7)' }}>"{t.text}"</p>
      </div>
      <div className="pt-4 mt-4 flex items-center gap-3" style={{ borderTop: '1px solid rgba(212,175,55,0.1)' }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#D4AF37,#B8941F)', color: '#1A1A3A' }}>{t.initial}</div>
        <div>
          <h4 className="text-xs font-black" style={{ color: '#F8F8F8' }}>{t.name}</h4>
          <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color: '#007A8A' }}>{t.role}</p>
        </div>
        <div className="ml-auto text-[9px] font-black px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(212,175,55,0.12)', color: '#D4AF37' }}>★ {t.rating}</div>
      </div>
    </div>
  );
}

function BlogSection() {
  const blogs = [
    { img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=85&w=800&auto=format&fit=crop', title: 'Sartorial Layering for Autumn Cityscapes', date: 'July 02, 2026', tag: 'Style', readTime: '4 min' },
    { img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=85&w=800&auto=format&fit=crop', title: 'Evolution of the Minimalist Italian Low-Top', date: 'June 28, 2026', tag: 'Craft', readTime: '6 min' },
    { img: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=85&w=800&auto=format&fit=crop', title: 'Swiss Horology & Triple Quartz Chronographs', date: 'June 15, 2026', tag: 'Editorial', readTime: '5 min' },
  ];
  const s = useSlider(blogs.length, 4200);

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-12 sm:mt-14">
      <div className="flex items-end justify-between mb-4 sm:mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-[2px] w-5 rounded-full" style={{ background: 'linear-gradient(90deg,#D4AF37,transparent)' }} />
            <span className="text-[9px] font-black uppercase tracking-[0.28em]" style={{ color: '#007A8A' }}>The Atelier Chronicles</span>
          </div>
          <h2 className="font-sans font-bold text-lg sm:text-xl md:text-2xl tracking-tight" style={{ color: '#1A1A3A' }}>Style & Craft Editorials</h2>
        </div>
      </div>

      <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
        {blogs.map((b, i) => <BlogCard key={i} b={b} />)}
      </div>

      <div className="sm:hidden">
        <AnimatePresence mode="wait">
          <motion.div key={s.idx}
            initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }} transition={{ duration: 0.36 }}
          >
            <BlogCard b={blogs[s.idx]} />
          </motion.div>
        </AnimatePresence>
        <div className="flex justify-center gap-1.5 mt-3">
          {blogs.map((_, i) => (
            <button key={i} onClick={() => s.go(i)} className="rounded-full transition-all duration-400"
              style={{ width: i === s.idx ? '22px' : '6px', height: '6px', backgroundColor: i === s.idx ? '#D4AF37' : 'rgba(212,175,55,0.35)' }} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BlogCard({ b }) {
  return (
    <div className="group cursor-pointer rounded-2xl overflow-hidden bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      style={{ border: '1px solid rgba(26,26,58,0.07)' }}>
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <img src={b.img} alt={b.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ objectPosition: 'center 20%' }}
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600'; }}
        />
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{ backgroundColor: '#1A1A3A', color: '#D4AF37' }}>{b.tag}</span>
        </div>
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="text-[8px] font-semibold px-2 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', backdropFilter: 'blur(8px)' }}>{b.readTime}</span>
        </div>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20"
          style={{ background: 'rgba(26,26,58,0.35)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-300"
            style={{ backgroundColor: '#D4AF37', color: '#1A1A3A' }}>
            <FiArrowRight size={15} />
          </div>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1" style={{ backgroundColor: 'rgba(212,175,55,0.2)' }} />
          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#007A8A' }}>{b.date}</span>
        </div>
        <h3 className="text-xs sm:text-sm font-bold line-clamp-2 leading-snug group-hover:text-[#007A8A] transition-colors duration-300"
          style={{ color: '#1A1A3A' }}>{b.title}</h3>
        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider" style={{ color: '#D4AF37' }}>
          <span>Read Article</span><FiArrowRight size={10} />
        </div>
      </div>
    </div>
  );
}

function NewsletterSection() {
  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-12 sm:mt-14">
      <div className="relative rounded-3xl overflow-hidden py-10 sm:py-14 px-5 sm:px-12 text-center"
        style={{ background: 'linear-gradient(135deg,#1A1A3A 0%,#2E3192 50%,#1A1A3A 100%)', border: '1px solid rgba(212,175,55,0.15)' }}>
        <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full blur-[72px] opacity-20 pointer-events-none" style={{ backgroundColor: '#D4AF37' }} />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full blur-[72px] opacity-15 pointer-events-none" style={{ backgroundColor: '#007A8A' }} />
        <div className="relative z-10 max-w-lg mx-auto space-y-4 sm:space-y-5">
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-10" style={{ background: 'linear-gradient(90deg,transparent,#D4AF37)' }} />
            <span className="text-[9px] font-black uppercase tracking-[0.28em]" style={{ color: '#D4AF37' }}>The Inner Circle</span>
            <div className="h-px w-10" style={{ background: 'linear-gradient(90deg,#D4AF37,transparent)' }} />
          </div>
          <h2 className="font-sans font-bold text-xl sm:text-2xl md:text-3xl uppercase text-white leading-tight">
            Join The Atelier<br /><span style={{ color: '#D4AF37' }}>Members Club</span>
          </h2>
          <p className="text-sm font-light" style={{ color: 'rgba(248,248,248,0.6)' }}>
            Early access to collections, exclusive offers & luxury editorials.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
            <input type="email" placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-full text-sm outline-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(212,175,55,0.25)', color: '#F8F8F8' }}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(212,175,55,0.6)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(212,175,55,0.25)')}
            />
            <button className="px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.14em] transition-all duration-300 hover:scale-105 whitespace-nowrap"
              style={{ backgroundColor: '#D4AF37', color: '#1A1A3A', boxShadow: '0 6px 20px rgba(212,175,55,0.38)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c49e2f')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#D4AF37')}
            >
              Subscribe
            </button>
          </div>
          <p className="text-[10px]" style={{ color: 'rgba(248,248,248,0.32)' }}>No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  );
}