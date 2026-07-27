import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import {
  FiSearch, FiUser, FiShoppingBag, FiX, FiMenu,
  FiChevronDown, FiTruck
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar({ onNavigate, currentPage }) {
  const {
    cart, currentUser, recentSearches, setRecentSearches,
    products, isBackendConnected, siteSettings, logoutUser
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuCategory, setMegaMenuCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [navMenuSettings, setNavMenuSettings] = useState({});

  const megaMenuRef = useRef(null);
  const searchRef = useRef(null);

  const cartItems = Array.isArray(cart) ? cart : [];
  const allProducts = Array.isArray(products) ? products : [];
  const savedSearches = Array.isArray(recentSearches) ? recentSearches : [];

  const cartCount = cartItems.reduce((acc, item) => acc + Number(item.quantity || 0), 0);
  const firstName = currentUser?.name?.split(" ")?.[0] || "Login";
  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  // Load navigation settings
  useEffect(() => {
    try {
      const savedNavSettings = localStorage.getItem('kabiraaz_nav_settings');
      if (savedNavSettings) {
        setNavMenuSettings(JSON.parse(savedNavSettings));
      }
    } catch (error) {
      console.warn("Failed to load navigation settings:", error);
    }
  }, []);

  const filteredSearchProducts = searchQuery
    ? allProducts.filter((p) => {
      const q = searchQuery.toLowerCase();
      return p?.name?.toLowerCase().includes(q) || p?.category?.toLowerCase().includes(q) || p?.brand?.toLowerCase().includes(q);
    })
    : [];

  // Enhanced Menu Structure
  const menuItems = [
    { name: "Home", id: "home" },
    { name: "Shop", id: "shop" },
    {
      name: "Men",
      id: "shop",
      category: "Men",
      dropdown: true,
      subMenus: [
        { name: "T-Shirts & Polos", filter: "tshirts", enabled: navMenuSettings.menTshirts !== false },
        { name: "Jeans & Trousers", filter: "jeans", enabled: navMenuSettings.menJeans !== false },
        { name: "Shirts & Blazers", filter: "shirts", enabled: navMenuSettings.menShirts !== false },
        { name: "Sportswear", filter: "sports", enabled: navMenuSettings.menSports !== false },
        { name: "Footwear", filter: "footwear", enabled: navMenuSettings.menFootwear !== false },
        { name: "Accessories", filter: "accessories", enabled: navMenuSettings.menAccessories !== false }
      ]
    },
    {
      name: "Women",
      id: "shop",
      category: "Women",
      dropdown: true,
      subMenus: [
        { name: "Dresses & Gowns", filter: "dresses", enabled: navMenuSettings.womenDresses !== false },
        { name: "Tops & Blouses", filter: "tops", enabled: navMenuSettings.womenTops !== false },
        { name: "Ethnic Wear", filter: "ethnic", enabled: navMenuSettings.womenEthnic !== false },
        { name: "Western Wear", filter: "western", enabled: navMenuSettings.womenWestern !== false },
        { name: "Lingerie", filter: "lingerie", enabled: navMenuSettings.womenLingerie !== false },
        { name: "Footwear", filter: "footwear", enabled: navMenuSettings.womenFootwear !== false },
        { name: "Bags & Jewelry", filter: "accessories", enabled: navMenuSettings.womenAccessories !== false }
      ]
    },
    {
      name: "Kids",
      id: "shop",
      category: "Kids",
      dropdown: true,
      subMenus: [
        { name: "Boys Clothing", filter: "boys", enabled: navMenuSettings.kidsBoys !== false },
        { name: "Girls Clothing", filter: "girls", enabled: navMenuSettings.kidsGirls !== false },
        { name: "Baby Wear", filter: "baby", enabled: navMenuSettings.kidsBaby !== false },
        { name: "School Uniforms", filter: "uniforms", enabled: navMenuSettings.kidsUniforms !== false },
        { name: "Kids Footwear", filter: "footwear", enabled: navMenuSettings.kidsFootwear !== false },
        { name: "Toys & Games", filter: "toys", enabled: navMenuSettings.kidsToys !== false }
      ]
    },
    { name: "Contact", id: "contact" },
  ];

  const handleMenuNavigate = (item, subMenu = null) => {
    if (subMenu) {
      const params = {
        category: item.category,
        subcategory: subMenu.filter,
        filter: subMenu.filter
      };
      onNavigate(item.id, params);
    } else {
      const params = item.category ? { category: item.category } : item.params;
      if (params) onNavigate(item.id, params);
      else onNavigate(item.id);
    }
  };

  const isMenuActive = (item) => {
    if (item.name === "Home") return currentPage === "home";
    if (item.name === "Shop") return currentPage === "shop";
    if (item.name === "Contact") return currentPage === "contact";
    return false;
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const term = searchQuery.trim();
    if (term) {
      if (!savedSearches.includes(term)) setRecentSearches([term, ...savedSearches.slice(0, 4)]);
      onNavigate("shop", { search: term });
      setSearchQuery("");
      setSearchFocused(false);
    }
  };

  const handleUserClick = () => {
    if (currentUser) onNavigate(isAdmin ? "admin-dashboard" : "user-dashboard");
    else onNavigate("login");
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setSearchFocused(false);
        setMobileMenuOpen(false);
        setMegaMenuCategory(null);
        setProfileOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#1A1A3A] text-white text-xs py-1.5">
        <div className="w-full px-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <FiTruck size={12} className="text-[#D4AF37]" />
                <span className="font-medium">Free Delivery Above ₹{siteSettings?.freeDeliveryThreshold || '999'}</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-400' : 'bg-[#D4AF37]'}`}></div>
                <span className="font-medium">{isBackendConnected ? 'Store Online' : 'Local Mode'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              {/* ✅ REDIRECTS TO SELLER LANDING HOME GATEWAY */}
              <button
                onClick={() => onNavigate('seller-landing')}
                className="hover:text-amber-400 transition cursor-pointer"
              >
                Become a Seller
              </button>
              <span className="hidden md:inline hover:underline cursor-pointer">Customer Care</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white shadow-md border-b border-gray-200">
        <div className="w-full px-4">
          <div className="flex items-center justify-between h-20 max-w-7xl mx-auto">

            {/* Logo Section */}
            <div className="flex-shrink-0 w-40 sm:w-48 lg:w-56">
              <button
                onClick={() => onNavigate("home")}
                className="block w-full focus:outline-none h-full flex items-center"
              >
                <img
                  src="/assets/logo.png"
                  alt="Kabiraaz Fashion"
                  className="h-16 sm:h-[72px] lg:h-20 w-auto object-contain transform translate-y-[2px]"
                />
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-4" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full h-10 pl-4 pr-12 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  />
                  <button
                    type="submit"
                    className="absolute right-0 h-full px-4 bg-[#D4AF37] text-white hover:bg-[#B8941F] transition-colors rounded-r-lg"
                  >
                    <FiSearch size={16} />
                  </button>
                </div>

                {/* Enhanced Search Dropdown */}
                <AnimatePresence>
                  {searchQuery && searchFocused && filteredSearchProducts.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-xl max-h-80 overflow-y-auto z-50"
                    >
                      <div className="p-2">
                        {filteredSearchProducts.slice(0, 5).map((item) => (
                          <div
                            key={item.id || item._id}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer rounded transition-colors"
                            onClick={() => {
                              onNavigate("product-details", { slug: item.slug || item.id || item._id });
                              setSearchQuery("");
                              setSearchFocused(false);
                            }}
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                              <p className="text-sm font-semibold text-[#D4AF37]">₹{Number(item.price || 0).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>

            {/* Enhanced Desktop Menu */}
            <nav className="hidden lg:flex items-center gap-6">
              {menuItems.map((item) => {
                const active = isMenuActive(item);
                return (
                  <div
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => item.category && setMegaMenuCategory(item.category)}
                    onMouseLeave={() => setMegaMenuCategory(null)}
                  >
                    <button
                      onClick={() => handleMenuNavigate(item)}
                      className={`flex items-center gap-1 px-3 py-2 text-sm font-semibold transition-colors hover:text-[#D4AF37] ${active ? 'text-[#D4AF37]' : 'text-[#1A1A3A]'
                        }`}
                    >
                      {item.name}
                      {item.dropdown && <FiChevronDown size={14} />}
                    </button>

                    {/* Enhanced Mega Menu with Sub-categories */}
                    <AnimatePresence>
                      {item.dropdown && item.category && megaMenuCategory === item.category && (
                        <motion.div
                          ref={megaMenuRef}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl p-5 z-50"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-[#1A1A3A] mb-3">{item.category} Categories</h4>
                              <ul className="space-y-2">
                                {item.subMenus?.filter(sub => sub.enabled).slice(0, 4).map((subMenu) => (
                                  <li key={subMenu.filter}>
                                    <button
                                      onClick={() => {
                                        handleMenuNavigate(item, subMenu);
                                        setMegaMenuCategory(null);
                                      }}
                                      className="text-sm text-gray-600 hover:text-[#D4AF37] transition-colors block w-full text-left py-1"
                                    >
                                      {subMenu.name}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold text-[#1A1A3A] mb-3">Quick Links</h4>
                              <ul className="space-y-2">
                                <li>
                                  <button
                                    onClick={() => { onNavigate("shop", { category: item.category }); setMegaMenuCategory(null); }}
                                    className="text-sm text-gray-600 hover:text-[#D4AF37] transition-colors block w-full text-left py-1"
                                  >
                                    All {item.category}
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => { onNavigate("shop", { category: item.category, filter: "trending" }); setMegaMenuCategory(null); }}
                                    className="text-sm text-[#D4AF37] font-medium block w-full text-left py-1"
                                  >
                                    🔥 Trending
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => { onNavigate("shop", { category: item.category, filter: "deal" }); setMegaMenuCategory(null); }}
                                    className="text-sm text-[#007A8A] font-medium block w-full text-left py-1"
                                  >
                                    💥 Best Deals
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => { onNavigate("shop", { category: item.category, filter: "new" }); setMegaMenuCategory(null); }}
                                    className="text-sm text-green-600 font-medium block w-full text-left py-1"
                                  >
                                    ✨ New Arrivals
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[#1A1A3A] hover:text-[#D4AF37] transition-colors"
                >
                  <FiUser size={16} />
                  <span className="hidden sm:inline">{firstName}</span>
                  <FiChevronDown size={12} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50"
                    >
                      {currentUser ? (
                        <>
                          <button
                            onClick={() => { onNavigate(isAdmin ? "admin-dashboard" : "user-dashboard"); setProfileOpen(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            My Profile
                          </button>
                          <button
                            onClick={() => { logoutUser(); setProfileOpen(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Logout
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => { onNavigate("login"); setProfileOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Login / Sign Up
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart */}
              <button
                onClick={() => onNavigate('cart')}
                className="relative flex items-center gap-1 px-3 py-2 text-sm font-medium text-[#1A1A3A] hover:text-[#D4AF37] transition-colors"
              >
                <FiShoppingBag size={16} />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-[#1A1A3A] hover:text-[#D4AF37] transition-colors"
              >
                <FiMenu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-white z-50 overflow-y-auto lg:hidden"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <img
                    src="/assets/logo.png"
                    alt="Kabiraaz Fashion"
                    className="h-12 transform translate-y-[1px]"
                  />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <div className="space-y-2">
                  {menuItems.map((item) => (
                    <div key={item.name}>
                      <button
                        onClick={() => { handleMenuNavigate(item); setMobileMenuOpen(false); }}
                        className="flex items-center justify-between w-full px-3 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-[#D4AF37] rounded-lg transition-colors font-medium"
                      >
                        <span>{item.name}</span>
                        {item.dropdown && <FiChevronDown size={14} />}
                      </button>

                      {/* Mobile Sub Menu */}
                      {item.subMenus && (
                        <div className="ml-4 space-y-1">
                          {item.subMenus.filter(sub => sub.enabled).map((subMenu) => (
                            <button
                              key={subMenu.filter}
                              onClick={() => {
                                handleMenuNavigate(item, subMenu);
                                setMobileMenuOpen(false);
                              }}
                              className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-[#D4AF37] transition-colors"
                            >
                              {subMenu.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}