import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import {
  FiSearch, FiUser, FiShoppingBag, FiHeart, FiX, FiMenu,
  FiChevronDown, FiInstagram, FiTruck, FiPhone, FiTrendingUp,
} from "react-icons/fi";
import { FaWhatsapp, FaFacebookF } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar({ onNavigate, currentPage }) {
  const {
    cart, wishlist, currentUser, recentSearches, setRecentSearches,
    products, isBackendConnected, siteSettings,
  } = useApp();

  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuCategory, setMegaMenuCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const megaMenuRef = useRef(null);

  const cartItems = Array.isArray(cart) ? cart : [];
  const wishlistItems = Array.isArray(wishlist) ? wishlist : [];
  const allProducts = Array.isArray(products) ? products : [];
  const savedSearches = Array.isArray(recentSearches) ? recentSearches : [];

  const cartCount = cartItems.reduce((acc, item) => acc + Number(item.quantity || 0), 0);
  const firstName = currentUser?.name?.split(" ")?.[0] || "Account";
  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  const filteredSearchProducts = searchQuery
    ? allProducts.filter((p) => {
      const q = searchQuery.toLowerCase();
      return p?.name?.toLowerCase().includes(q) || p?.category?.toLowerCase().includes(q) || p?.brand?.toLowerCase().includes(q);
    })
    : [];

  const menuItems = [
    { name: "Home", id: "home" },
    { name: "Shop", id: "shop", dropdown: true },
    { name: "Men", id: "shop", category: "Men", dropdown: true },
    { name: "Women", id: "shop", category: "Women", dropdown: true },
    { name: "Kids", id: "shop", category: "Kids", dropdown: true },
    { name: "Collections", id: "collections" },
    { name: "Contact", id: "contact" },
  ];

  const handleMenuNavigate = (item) => {
    const params = item.category ? { category: item.category } : item.params;
    if (params) onNavigate(item.id, params);
    else onNavigate(item.id);
  };

  const isMenuActive = (item) => {
    if (item.name === "Home") return currentPage === "home";
    if (item.name === "Shop") return currentPage === "shop";
    if (item.name === "Collections") return currentPage === "collections";
    if (item.name === "Contact") return currentPage === "contact";
    return false;
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const term = searchQuery.trim();
    if (term) {
      if (!savedSearches.includes(term)) setRecentSearches([term, ...savedSearches.slice(0, 4)]);
      onNavigate("shop", { search: term });
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleUserClick = () => {
    if (currentUser) onNavigate(isAdmin ? "admin-dashboard" : "user-dashboard");
    else onNavigate("login");
  };

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === "Escape") { setSearchOpen(false); setCartOpen(false); setMobileMenuOpen(false); setMegaMenuCategory(null); } };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (searchOpen || cartOpen || mobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [searchOpen, cartOpen, mobileMenuOpen]);

  return (
    <>
      {/* 1. TOP BAR - Kabiraaz Fashion Colors */}
      <div className="relative z-50 flex h-10 items-center justify-between bg-[#1A1A3A] px-4 text-white md:px-8 lg:px-12">
        <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wide sm:text-[11px]">
          <FiTruck size={14} className="text-[#D4AF37]" />
          <span>Premium Fashion</span>
          <span className="text-white/50">•</span>
          <span className="hidden sm:inline">Free Shipping Above ₹{siteSettings?.freeDeliveryThreshold || '999'}</span>
        </div>

        <div className="absolute left-1/2 hidden -translate-x-1/2 lg:flex">
          <div className="flex items-center gap-3 rounded-full border border-[#007A8A]/20 bg-white/5 px-4 py-1 backdrop-blur-xl">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#007A8A]">✦ New Arrivals</span>
            <div className="h-3 w-px bg-[#007A8A]/30" />
            <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 ${isBackendConnected ? "bg-[#007A8A]/10 text-[#007A8A]" : "bg-[#D4AF37]/10 text-[#D4AF37]"}`}>
              {isBackendConnected ? (
                <><span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#007A8A] opacity-75"></span><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#007A8A]"></span></span><span className="text-[9px] font-extrabold uppercase tracking-[0.2em]">Live</span></>
              ) : (
                <><FiShoppingBag size={10} /><span className="text-[9px] font-extrabold uppercase tracking-[0.2em]">Shop</span></>
              )}
            </div>
            <div className="h-3 w-px bg-[#007A8A]/30" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#007A8A]">✦ Premium</span>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <div className="flex items-center gap-2.5 text-gray-300">
            <a href={siteSettings?.instagram || "https://instagram.com"} target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors"><FiInstagram size={13} /></a>
            <a href={siteSettings?.whatsapp || "https://wa.me/919876543210"} target="_blank" rel="noopener noreferrer" className="hover:text-[#007A8A] transition-colors"><FaWhatsapp size={13} /></a>
            <a href={siteSettings?.facebook || "https://facebook.com"} target="_blank" rel="noopener noreferrer" className="hover:text-[#2E3192] transition-colors"><FaFacebookF size={11} /></a>
          </div>
          <span className="h-4 w-px bg-white/20" />
          <a href={`tel:${siteSettings?.contactPhone || '+919876543210'}`} className="flex items-center gap-1.5 text-[11px] font-bold text-gray-200 hover:text-[#D4AF37] transition-colors">
            <FiPhone size={12} />
            <span>{siteSettings?.contactPhone || '+91 98765 43210'}</span>
          </a>
        </div>
      </div>

      {/* 2. MAIN HEADER - Updated Colors */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 shadow-[0_2px_12px_rgba(0,0,0,0.06)] backdrop-blur-md">
        <div className="mx-auto flex h-[64px] max-w-[1600px] items-center px-4 sm:px-6 lg:px-12">
          {/* Logo */}
          <div className="flex shrink-0 items-center">
            <button
              onClick={() => onNavigate("home")}
              className="transition-opacity hover:opacity-80"
            >
              <img
                src="/assets/logo.png"
                alt="Kabiraaz Fashion"
                className="h-14 w-auto sm:h-16 md:h-20 lg:h-15 object-contain"
              />
            </button>
          </div>

          {/* Navigation with Kabiraaz Colors */}
          <nav className="hidden flex-1 items-center justify-center gap-3 lg:flex xl:gap-5">
            {menuItems.map((item) => {
              const active = isMenuActive(item);
              return (
                <div key={item.name} className="relative flex h-[64px] items-center" onMouseEnter={() => item.category && setMegaMenuCategory(item.category)} onMouseLeave={() => setMegaMenuCategory(null)}>
                  <button type="button" onClick={() => handleMenuNavigate(item)} className={`relative flex items-center gap-1 text-[12px] font-extrabold uppercase tracking-wide transition-all duration-200 hover:text-[#D4AF37] ${active ? "text-[#D4AF37]" : "text-[#1A1A3A]"}`}>
                    {item.name}
                    {item.dropdown && <FiChevronDown size={12} className={active ? "text-[#D4AF37]" : "text-[#1A1A3A]"} />}
                    {active && <span className="absolute -bottom-5 left-0 h-[2px] w-full bg-[#D4AF37]" />}
                  </button>

                  <AnimatePresence>
                    {item.category && megaMenuCategory === item.category && (
                      <motion.div ref={megaMenuRef} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }} className="absolute left-1/2 top-full z-50 mt-0 grid w-[500px] -translate-x-1/2 grid-cols-3 gap-4 rounded-b-2xl border border-gray-100 bg-white p-4 shadow-2xl">
                        <div className="border-r border-gray-100 pr-3">
                          <h4 className="mb-2 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[#1A1A3A]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />Shop {item.category}
                          </h4>
                          <ul className="space-y-1 text-xs text-[#333333]">
                            <li><button onClick={() => { onNavigate("shop", { category: item.category }); setMegaMenuCategory(null); }} className="block w-full text-left text-[11px] font-medium py-1 transition-all hover:translate-x-1 hover:text-[#D4AF37]">All {item.category}</button></li>
                            <li><button onClick={() => { onNavigate("shop", { category: item.category, filter: "best" }); setMegaMenuCategory(null); }} className="block w-full text-left text-[11px] font-medium py-1 transition-all hover:translate-x-1 hover:text-[#D4AF37]">Best Sellers</button></li>
                            <li><button onClick={() => { onNavigate("shop", { category: item.category, filter: "trending" }); setMegaMenuCategory(null); }} className="block w-full text-left text-[11px] font-medium py-1 text-[#D4AF37] transition-all hover:translate-x-1">✦ Trending</button></li>
                            <li><button onClick={() => { onNavigate("shop", { category: item.category, filter: "deal" }); setMegaMenuCategory(null); }} className="block w-full text-left text-[11px] font-medium py-1 text-[#007A8A] transition-all hover:translate-x-1">% Deals</button></li>
                          </ul>
                        </div>
                        <div className="border-r border-gray-100 pr-3">
                          <h4 className="mb-2 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[#1A1A3A]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#007A8A]" />Styles
                          </h4>
                          <ul className="space-y-1 text-xs text-[#333333]">
                            {["Premium Classics", "Seasonal '26", "Loungewear", "Minimalist"].map((label) => (
                              <li key={label}><button onClick={() => { onNavigate("shop", { category: item.category }); setMegaMenuCategory(null); }} className="block w-full text-left text-[11px] font-medium py-1 transition-all hover:translate-x-1 hover:text-[#D4AF37]">{label}</button></li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex flex-col justify-between">
                          <div>
                            <h4 className="mb-1 text-[9px] font-bold uppercase tracking-wider text-[#1A1A3A]">Featured</h4>
                            <div className="group relative h-10 overflow-hidden rounded-lg">
                              <img src={item.category === "Men" ? "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=300" : item.category === "Women" ? "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=300" : "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?q=80&w=300"} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A3A]/35"><button onClick={() => { onNavigate("shop", { category: item.category }); setMegaMenuCategory(null); }} className="rounded-full bg-white px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-[#1A1A3A] shadow-sm hover:bg-[#D4AF37] hover:text-white transition-colors">Explore</button></div>
                            </div>
                          </div>
                          <div className="mt-2 rounded-lg border border-slate-100 bg-[#F8F8F8] p-1.5 text-center">
                            <span className="block text-[7px] font-bold uppercase tracking-widest text-[#333333]">Offer</span>
                            <div className="mt-0.5 flex items-center justify-center gap-1">
                              <span className="text-[9px] font-black text-[#1A1A3A]">15% OFF:</span>
                              <span className="rounded border border-dashed border-[#007A8A] bg-white px-1 py-0.5 font-mono text-[9px] font-bold text-[#D4AF37]">LUXE15</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          {/* Right Actions with Updated Colors */}
          <div className="ml-auto flex items-center gap-2 md:gap-3">
            <button onClick={() => setSearchOpen(true)} className="p-2 text-[#1A1A3A] transition-colors hover:text-[#D4AF37]">
              <FiSearch size={20} />
            </button>

            <button type="button" onClick={handleUserClick} className="flex items-center gap-2 p-1.5 text-[#1A1A3A] transition-colors hover:text-[#D4AF37]" title={currentUser ? "Dashboard" : "Sign In"}>
              <FiUser size={20} />
              <span className="hidden max-w-[70px] truncate text-[12px] font-semibold sm:inline-block">{currentUser ? firstName : "Account"}</span>
            </button>

            <button onClick={() => onNavigate("wishlist")} className="relative hidden p-2 text-[#1A1A3A] transition-colors hover:text-[#D4AF37] md:block">
              <FiHeart size={20} />
              {wishlistItems.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D4AF37] text-[9px] font-bold text-white">{wishlistItems.length}</span>
              )}
            </button>

            <button onClick={() => onNavigate('cart')} className="relative p-2 text-[#1A1A3A] transition-colors hover:text-[#D4AF37]">
              <FiShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D4AF37] text-[9px] font-bold text-white">{cartCount}</span>
              )}
            </button>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-[#1A1A3A] transition-colors hover:text-[#D4AF37] lg:hidden">
              <FiMenu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* 3. SEARCH OVERLAY - Updated Colors */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex justify-center bg-[#1A1A3A]/60 px-4 pt-20 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}>
            <motion.div initial={{ scale: 0.95, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -20 }} className="flex max-h-[480px] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
              <form onSubmit={handleSearchSubmit} className="flex items-center border-b border-gray-100 p-4">
                <FiSearch size={18} className="mr-3 text-[#007A8A]" />
                <input type="text" placeholder="Search cashmere, leather, dresses..." className="w-full text-sm text-[#1A1A3A] placeholder-[#333333] focus:outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
                <button type="button" onClick={() => setSearchOpen(false)} className="ml-3 p-1 text-[#333333] hover:text-[#1A1A3A]"><FiX size={18} /></button>
              </form>
              <div className="flex-1 space-y-5 overflow-y-auto p-5">
                {savedSearches.length > 0 && !searchQuery && (
                  <div>
                    <h5 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#333333]">Recent Searches</h5>
                    <div className="flex flex-wrap gap-2">
                      {savedSearches.map((term, i) => (
                        <button key={i} type="button" onClick={() => { setSearchQuery(term); onNavigate("shop", { search: term }); setSearchOpen(false); }} className="rounded-full bg-[#F8F8F8] px-3 py-1.5 text-[11px] font-medium text-[#333333] transition-all hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]">{term}</button>
                      ))}
                    </div>
                  </div>
                )}
                {searchQuery && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#333333]">Results ({filteredSearchProducts.length})</h5>
                      {filteredSearchProducts.length > 0 && <button type="button" onClick={() => { onNavigate("shop", { search: searchQuery }); setSearchOpen(false); }} className="text-[11px] font-bold text-[#D4AF37] hover:underline">View All</button>}
                    </div>
                    {filteredSearchProducts.length > 0 ? (
                      <div className="space-y-2">
                        {filteredSearchProducts.slice(0, 5).map((item) => (
                          <div key={item.id || item._id} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-[#F8F8F8]" onClick={() => { onNavigate("product-details", { slug: item.slug || item.id || item._id }); setSearchOpen(false); }}>
                            <img src={item.image} alt={item.name} className="h-11 w-11 rounded-lg bg-gray-100 object-cover" />
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-[#333333]">{item.brand || item.category}</p>
                              <p className="line-clamp-1 text-[13px] font-semibold text-[#1A1A3A]">{item.name}</p>
                              <p className="text-[11px] font-bold text-[#D4AF37]">₹{Number(item.price || 0).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : <div className="py-8 text-center text-sm text-[#333333]">No products found for "{searchQuery}"</div>}
                  </div>
                )}
                {!searchQuery && (
                  <div>
                    <h5 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#333333]">Trending</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button type="button" onClick={() => { onNavigate("shop", { category: "Women" }); setSearchOpen(false); }} className="flex items-center justify-between rounded-xl bg-[#F8F8F8] p-2.5 text-left transition-colors hover:bg-[#007A8A]/5"><span className="text-[11px] font-bold text-[#1A1A3A]">Silk Collection</span><FiTrendingUp className="text-[#D4AF37]" size={12} /></button>
                      <button type="button" onClick={() => { onNavigate("shop", { category: "Men" }); setSearchOpen(false); }} className="flex items-center justify-between rounded-xl bg-[#F8F8F8] p-2.5 text-left transition-colors hover:bg-[#007A8A]/5"><span className="text-[11px] font-bold text-[#1A1A3A]">Leather Goods</span><FiTrendingUp className="text-[#D4AF37]" size={12} /></button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. MOBILE MENU - Updated Colors */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 z-50 bg-[#1A1A3A]/60" />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "tween", duration: 0.3 }} className="fixed bottom-0 left-0 top-0 z-50 flex w-3/4 max-w-xs flex-col bg-white p-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <span className="text-lg font-bold uppercase tracking-widest text-[#1A1A3A]">Kabiraaz Fashion</span>
                <button type="button" onClick={() => setMobileMenuOpen(false)} className="rounded-full p-1 hover:bg-[#F8F8F8]"><FiX size={20} className="text-[#1A1A3A]" /></button>
              </div>
              <nav className="flex-1 space-y-2 py-5">
                {menuItems.map((item) => (
                  <button key={item.name} type="button" onClick={() => { handleMenuNavigate(item); setMobileMenuOpen(false); }} className="flex w-full items-center justify-between py-2.5 px-3 text-left text-[14px] font-medium text-[#333333] transition-colors hover:text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/5">
                    <span>{item.name}</span>
                    {item.category && <span className="rounded-full bg-[#F8F8F8] px-2 py-0.5 text-[10px] text-[#007A8A]">{item.category}</span>}
                  </button>
                ))}
              </nav>
              <div className="space-y-2 border-t border-gray-100 pt-4">
                <a href={`tel:${siteSettings?.contactPhone || '+919876543210'}`} className="flex items-center gap-2 text-[13px] text-[#333333] hover:text-[#D4AF37]"><FiPhone size={13} /><span>{siteSettings?.contactPhone || '+91 98765 43210'}</span></a>
                <p className="text-[10px] text-[#333333]">Premium support 24/7</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}