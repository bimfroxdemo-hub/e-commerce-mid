import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { FiGrid, FiList, FiFilter, FiSliders, FiStar, FiX, FiTag, FiShoppingBag, FiSearch } from 'react-icons/fi';

export default function Shop({ onNavigate, onQuickView, routeParams }) {
  const { products = [], categories = [] } = useApp();

  const initialCategory = routeParams?.category || "";
  const initialSearch = routeParams?.search || "";
  const initialFilter = routeParams?.filter || "";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [priceRange, setPriceRange] = useState(50000);
  const [minRating, setMinRating] = useState(0);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState("recommended");
  const [isListView, setIsListView] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialSearch) setSearchQuery(initialSearch);
  }, [initialCategory, initialSearch]);

  const uniqueBrands = useMemo(() => {
    return [...new Set(products.map(p => p.brand).filter(Boolean))];
  }, [products]);

  const handleResetFilters = () => {
    setSelectedCategory(""); setSelectedBrand(""); setPriceRange(50000);
    setMinRating(0); setOnlyInStock(false); setSearchQuery("");
    setSortBy("recommended"); setCurrentPageNum(1);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (!product) return false;
      const pCat = (product.category || '').toLowerCase();
      const pBrand = (product.brand || '').toLowerCase();
      const pName = (product.name || '').toLowerCase();
      const pPrice = Number(product.price) || 0;
      const pRating = Number(product.rating) || 0;
      const pStock = Number(product.stock) || 0;
      const pTags = Array.isArray(product.tags) ? product.tags : [];

      if (pPrice > priceRange) return false;
      if (pRating < minRating) return false;
      if (onlyInStock && pStock === 0) return false;
      if (selectedBrand && pBrand !== selectedBrand.toLowerCase()) return false;

      // Safe category mapping matching by Name, Slug, or ObjectId
      if (selectedCategory) {
        const matchedCategory = categories.find(
          c => c.slug?.toLowerCase() === selectedCategory.toLowerCase() || 
               c.name?.toLowerCase() === selectedCategory.toLowerCase() ||
               c._id === selectedCategory ||
               c.id === selectedCategory
        );
        
        const matchesName = pCat === matchedCategory?.name?.toLowerCase();
        const matchesSlug = pCat === matchedCategory?.slug?.toLowerCase();
        const matchesId = product.categoryId === matchedCategory?._id || product.categoryId === matchedCategory?.id;

        if (!matchesName && !matchesSlug && !matchesId) return false;
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!pName.includes(q) && !pBrand.includes(q) && !pCat.includes(q)) return false;
      }

      if (initialFilter === "deal" && !pTags.includes("deal")) return false;
      if (initialFilter === "trending" && !pTags.includes("trending")) return false;
      if (initialFilter === "best" && !pTags.includes("best-seller")) return false;

      return true;
    });
  }, [products, categories, selectedCategory, selectedBrand, priceRange, minRating, onlyInStock, searchQuery, initialFilter]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    if (sortBy === "price-low") return sorted.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    if (sortBy === "price-high") return sorted.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    if (sortBy === "rating") return sorted.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    if (sortBy === "discount") {
      return sorted.sort((a, b) => {
        const dA = (Number(a.oldPrice) || 0) > (Number(a.price) || 0) ? ((Number(a.oldPrice) - Number(a.price)) / Number(a.oldPrice)) * 100 : 0;
        const dB = (Number(b.oldPrice) || 0) > (Number(b.price) || 0) ? ((Number(b.oldPrice) - Number(b.price)) / Number(b.oldPrice)) * 100 : 0;
        return dB - dA;
      });
    }
    return sorted;
  }, [filteredProducts, sortBy]);

  const totalItems = sortedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPageNum - 1) * itemsPerPage;
  const paginatedProducts = useMemo(() => {
    return sortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProducts, startIndex]);

  const handlePageChange = (pageNum) => { 
    setCurrentPageNum(pageNum); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  return (
    <div id="shop-page-wrapper" className="min-h-screen bg-gradient-to-br from-[#F8F8F8] via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-100">
          <div className="mb-4 lg:mb-0">
            {/* Breadcrumb */}
            <nav className="text-[10px] sm:text-xs text-[#333333]/60 font-bold uppercase tracking-wider mb-2 sm:mb-3">
              <button onClick={() => onNavigate('home')} className="hover:text-[#007A8A] transition-colors">Home</button>
              <span className="mx-2 text-gray-300">/</span>
              <span className="text-[#1A1A3A]">Shop Boutique</span>
            </nav>
            
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#007A8A] to-[#2E3192] rounded-xl flex items-center justify-center shadow-lg shadow-[#007A8A]/30">
                <FiShoppingBag size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-black text-xl sm:text-2xl lg:text-3xl text-[#1A1A3A] uppercase tracking-tight">
                  Shop <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007A8A] to-[#2E3192]">Luxury</span>
                </h1>
                <p className="text-[10px] text-[#333333]/60 font-medium mt-0.5">Discover premium fashion collections</p>
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
            {/* Mobile Filter Button */}
            <button 
              onClick={() => setMobileFilterOpen(true)} 
              className="flex-1 lg:hidden flex items-center justify-center gap-2 bg-gradient-to-r from-[#007A8A] to-[#2E3192] text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-lg shadow-[#007A8A]/30 hover:shadow-xl transition-all"
            >
              <FiFilter size={14} />
              <span>Filters</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex-1 lg:flex-none">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)} 
                className="w-full bg-white border border-gray-100 rounded-xl px-3 sm:px-4 py-2.5 text-xs font-bold text-[#333333] focus:outline-none focus:border-[#007A8A] cursor-pointer shadow-sm hover:shadow-md transition-all"
              >
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="rating">Top Rated</option>
                <option value="discount">Best Deals</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="hidden sm:flex items-center border border-gray-100 rounded-xl p-1 bg-white shadow-sm">
              <button 
                onClick={() => setIsListView(false)} 
                className={`p-2 rounded-lg transition-all ${!isListView ? 'bg-gradient-to-br from-[#007A8A] to-[#2E3192] text-white shadow-md' : 'text-gray-400 hover:bg-slate-50'}`}
              >
                <FiGrid size={14}/>
              </button>
              <button 
                onClick={() => setIsListView(true)} 
                className={`p-2 rounded-lg transition-all ${isListView ? 'bg-gradient-to-br from-[#007A8A] to-[#2E3192] text-white shadow-md' : 'text-gray-400 hover:bg-slate-50'}`}
              >
                <FiList size={14}/>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block space-y-5 bg-white p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm h-fit sticky top-28">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-black text-xs sm:text-sm text-[#1A1A3A] uppercase tracking-wider flex items-center gap-2">
                <FiSliders className="text-[#007A8A]" />
                <span>Filters</span>
              </h3>
              <button 
                onClick={handleResetFilters} 
                className="text-[9px] sm:text-[10px] uppercase tracking-widest font-black text-rose-500 hover:text-rose-600 transition-colors"
              >
                Clear All
              </button>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <label className="text-[10px] sm:text-xs font-black text-[#333333] uppercase tracking-wider block flex items-center gap-1.5">
                <FiSearch size={12} className="text-[#007A8A]" />
                Search
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:bg-white focus:border-[#007A8A] text-xs py-2.5 pl-9 pr-3 rounded-xl focus:outline-none transition-all" 
                  value={searchQuery} 
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPageNum(1); }} 
                />
                <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2.5">
              <span className="text-[10px] sm:text-xs font-black text-[#333333] uppercase tracking-wider block">Category</span>
              <div className="space-y-1.5 text-xs text-[#333333]">
                <button 
                  onClick={() => { setSelectedCategory(""); setCurrentPageNum(1); }} 
                  className={`w-full text-left py-2 px-3 rounded-xl font-semibold transition-all ${!selectedCategory ? 'bg-gradient-to-r from-[#007A8A]/10 to-[#2E3192]/10 text-[#1A1A3A] border-[#007A8A]/20 shadow-sm' : 'hover:bg-slate-50'}`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button 
                    key={cat.id} 
                    onClick={() => { setSelectedCategory(cat.slug || cat.name); setCurrentPageNum(1); }} 
                    className={`w-full text-left py-2 px-3 rounded-xl font-semibold transition-all ${selectedCategory === (cat.slug || cat.name) ? 'bg-gradient-to-r from-[#007A8A]/10 to-[#2E3192]/10 text-[#1A1A3A] border-[#007A8A]/20 shadow-sm' : 'hover:bg-slate-50'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2.5">
              <span className="text-[10px] sm:text-xs font-black text-[#333333] uppercase tracking-wider block flex items-center gap-1.5">
                <FiTag size={12} className="text-[#007A8A]" />
                Brand
              </span>
              <div className="space-y-1.5 text-xs text-[#333333]">
                <button 
                  onClick={() => { setSelectedBrand(""); setCurrentPageNum(1); }} 
                  className={`w-full text-left py-2 px-3 rounded-xl font-semibold transition-all ${!selectedBrand ? 'bg-gradient-to-r from-[#007A8A]/10 to-[#2E3192]/10 text-[#1A1A3A] border-[#007A8A]/20 shadow-sm' : 'hover:bg-slate-50'}`}
                >
                  All Brands
                </button>
                {uniqueBrands.map((b) => (
                  <button 
                    key={b} 
                    onClick={() => { setSelectedBrand(b); setCurrentPageNum(1); }} 
                    className={`w-full text-left py-2 px-3 rounded-xl font-semibold transition-all ${selectedBrand === b ? 'bg-gradient-to-r from-[#007A8A]/10 to-[#2E3192]/10 text-[#1A1A3A] border-[#007A8A]/20 shadow-sm' : 'hover:bg-slate-50'}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] sm:text-xs font-black text-[#333333] uppercase tracking-wider">Max Price</span>
                <span className="text-xs font-black text-[#007A8A]">₹{priceRange.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="1000" 
                max="50000" 
                step="500" 
                value={priceRange} 
                onChange={(e) => { setPriceRange(Number(e.target.value)); setCurrentPageNum(1); }} 
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-[#007A8A] [&::-webkit-slider-thumb]:to-[#2E3192] [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer" 
              />
            </div>

            {/* Min Rating */}
            <div className="space-y-2.5">
              <span className="text-[10px] sm:text-xs font-black text-[#333333] uppercase tracking-wider block">Min Rating</span>
              <div className="flex gap-2">
                {[4, 4.5, 4.8].map((stars) => (
                  <button 
                    key={stars} 
                    onClick={() => { setMinRating(minRating === stars ? 0 : stars); setCurrentPageNum(1); }} 
                    className={`flex-1 border py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-sm ${minRating === stars ? 'bg-[#D4AF37] text-[#1A1A3A] border-[#D4AF37] shadow-md shadow-[#D4AF37]/30' : 'border-gray-100 hover:border-[#007A8A] text-[#333333] hover:bg-slate-50'}`}
                  >
                    <FiStar size={12} className={minRating === stars ? 'fill-current' : ''} />
                    <span>{stars}+</span>
                  </button>
                ))}
              </div>
            </div>

            {/* In Stock Only */}
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
              <input 
                type="checkbox" 
                id="instock-only" 
                checked={onlyInStock} 
                onChange={(e) => { setOnlyInStock(e.target.checked); setCurrentPageNum(1); }} 
                className="rounded text-[#007A8A] focus:ring-[#007A8A] h-4 w-4 border-gray-300 cursor-pointer" 
              />
              <label htmlFor="instock-only" className="text-xs font-bold text-[#333333] uppercase tracking-wider cursor-pointer flex-1">
                In Stock Only
              </label>
            </div>
          </aside>

          {/* Products Catalog Display Grid */}
          <main className="lg:col-span-3 space-y-6 sm:space-y-8">
            {totalItems > 0 ? (
              <>
                {/* Results Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#333333]/60 pb-3 border-b border-gray-50">
                  <p>
                    Showing <span className="text-[#1A1A3A] font-black">{startIndex + 1}–{Math.min(startIndex + itemsPerPage, totalItems)}</span> of <span className="text-[#1A1A3A] font-black">{totalItems}</span> products
                  </p>
                  
                  {/* Active Filters */}
                  {(selectedCategory || selectedBrand || searchQuery) && (
                    <div className="flex flex-wrap items-center gap-2">
                      {selectedCategory && (
                        <span className="inline-flex items-center gap-1.5 bg-[#007A8A]/10 text-[#007A8A] px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase">
                          {selectedCategory}
                          <button onClick={() => setSelectedCategory("")} className="hover:bg-[#007A8A]/20 rounded-full p-0.5">
                            <FiX size={12} />
                          </button>
                        </span>
                      )}
                      {selectedBrand && (
                        <span className="inline-flex items-center gap-1.5 bg-[#2E3192]/10 text-[#2E3192] px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase">
                          {selectedBrand}
                          <button onClick={() => setSelectedBrand("")} className="hover:bg-[#2E3192]/20 rounded-full p-0.5">
                            <FiX size={12} />
                          </button>
                        </span>
                      )}
                      {searchQuery && (
                        <span className="inline-flex items-center gap-1.5 bg-[#D4AF37]/10 text-[#D4AF37] px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase">
                          "{searchQuery}"
                          <button onClick={() => setSearchQuery("")} className="hover:bg-[#D4AF37]/20 rounded-full p-0.5">
                            <FiX size={12} />
                          </button>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Products Grid/List */}
                <div className={isListView ? 'space-y-4 sm:space-y-6' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'}>
                  {paginatedProducts.map((item) => (
                    isListView ? (
                      <div 
                        key={item.id || item._id} 
                        className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#007A8A]/20 transition-all duration-300 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 cursor-pointer group" 
                        onClick={() => onNavigate('product-details', { slug: item.slug || item.id || item._id })}
                      >
                        <div className="relative w-full sm:w-44 aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0">
                          <img 
                            src={item.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200'} 
                            alt={item.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          />
                          {item.tags?.includes('deal') && (
                            <span className="absolute top-2 left-2 bg-[#D4AF37] text-[#1A1A3A] text-[9px] font-black uppercase px-2 py-1 rounded-lg shadow-lg">
                              Deal
                            </span>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="space-y-2">
                            <span className="text-[10px] text-[#007A8A] font-black uppercase tracking-widest">{item.brand || 'Kabiraaz'}</span>
                            <h3 className="font-black text-base sm:text-lg text-[#1A1A3A] group-hover:text-[#007A8A] transition-colors">{item.name}</h3>
                            <p className="text-xs text-[#333333]/70 line-clamp-2">{item.description}</p>
                            {item.rating && (
                              <div className="flex items-center gap-1">
                                <FiStar size={14} className="text-[#D4AF37] fill-current" />
                                <span className="text-xs font-bold text-[#333333]">{item.rating}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-4 border-t border-gray-50 mt-4">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl sm:text-2xl font-black text-[#1A1A3A]">₹{(Number(item.price) || 0).toLocaleString()}</span>
                              {(Number(item.oldPrice) || 0) > (Number(item.price) || 0) && (
                                <span className="text-xs text-[#333333]/50 line-through">₹{(Number(item.oldPrice) || 0).toLocaleString()}</span>
                              )}
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); onQuickView && onQuickView(item); }} 
                              className="w-full sm:w-auto bg-gradient-to-r from-[#007A8A] to-[#2E3192] hover:from-[#2E3192] hover:to-[#007A8A] text-white text-xs font-black px-5 py-2.5 rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-[#007A8A]/30 hover:shadow-xl hover:-translate-y-0.5"
                            >
                              Quick View
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <ProductCard 
                        key={item.id || item._id} 
                        product={item} 
                        onNavigate={onNavigate} 
                        onQuickView={onQuickView} 
                      />
                    )
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 pt-8 border-t border-gray-100">
                    <button 
                      disabled={currentPageNum === 1} 
                      onClick={() => handlePageChange(currentPageNum - 1)} 
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-black uppercase tracking-widest hover:bg-gradient-to-r hover:from-[#007A8A] hover:to-[#2E3192] hover:text-white hover:border-transparent disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#333333] transition-all shadow-sm"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                      {Array.from({ length: totalPages }).slice(
                        Math.max(0, currentPageNum - 3),
                        Math.min(totalPages, currentPageNum + 2)
                      ).map((_, i) => {
                        const pageNum = Math.max(0, currentPageNum - 3) + i + 1;
                        return (
                          <button 
                            key={pageNum} 
                            onClick={() => handlePageChange(pageNum)} 
                            className={`min-w-[36px] h-9 rounded-xl text-xs font-black transition-all shadow-sm ${currentPageNum === pageNum ? 'bg-gradient-to-br from-[#007A8A] to-[#2E3192] text-white shadow-md shadow-[#007A8A]/30' : 'border border-gray-200 text-[#333333] hover:border-[#007A8A] hover:bg-slate-50'}`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button 
                      disabled={currentPageNum === totalPages} 
                      onClick={() => handlePageChange(currentPageNum + 1)} 
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-black uppercase tracking-widest hover:bg-gradient-to-r hover:from-[#007A8A] hover:to-[#2E3192] hover:text-white hover:border-transparent disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#333333] transition-all shadow-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 sm:py-24 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 space-y-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#007A8A]/10 to-[#2E3192]/10 rounded-full flex items-center justify-center mx-auto">
                  <FiSliders size={32} className="text-[#007A8A]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-black text-[#1A1A3A] uppercase">No Products Found</h3>
                  <p className="text-xs sm:text-sm text-[#333333]/60 max-w-sm mx-auto">
                    Try adjusting your filters or search query to find what you're looking for.
                  </p>
                </div>
                <button 
                  onClick={handleResetFilters} 
                  className="bg-gradient-to-r from-[#007A8A] to-[#2E3192] hover:from-[#2E3192] hover:to-[#007A8A] text-white text-xs font-black px-6 py-3 rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-[#007A8A]/30 hover:shadow-xl hover:-translate-y-0.5"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          ></div>
          
          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto animate-slide-in-right">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gradient-to-r from-[#1A1A3A] to-[#2E3192]">
                <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                  <FiSliders />
                  Filters & Sorting
                </h3>
                <button 
                  onClick={() => setMobileFilterOpen(false)} 
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#333333] uppercase tracking-wider block">Search</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search products..."
                      className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2.5 pl-9 pr-3 rounded-xl focus:outline-none text-xs transition-all" 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                    />
                    <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <span className="text-xs font-black text-[#333333] uppercase tracking-wider block">Category</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button 
                      onClick={() => setSelectedCategory("")}
                      className={`py-2.5 px-3 rounded-xl font-bold border text-left truncate transition-all ${!selectedCategory ? 'bg-gradient-to-r from-[#007A8A]/10 to-[#2E3192]/10 text-[#1A1A3A] border-[#007A8A]/20' : 'border-gray-100 text-[#333333] hover:bg-slate-50'}`}
                    >
                      All
                    </button>
                    {categories.map((cat) => (
                      <button 
                        key={cat.id} 
                        onClick={() => setSelectedCategory(selectedCategory === (cat.slug || cat.name) ? "" : (cat.slug || cat.name))} 
                        className={`py-2.5 px-3 rounded-xl font-bold border text-left truncate transition-all ${selectedCategory === (cat.slug || cat.name) ? 'bg-gradient-to-r from-[#007A8A]/10 to-[#2E3192]/10 text-[#1A1A3A] border-[#007A8A]/20' : 'border-gray-100 text-[#333333] hover:bg-slate-50'}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                {uniqueBrands.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-black text-[#333333] uppercase tracking-wider block">Brand</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button 
                        onClick={() => setSelectedBrand("")}
                        className={`py-2.5 px-3 rounded-xl font-bold border text-left truncate transition-all ${!selectedBrand ? 'bg-gradient-to-r from-[#007A8A]/10 to-[#2E3192]/10 text-[#1A1A3A] border-[#007A8A]/20' : 'border-gray-100 text-[#333333] hover:bg-slate-50'}`}
                      >
                        All
                      </button>
                      {uniqueBrands.map((b) => (
                        <button 
                          key={b} 
                          onClick={() => setSelectedBrand(selectedBrand === b ? "" : b)}
                          className={`py-2.5 px-3 rounded-xl font-bold border text-left truncate transition-all ${selectedBrand === b ? 'bg-gradient-to-r from-[#007A8A]/10 to-[#2E3192]/10 text-[#1A1A3A] border-[#007A8A]/20' : 'border-gray-100 text-[#333333] hover:bg-slate-50'}`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs font-black text-[#333333] uppercase tracking-wider">Max Price</span>
                    <span className="text-xs font-black text-[#007A8A]">₹{priceRange.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1000" 
                    max="50000" 
                    step="500" 
                    value={priceRange} 
                    onChange={(e) => setPriceRange(Number(e.target.value))} 
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-[#007A8A] [&::-webkit-slider-thumb]:to-[#2E3192] [&::-webkit-slider-thumb]:shadow-lg" 
                  />
                </div>

                {/* Min Rating */}
                <div className="space-y-2.5">
                  <span className="text-xs font-black text-[#333333] uppercase tracking-wider block">Min Rating</span>
                  <div className="flex gap-2">
                    {[4, 4.5, 4.8].map((stars) => (
                      <button 
                        key={stars} 
                        onClick={() => setMinRating(minRating === stars ? 0 : stars)} 
                        className={`flex-1 border py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${minRating === stars ? 'bg-[#D4AF37] text-[#1A1A3A] border-[#D4AF37] shadow-md' : 'border-gray-100 text-[#333333] hover:bg-slate-50'}`}
                      >
                        <FiStar size={12} className={minRating === stars ? 'fill-current' : ''} />
                        <span>{stars}+</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* In Stock */}
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <input 
                    type="checkbox" 
                    id="mobile-instock" 
                    checked={onlyInStock} 
                    onChange={(e) => setOnlyInStock(e.target.checked)} 
                    className="rounded text-[#007A8A] focus:ring-[#007A8A] h-5 w-5 border-gray-300" 
                  />
                  <label htmlFor="mobile-instock" className="text-xs font-bold text-[#333333] uppercase tracking-wider flex-1">
                    Show In Stock Only
                  </label>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-5 border-t border-gray-100 bg-slate-50 grid grid-cols-2 gap-3">
                <button 
                  onClick={() => { handleResetFilters(); setMobileFilterOpen(false); }} 
                  className="border border-gray-200 text-[#333333] py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-white transition-all"
                >
                  Clear All
                </button>
                <button 
                  onClick={() => setMobileFilterOpen(false)} 
                  className="bg-gradient-to-r from-[#007A8A] to-[#2E3192] text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-[#007A8A]/30 hover:shadow-xl transition-all"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}