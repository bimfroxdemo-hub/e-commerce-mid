import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { FiGrid, FiList, FiFilter, FiSliders, FiStar, FiX, FiCheck } from 'react-icons/fi';

export default function Shop({ onNavigate, onQuickView, routeParams }) {
  const { products, categories } = useApp();

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

  const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];

  const handleResetFilters = () => {
    setSelectedCategory(""); setSelectedBrand(""); setPriceRange(50000);
    setMinRating(0); setOnlyInStock(false); setSearchQuery("");
    setSortBy("recommended"); setCurrentPageNum(1);
  };

  const filteredProducts = products.filter((product) => {
    if (!product) return false;
    const pCat = (product.category || '').toLowerCase();
    const pBrand = (product.brand || '').toLowerCase();
    const pName = (product.name || '').toLowerCase();
    const pPrice = Number(product.price) || 0;
    const pRating = Number(product.rating) || 0;
    const pStock = Number(product.stock) || 0;
    const pTags = Array.isArray(product.tags) ? product.tags : [];

    if (selectedCategory && pCat !== selectedCategory.toLowerCase()) return false;
    if (selectedBrand && pBrand !== selectedBrand.toLowerCase()) return false;
    if (pPrice > priceRange) return false;
    if (pRating < minRating) return false;
    if (onlyInStock && pStock === 0) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!pName.includes(q) && !pBrand.includes(q) && !pCat.includes(q)) return false;
    }

    if (initialFilter === "deal" && !pTags.includes("deal")) return false;
    if (initialFilter === "trending" && !pTags.includes("trending")) return false;
    if (initialFilter === "best" && !pTags.includes("best-seller")) return false;

    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return (Number(a.price) || 0) - (Number(b.price) || 0);
    if (sortBy === "price-high") return (Number(b.price) || 0) - (Number(a.price) || 0);
    if (sortBy === "rating") return (Number(b.rating) || 0) - (Number(a.rating) || 0);
    if (sortBy === "discount") {
      const dA = (Number(a.oldPrice) || 0) > (Number(a.price) || 0) ? ((Number(a.oldPrice) - Number(a.price)) / Number(a.oldPrice)) * 100 : 0;
      const dB = (Number(b.oldPrice) || 0) > (Number(b.price) || 0) ? ((Number(b.oldPrice) - Number(b.price)) / Number(b.oldPrice)) * 100 : 0;
      return dB - dA;
    }
    return 0;
  });

  const totalItems = sortedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPageNum - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (pageNum) => { setCurrentPageNum(pageNum); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div id="shop-page-wrapper" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-5 border-b border-gray-100">
        <div>
          <nav className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">
            <button onClick={() => onNavigate('home')} className="hover:text-black transition-colors">Home</button><span className="mx-2">/</span><span className="text-gray-800">Shop Boutique</span>
          </nav>
          <h1 className="font-display font-bold text-2xl sm:text-3xl uppercase text-black tracking-tight">Shop Luxury Apparel</h1>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end">
          <button onClick={() => setMobileFilterOpen(true)} className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all lg:hidden cursor-pointer"><FiFilter /><span>Filters</span></button>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider hidden sm:block">Sort:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none cursor-pointer">
              <option value="recommended">Recommended</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option><option value="rating">Top Rated</option><option value="discount">Largest Discount</option>
            </select>
          </div>
          <div className="hidden sm:flex items-center border border-gray-100 rounded-xl p-1 bg-white space-x-1">
            <button onClick={() => setIsListView(false)} className={`p-2 rounded-lg cursor-pointer transition-all ${!isListView ? 'bg-black text-white' : 'text-gray-400'}`}><FiGrid size={14}/></button>
            <button onClick={() => setIsListView(true)} className={`p-2 rounded-lg cursor-pointer transition-all ${isListView ? 'bg-black text-white' : 'text-gray-400'}`}><FiList size={14}/></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="hidden lg:block space-y-8 bg-white p-6 rounded-3xl border border-gray-50 shadow-xs h-fit sticky top-28">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h3 className="font-display font-bold text-sm text-black uppercase tracking-wider flex items-center space-x-2"><FiSliders /><span>Filters</span></h3>
            <button onClick={handleResetFilters} className="text-[10px] uppercase tracking-widest font-bold text-rose-500 hover:underline cursor-pointer">Clear All</button>
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Search</span>
            <input type="text" placeholder="Search products..." className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-black text-xs py-2.5 px-3 rounded-xl focus:outline-none" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPageNum(1); }} />
          </div>
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Category</span>
            <div className="space-y-1.5 text-xs text-gray-500">
              <button onClick={() => { setSelectedCategory(""); setCurrentPageNum(1); }} className={`w-full text-left py-1.5 px-2.5 rounded-lg font-medium transition-colors ${!selectedCategory ? 'bg-black/5 text-black font-bold' : 'hover:bg-slate-50'}`}>All Categories</button>
              {categories.map((cat) => (<button key={cat.id} onClick={() => { setSelectedCategory(cat.slug || cat.name); setCurrentPageNum(1); }} className={`w-full text-left py-1.5 px-2.5 rounded-lg font-medium transition-colors ${selectedCategory === (cat.slug || cat.name) ? 'bg-black/5 text-black font-bold' : 'hover:bg-slate-50'}`}>{cat.name}</button>))}
            </div>
          </div>
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Brand</span>
            <div className="space-y-1.5 text-xs text-gray-500">
              <button onClick={() => { setSelectedBrand(""); setCurrentPageNum(1); }} className={`w-full text-left py-1.5 px-2.5 rounded-lg font-medium transition-colors ${!selectedBrand ? 'bg-black/5 text-black font-bold' : 'hover:bg-slate-50'}`}>All Brands</button>
              {uniqueBrands.map((b) => (<button key={b} onClick={() => { setSelectedBrand(b); setCurrentPageNum(1); }} className={`w-full text-left py-1.5 px-2.5 rounded-lg font-medium transition-colors ${selectedBrand === b ? 'bg-black/5 text-black font-bold' : 'hover:bg-slate-50'}`}>{b}</button>))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center"><span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Max Price</span><span className="text-xs font-bold text-black">₹{priceRange.toLocaleString()}</span></div>
            <input type="range" min="1000" max="50000" step="500" value={priceRange} onChange={(e) => { setPriceRange(Number(e.target.value)); setCurrentPageNum(1); }} className="w-full accent-black cursor-pointer h-1 bg-slate-100 rounded-lg" />
          </div>
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Min Rating</span>
            <div className="flex space-x-1">
              {[4, 4.5, 4.8].map((stars) => (<button key={stars} onClick={() => { setMinRating(minRating === stars ? 0 : stars); setCurrentPageNum(1); }} className={`flex-1 border py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 cursor-pointer transition-all ${minRating === stars ? 'bg-amber-400 text-black border-amber-400' : 'border-gray-100 hover:border-black text-gray-600'}`}><FiStar size={12} className={minRating === stars ? 'fill-current' : ''} /><span>{stars}+</span></button>))}
            </div>
          </div>
          <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
            <input type="checkbox" id="instock-only" checked={onlyInStock} onChange={(e) => { setOnlyInStock(e.target.checked); setCurrentPageNum(1); }} className="rounded text-black focus:ring-black h-4 w-4 border-gray-300" />
            <label htmlFor="instock-only" className="text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer">In Stock Only</label>
          </div>
        </aside>

        <main className="lg:col-span-3 space-y-8">
          {totalItems > 0 ? (
            <>
              <div className="flex items-center justify-between text-xs text-gray-400 pb-2 border-b border-gray-50">
                <p>Showing <span className="text-black font-semibold">{startIndex + 1}–{Math.min(startIndex + itemsPerPage, totalItems)}</span> of <span className="text-black font-semibold">{totalItems}</span> products</p>
              </div>
              <div className={isListView ? 'space-y-6' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'}>
                {paginatedProducts.map((item) => (
                  isListView ? (
                    <div key={item.id || item._id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 p-4 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 cursor-pointer" onClick={() => onNavigate('product-details', { slug: item.slug || item.id || item._id })}>
                      <img src={item.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200'} alt={item.name} className="w-full sm:w-44 aspect-square object-cover rounded-2xl bg-slate-50" />
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.brand || 'Luxe'}</span>
                          <h3 className="font-display font-semibold text-base text-gray-800">{item.name}</h3>
                          <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-50 mt-4">
                          <div className="flex items-baseline space-x-2">
                            <span className="text-lg font-bold text-black">₹{(Number(item.price) || 0).toLocaleString()}</span>
                            {(Number(item.oldPrice) || 0) > (Number(item.price) || 0) && <span className="text-xs text-gray-400 line-through">₹{(Number(item.oldPrice) || 0).toLocaleString()}</span>}
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); onQuickView && onQuickView(item); }} className="bg-black hover:bg-gray-800 text-white text-xs font-bold px-5 py-2 rounded-xl uppercase tracking-widest transition-colors cursor-pointer">Quick View</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <ProductCard key={item.id || item._id} product={item} onNavigate={onNavigate} onQuickView={onQuickView} />
                  )
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 pt-8 border-t border-gray-100">
                  <button disabled={currentPageNum === 1} onClick={() => handlePageChange(currentPageNum - 1)} className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 disabled:opacity-40 cursor-pointer">Prev</button>
                  {Array.from({ length: totalPages }).map((_, i) => (<button key={i} onClick={() => handlePageChange(i + 1)} className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentPageNum === i + 1 ? 'bg-black text-white' : 'border border-gray-200 text-gray-600'}`}>{i + 1}</button>))}
                  <button disabled={currentPageNum === totalPages} onClick={() => handlePageChange(currentPageNum + 1)} className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 disabled:opacity-40 cursor-pointer">Next</button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 space-y-4">
              <FiSliders size={48} className="mx-auto text-gray-300" />
              <h3 className="text-lg font-bold text-gray-800">No Products Found</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">Try adjusting your filters or search query.</p>
              <button onClick={handleResetFilters} className="bg-black text-white text-xs font-bold px-6 py-2.5 rounded-full uppercase tracking-widest cursor-pointer">Reset Filters</button>
            </div>
          )}
        </main>
      </div>

      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex justify-end">
          <div className="bg-white w-full max-w-xs h-full overflow-y-auto p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
                <h3 className="font-display font-bold text-sm text-black uppercase">Filters</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1 hover:bg-slate-100 rounded-full"><FiX size={24} /></button>
              </div>
              <div className="space-y-6">
                <div className="space-y-2"><span className="text-xs font-bold text-gray-700 uppercase block">Search</span><input type="text" className="w-full bg-slate-50 border py-2.5 px-3 rounded-xl focus:outline-none text-xs" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
                <div className="space-y-2"><span className="text-xs font-bold text-gray-700 uppercase block">Category</span><div className="grid grid-cols-2 gap-2 text-xs">{categories.map((cat) => (<button key={cat.id} onClick={() => setSelectedCategory(selectedCategory === (cat.slug || cat.name) ? "" : (cat.slug || cat.name))} className={`py-2 px-3 rounded-xl font-semibold border text-left truncate ${selectedCategory === (cat.slug || cat.name) ? 'bg-black/5 text-black border-black/20' : 'border-gray-100 text-gray-600'}`}>{cat.name}</button>))}</div></div>
                <div className="space-y-3"><div className="flex justify-between"><span className="text-xs font-bold text-gray-700 uppercase">Max Price</span><span className="text-xs font-bold">₹{priceRange.toLocaleString()}</span></div><input type="range" min="1000" max="50000" step="500" value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))} className="w-full accent-black h-1" /></div>
              </div>
            </div>
            <div className="pt-6 border-t border-gray-100 grid grid-cols-2 gap-3">
              <button onClick={() => { handleResetFilters(); setMobileFilterOpen(false); }} className="border border-gray-200 text-gray-600 py-3 rounded-xl text-xs font-bold uppercase">Clear</button>
              <button onClick={() => setMobileFilterOpen(false)} className="bg-black text-white py-3 rounded-xl text-xs font-bold uppercase">Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}