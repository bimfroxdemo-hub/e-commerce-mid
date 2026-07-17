import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FiHeart, FiShoppingBag, FiStar, FiTruck, FiShield, FiCornerDownLeft, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';

export default function ProductDetails({ routeParams, onNavigate, onQuickView }) {
  const { products, cart, wishlist, toggleWishlist, addToCart, trackProductView } = useApp();
  const slug = routeParams?.slug;

  const product = products.find((p) => p.slug === slug || p.id === slug || p._id === slug) || products[0];

  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    if (product) {
      setActiveImage(product.image || '');
      if (trackProductView) trackProductView(product);
    }
  }, [product]);

  if (!product) return (
    <div className="flex items-center justify-center min-h-[50vh] bg-[#F8F8F8]">
       <div className="text-center space-y-4">
         <h2 className="text-xl font-bold text-[#1A1A3A] uppercase tracking-wider">Product Not Found</h2>
         <button onClick={() => onNavigate('shop')} className="text-sm text-[#007A8A] font-bold uppercase hover:underline">Return to Shop</button>
       </div>
    </div>
  );

  const productId = product.id || product._id;
  const productSlug = product.slug || product.id || product._id;
  const productStock = Number(product.stock) || 0;
  const isInStock = productStock > 0;
  const productPrice = Number(product.price) || 0;
  const productOldPrice = Number(product.oldPrice) || 0;
  const discountPercent = productOldPrice > productPrice ? Math.round(((productOldPrice - productPrice) / productOldPrice) * 100) : 0;

  const isWishlisted = wishlist.some((item) => item.id === productId || item._id === productId);
  const isInCart = cart.some((item) => item.id === productId || item._id === productId);

  const handleAddToCart = () => {
    if (!isInStock) { toast.error("This item is currently out of stock."); return; }
    addToCart(product, qty);
    toast.success(`${qty}x ${product.name} added to bag!`, { style: { background: '#1A1A3A', color: '#fff' } });
  };

  const handleBuyNow = () => {
    if (!isInStock) { toast.error("This item is currently out of stock."); return; }
    addToCart(product, qty);
    onNavigate('checkout');
  };

  const handleWishlist = () => {
    toggleWishlist(product);
    if (!isWishlisted) { toast.success("Added to wishlist", { icon: '❤️' }); }
    else { toast.error("Removed from wishlist"); }
  };

  const relatedProducts = products.filter((p) => (p.category || '').toLowerCase() === (product.category || '').toLowerCase() && (p.id || p._id) !== productId).slice(0, 4);

  return (
    <div id="product-details-page" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-fade-in bg-[#F8F8F8]">
      
      {/* Breadcrumbs */}
      <nav className="text-xs sm:text-sm text-[#6B7280] font-medium uppercase tracking-wider flex flex-wrap items-center gap-2 pb-4 border-b border-[#E0E0E0] mb-4 sticky top-0 z-10 bg-[#F8F8F8]/95 backdrop-blur-md pt-2 sm:pt-4 -mx-4 px-4 sm:-mx-6 lg:-mx-8">
        <button onClick={() => onNavigate('home')} className="hover:text-[#007A8A] transition-colors">Home</button>
        <span className="text-gray-400">/</span>
        <button onClick={() => onNavigate('shop')} className="hover:text-[#007A8A] transition-colors">Shop</button>
        <span className="text-gray-400">/</span>
        <span className="text-[#1A1A3A] font-bold truncate max-w-[200px]" title={product.name}>{product.name}</span>
      </nav>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">
        
        {/* LEFT COLUMN: Image Gallery */}
        <div className="lg:col-span-7 space-y-6">
          <div className="aspect-[3/4] md:aspect-[4/5] w-full rounded-2xl overflow-hidden bg-white border border-[#E0E0E0] relative group shadow-sm">
            <img 
              src={activeImage || product.image} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-zoom-in" 
              onClick={() => onQuickView(product)} // Add quick view on image click
            />
            
            {/* Badges */}
            {discountPercent > 0 && (
                <div className="absolute top-4 left-4 z-20">
                    <span className="bg-[#D4AF37] text-[#1A1A3A] text-[10px] sm:text-xs font-black uppercase tracking-widest px-3.5 py-2 rounded-full shadow-lg transform rotate-[-2deg]">
                        {discountPercent}% OFF
                    </span>
                </div>
            )}

            {/* Quick View Overlay Hint */}
            {!isInStock && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <span className="bg-[#1A1A3A] text-white text-sm font-bold uppercase tracking-wide px-4 py-2 rounded-full">Out of Stock</span>
                </div>
            )}
          </div>
          
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex flex-wrap sm:flex-nowrap gap-3">
              {(product.images || []).map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(img)} 
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 bg-[#F8F8F8] cursor-pointer group-thumb ${
                    activeImage === img 
                      ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/20 scale-105' 
                      : 'border-transparent hover:border-[#E0E0E0]'
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform" />
                  {activeImage === img && (
                    <span className="absolute bottom-0 right-0 bg-[#D4AF37] w-2 h-2 rounded-tl-sm"></span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Product Details & Actions */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-8 sticky top-24 self-start">
          <div className="space-y-6">
            
            {/* Header Info */}
            <div className="space-y-3">
                <div className="flex justify-between items-start">
                    <span className="text-[10px] sm:text-xs text-[#333333] font-bold uppercase tracking-widest border border-[#E0E0E0] px-2 py-0.5 rounded-full">
                        {product.brand || 'Luxe Atelier'}
                    </span>
                    <div className="flex items-center space-x-1 bg-[#F8F8F8] px-2 py-1 rounded-lg">
                        <FiStar size={12} className="text-[#D4AF37] fill-[#D4AF37]" />
                        <span className="text-xs font-bold text-[#1A1A3A]">{product.rating || 5.0}</span>
                        <span className="text-[10px] text-[#6B7280]">({product.reviewsCount || 0})</span>
                    </div>
                </div>
                
                <h1 className="font-display font-extrabold text-2xl md:text-3xl text-[#1A1A3A] uppercase tracking-tight leading-tight">
                    {product.name}
                </h1>
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-3 border-l-4 border-[#D4AF37] pl-4">
                <span className="text-3xl sm:text-4xl font-bold text-[#1A1A3A] font-mono">₹{productPrice.toLocaleString()}</span>
                {productOldPrice > productPrice && (
                    <span className="text-base sm:text-lg text-[#6B7280] line-through font-mono">₹{productOldPrice.toLocaleString()}</span>
                )}
                {productOldPrice > productPrice && (
                    <span className="text-xs font-bold text-[#007A8A] ml-2 self-start">Save {discountPercent}%</span>
                )}
            </div>
            
            {/* Description */}
            <p className="text-sm text-[#333333] leading-relaxed opacity-90">
                {product.description || "Premium quality fashion addition crafted for elegance."}
            </p>
            
            {/* Stock Status */}
            <div className={`flex items-center gap-2 p-3 rounded-xl border ${
                isInStock 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                : 'bg-red-50 text-red-800 border-red-100'
            }`}>
                <div className={`w-2 h-2 rounded-full ${isInStock ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                <span className="text-xs font-bold uppercase tracking-wide">{isInStock ? `In Stock (${productStock} available)` : 'Sold Out'}</span>
            </div>

            {/* Size Selector */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#1A1A3A] uppercase tracking-wider">Select Size</span>
                <button className="text-[10px] text-[#007A8A] underline hover:text-[#1A1A3A]">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {["S", "M", "L", "XL"].map((sz) => (
                  <button 
                    key={sz} 
                    onClick={() => setSelectedSize(sz)} 
                    className={`min-w-[3rem] h-12 rounded-xl text-sm font-bold border transition-all cursor-pointer shadow-sm ${
                        selectedSize === sz 
                            ? 'bg-[#1A1A3A] text-white border-[#1A1A3A] shadow-md' 
                            : 'bg-white text-[#333333] border-[#E0E0E0] hover:border-[#007A8A] hover:text-[#007A8A]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-3 pt-4 items-center">
                
                {/* Quantity Stepper */}
                <div className="flex items-center justify-between border border-[#E0E0E0] rounded-xl px-3 py-2 bg-white min-w-[110px]">
                    <button 
                        onClick={() => setQty(Math.max(1, qty - 1))} 
                        className="p-1 text-[#333333] hover:text-[#007A8A] transition-colors"
                    >-</button>
                    <span className="font-bold text-[#1A1A3A] w-4 text-center">{qty}</span>
                    <button 
                        onClick={() => setQty(Math.min(productStock, qty + 1))} 
                        className="p-1 text-[#333333] hover:text-[#007A8A] transition-colors"
                    >+</button>
                </div>

                {/* Add to Cart Button */}
                <button 
                    onClick={handleAddToCart} 
                    disabled={!isInStock} 
                    className={`w-full sm:w-auto py-3 px-6 rounded-xl text-sm font-extrabold uppercase tracking-widest transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                        !isInStock 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-[#D4AF37] hover:bg-[#B8941F] text-[#1A1A3A] hover:text-[#1A1A3A]'
                    }`}
                >
                    <FiShoppingBag size={16} /> 
                    {isInCart ? 'Added to Bag' : 'Add To Bag'}
                </button>

                {/* Buy Now & Wishlist Buttons Mobile (if space allows) or Desktop */}
                <div className="flex sm:gap-3 items-center col-span-full sm:col-span-1 justify-between sm:justify-end">
                     <button 
                        onClick={handleBuyNow} 
                        disabled={!isInStock} 
                        className={`hidden sm:inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all shadow-sm ${
                            !isInStock ? 'bg-gray-100 text-gray-400' : 'bg-[#1A1A3A] hover:bg-[#2E3192] text-white'
                        }`}
                     >
                        Buy Now
                     </button>
                     
                     <button 
                        onClick={handleWishlist} 
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                            isWishlisted 
                                ? 'bg-[#D4AF37] border-[#D4AF37] text-[#1A1A3A]' 
                                : 'border-[#E0E0E0] text-[#6B7280] hover:border-[#007A8A] hover:text-[#007A8A] hover:bg-[#F8F8F8]'
                        }`}
                        aria-label="Wishlist"
                     >
                        <FiHeart size={18} className={`${isWishlisted ? 'fill-current' : ''}`} />
                     </button>
                </div>
            </div>
          </div>

          {/* Shipping/Trust Badges */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 border-t border-[#E0E0E0]">
            <div className="flex flex-col items-center text-center p-2 rounded-xl hover:bg-white transition-colors group">
                <div className="mb-2 p-2 rounded-full bg-[#F8F8F8] group-hover:bg-[#D4AF37]/10 transition-colors">
                    <FiTruck className="text-[#007A8A] group-hover:text-[#D4AF37]" size={18} />
                </div>
                <span className="text-[10px] font-bold text-[#1A1A3A] uppercase tracking-wide">Free Delivery</span>
            </div>
            <div className="flex flex-col items-center text-center p-2 rounded-xl hover:bg-white transition-colors group">
                <div className="mb-2 p-2 rounded-full bg-[#F8F8F8] group-hover:bg-[#D4AF37]/10 transition-colors">
                    <FiShield className="text-[#007A8A] group-hover:text-[#D4AF37]" size={18} />
                </div>
                <span className="text-[10px] font-bold text-[#1A1A3A] uppercase tracking-wide">Secure Payment</span>
            </div>
            <div className="flex flex-col items-center text-center p-2 rounded-xl hover:bg-white transition-colors group">
                <div className="mb-2 p-2 rounded-full bg-[#F8F8F8] group-hover:bg-[#D4AF37]/10 transition-colors">
                    <FiCornerDownLeft className="text-[#007A8A] group-hover:text-[#D4AF37]" size={18} />
                </div>
                <span className="text-[10px] font-bold text-[#1A1A3A] uppercase tracking-wide">Easy Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* INFO TABS SECTION */}
      <section className="bg-white rounded-3xl p-6 md:p-8 border border-[#E0E0E0] shadow-sm relative overflow-hidden">
         {/* Decorative Gradient Blob */}
         <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-[#D4AF37]/5 to-transparent rounded-full blur-2xl"></div>

        <div className="flex border-b border-[#E0E0E0] overflow-x-auto no-scrollbar space-x-6 pb-2 custom-scroll snap-x">
          {[{ id: "description", label: "Description" }, { id: "specifications", label: "Specifications" }, { id: "delivery", label: "Delivery Policy" }].map((tab) => (
            <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)} 
                className={`pb-4 text-xs sm:text-sm uppercase tracking-widest font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer snap-start ${
                    activeTab === tab.id 
                        ? 'border-[#D4AF37] text-[#1A1A3A]' 
                        : 'border-transparent text-[#6B7280] hover:text-[#007A8A]'
                }`}
            >
                {tab.label}
            </button>
          ))}
        </div>
        
        <div className="mt-6 text-sm sm:text-base leading-relaxed text-[#333333] max-w-3xl relative z-10">
          {activeTab === "description" && (
              <div className="prose prose-sm max-w-none">
                  <p>{product.description}</p>
                  <p className="text-[#6B7280] mt-4 text-xs">Designed in Italy, crafted for you.</p>
              </div>
          )}
          {activeTab === "specifications" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 bg-[#F8F8F8] p-6 rounded-2xl border border-[#E0E0E0]">
                {Object.entries(product.specs || { Material: 'Premium Blend', Origin: 'India', Care: 'Dry Clean Only' }).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center border-b border-[#E0E0E0] pb-2 last:border-0">
                        <span className="font-bold text-[#1A1A3A] text-xs sm:text-sm uppercase">{key}</span>
                        <span className="text-[#333333] text-sm">{val}</span>
                    </div>
                ))}
              </div>
          )}
          {activeTab === "delivery" && (
              <ul className="list-disc pl-5 space-y-3 text-sm">
                  <li><strong>Metros:</strong> 2-3 working days</li>
                  <li><strong>Rest of India:</strong> 4-5 working days</li>
                  <li><strong>International:</strong> 7-10 working days</li>
                  <li><strong>Cash on Delivery:</strong> Available only for orders above ₹5000</li>
              </ul>
          )}
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="space-y-8 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <h2 className="font-display font-extrabold text-2xl text-[#1A1A3A] uppercase tracking-tight">You May Also Like</h2>
                <button onClick={() => onNavigate('shop', { category: product.category })} className="text-sm text-[#007A8A] font-bold uppercase hover:text-[#D4AF37] flex items-center gap-1">
                    View All <FiEye size={14} />
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((item) => (
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
    </div>
  );
}