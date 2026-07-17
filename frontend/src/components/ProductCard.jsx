import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FiHeart, FiShoppingBag, FiEye, FiCheck, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProductCard({ product, onNavigate, onQuickView }) {
  const { cart, wishlist, toggleWishlist, addToCart } = useApp();
  const [isHovered, setIsHovered] = useState(false);

  const productId = product.id || product._id;
  const productSlug = product.slug || product.id || product._id;
  const productStock = Number(product.stock) || 0;
  const isInStock = productStock > 0;
  const productPrice = Number(product.price) || 0;
  const productOldPrice = Number(product.oldPrice) || 0;
  const discountPercent = productOldPrice > productPrice ? Math.round(((productOldPrice - productPrice) / productOldPrice) * 100) : 0;

  const isWishlisted = wishlist.some((item) => item.id === productId || item._id === productId);
  const isInCart = cart.some((item) => item.id === productId || item._id === productId);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!isInStock) { toast.error("This item is currently out of stock."); return; }
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`, { style: { background: '#1A1A3A', color: '#fff', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' } });
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    if (!isInStock) { toast.error("This item is currently out of stock."); return; }
    addToCart(product, 1);
    onNavigate('checkout');
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
    if (!isWishlisted) { toast.success(`Saved to wishlist!`, { icon: '❤️' }); }
    else { toast.error(`Removed from wishlist!`); }
  };

  return (
    <div className="group bg-white rounded-2xl border border-[#E0E0E0] hover:border-[#007A8A] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="relative aspect-square w-full overflow-hidden bg-[#F8F8F8] cursor-pointer" onClick={() => onNavigate('product-details', { slug: productSlug })}>
        <img src={product.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400'} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
        
        {/* Badges */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col space-y-1.5 z-10">
          {discountPercent > 0 && (
            <span className="bg-[#D4AF37] text-[#1A1A3A] text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2 sm:px-2.5 py-1 rounded-full shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
          {!isInStock && (
            <span className="bg-[#1A1A3A] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2 sm:px-2.5 py-1 rounded-full shadow-sm">
              OUT OF STOCK
            </span>
          )}
          {productStock <= 5 && productStock > 0 && (
            <span className="bg-[#D4AF37]/10 text-[#D4AF37] text-[8px] sm:text-[9px] font-bold uppercase tracking-widest px-1.5 sm:px-2 py-0.5 rounded-full border border-[#D4AF37]/20">
              Only {productStock} Left
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={handleWishlist} 
          className={`absolute top-2 sm:top-3 right-2 sm:right-3 z-10 p-2 sm:p-2.5 rounded-full shadow-md backdrop-blur-sm transition-all duration-300 cursor-pointer ${
            isWishlisted 
              ? 'bg-[#D4AF37] text-white scale-110' 
              : 'bg-white/85 hover:bg-white text-gray-400 hover:text-[#D4AF37] hover:scale-110'
          }`} 
          title={isWishlisted ? "Remove" : "Save"}
        >
          <FiHeart size={14} className={`sm:w-[15px] sm:h-[15px] ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-[#1A1A3A]/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button 
            onClick={(e) => { e.stopPropagation(); onQuickView && onQuickView(product); }} 
            className="bg-white hover:bg-[#1A1A3A] hover:text-white text-[#1A1A3A] p-2.5 sm:p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer"
          >
            <FiEye size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1 sm:space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[9px] sm:text-[10px] text-[#333333] font-bold uppercase tracking-widest">
              {product.brand || 'Kabiraaz Fashion'}
            </span>
            <div className="flex items-center space-x-1">
              <FiStar size={10} className="sm:w-[11px] sm:h-[11px] text-[#D4AF37] fill-[#D4AF37]" />
              <span className="text-[10px] sm:text-xs font-bold text-[#1A1A3A]">{product.rating || 5.0}</span>
              <span className="text-[8px] sm:text-[9px] text-[#333333]">({product.reviewsCount || 0})</span>
            </div>
          </div>
          <h4 
            onClick={() => onNavigate('product-details', { slug: productSlug })} 
            className="text-sm sm:text-base font-semibold text-[#1A1A3A] hover:text-[#007A8A] transition-colors cursor-pointer line-clamp-1"
          >
            {product.name}
          </h4>
        </div>

        {/* Price and Actions */}
        <div className="pt-2 sm:pt-3 border-t border-[#E0E0E0] mt-2 sm:mt-3 space-y-2 sm:space-y-3">
          <div className="flex items-baseline space-x-2">
            <span className="text-base sm:text-lg font-bold text-[#1A1A3A]">
              ₹{productPrice.toLocaleString()}
            </span>
            {productOldPrice > productPrice && (
              <span className="text-xs sm:text-sm text-[#333333] line-through">
                ₹{productOldPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            <button 
              onClick={handleAddToCart} 
              disabled={!isInStock} 
              className={`flex items-center justify-center space-x-1 sm:space-x-1.5 py-2 sm:py-2.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider rounded-lg sm:rounded-xl transition-all border duration-200 cursor-pointer ${
                isInCart 
                  ? 'bg-[#007A8A]/10 text-[#007A8A] border-[#007A8A]/20' 
                  : 'bg-[#F8F8F8] hover:bg-[#1A1A3A] hover:text-white text-[#1A1A3A] border-[#E0E0E0] hover:border-[#1A1A3A]'
              } ${!isInStock ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isInCart ? (
                <>
                  <FiCheck size={11} className="sm:w-3 sm:h-3" />
                  <span className="hidden sm:inline">Added</span>
                  <span className="sm:hidden">✓</span>
                </>
              ) : (
                <>
                  <FiShoppingBag size={10} className="sm:w-[11px] sm:h-[11px]" />
                  <span className="hidden sm:inline">Add Bag</span>
                  <span className="sm:hidden">Add</span>
                </>
              )}
            </button>

            <button 
              onClick={handleBuyNow} 
              disabled={!isInStock} 
              className={`bg-[#D4AF37] hover:bg-[#B8941F] text-[#1A1A3A] py-2 sm:py-2.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider rounded-lg sm:rounded-xl transition-colors duration-200 cursor-pointer text-center ${
                !isInStock ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span className="hidden sm:inline">Buy Now</span>
              <span className="sm:hidden">Buy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}