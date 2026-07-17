import React, { useState } from 'react';
import { FiX, FiShoppingBag, FiHeart, FiStar, FiChevronRight } from 'react-icons/fi';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

export default function QuickViewModal({ product, onClose, onNavigate }) {
  const { cart, wishlist, toggleWishlist, addToCart } = useApp();
  const [selectedSize, setSelectedSize] = useState("M");
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const isWishlisted = wishlist.some((item) => item.id === product.id);

  const handleAddToCart = () => {
    addToCart(product, qty);
    toast.success(`Added ${qty}x ${product.name} to cart!`);
    onClose();
  };

  const handleWishlist = () => {
    toggleWishlist(product);
    if (!isWishlisted) {
      toast.success("Saved to wishlist!", { icon: '❤️' });
    } else {
      toast.error("Removed from wishlist");
    }
  };

  return (
    <div id="quickview-overlay" className="fixed inset-0 z-50 bg-[#1A1A3A]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-sm sm:max-w-3xl overflow-hidden shadow-2xl relative animate-scale-in">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 bg-[#F8F8F8] hover:bg-[#1A1A3A] hover:text-white rounded-full text-[#333333] transition-all cursor-pointer"
        >
          <FiX size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product image */}
          <div className="h-64 sm:h-72 md:h-full relative bg-[#F8F8F8]">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
              {product.discount > 0 && (
                <span className="bg-[#D4AF37] text-[#1A1A3A] text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                  {product.discount}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Details side */}
          <div className="p-4 sm:p-6 md:p-8 flex flex-col justify-between space-y-3 sm:space-y-4">
            <div>
              <p className="text-[10px] sm:text-xs text-[#333333] font-bold uppercase tracking-wider">{product.brand || 'Kabiraaz Fashion'}</p>
              <h3 className="font-display font-bold text-lg sm:text-xl text-[#1A1A3A] mt-1">{product.name}</h3>

              {/* Rating */}
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex items-center space-x-1">
                  <FiStar size={12} className="sm:w-[14px] sm:h-[14px] text-[#D4AF37] fill-[#D4AF37]" />
                  <span className="text-xs sm:text-sm font-bold text-[#1A1A3A]">{product.rating}</span>
                </div>
                <span className="text-[#E0E0E0]">|</span>
                <span className="text-[10px] sm:text-xs text-[#333333] font-medium">{product.reviewsCount} Fashion Reviews</span>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline space-x-3 mt-3 sm:mt-4">
                <span className="text-xl sm:text-2xl font-bold text-[#1A1A3A]">₹{product.price.toLocaleString()}</span>
                {product.oldPrice > product.price && (
                  <span className="text-sm text-[#333333] line-through">₹{product.oldPrice.toLocaleString()}</span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-[#333333] leading-relaxed mt-3 sm:mt-4">
                {product.description?.slice(0, 150) || "Premium quality fashion item with excellent craftsmanship and attention to detail"}...
              </p>

              {/* Sizes (Dynamic Mock) */}
              <div className="mt-4 sm:mt-5 space-y-2">
                <span className="text-[10px] sm:text-xs font-bold text-[#1A1A3A] block uppercase tracking-wider">Select Size</span>
                <div className="flex space-x-2">
                  {["S", "M", "L", "XL"].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold border transition-all cursor-pointer ${
                        selectedSize === sz
                          ? 'bg-[#1A1A3A] text-white border-[#1A1A3A] scale-105'
                          : 'border-[#E0E0E0] text-[#333333] hover:border-[#007A8A] hover:text-[#007A8A]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mt-4 sm:mt-5 space-y-2">
                <span className="text-[10px] sm:text-xs font-bold text-[#1A1A3A] block uppercase tracking-wider">Quantity</span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#E0E0E0] flex items-center justify-center hover:bg-[#F8F8F8] hover:border-[#007A8A] text-[#333333] hover:text-[#007A8A] cursor-pointer transition-all text-sm"
                  >
                    -
                  </button>
                  <span className="font-bold text-sm w-4 text-center text-[#1A1A3A]">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#E0E0E0] flex items-center justify-center hover:bg-[#F8F8F8] hover:border-[#007A8A] text-[#333333] hover:text-[#007A8A] cursor-pointer transition-all text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-3 sm:pt-4 border-t border-[#E0E0E0]">
              <div className="flex space-x-2">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#D4AF37] hover:bg-[#B8941F] text-[#1A1A3A] py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center space-x-2"
                >
                  <FiShoppingBag size={12} className="sm:w-[14px] sm:h-[14px]"/>
                  <span>Add To Bag</span>
                </button>
                <button
                  onClick={handleWishlist}
                  className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl border transition-all cursor-pointer ${
                    isWishlisted 
                      ? 'bg-[#D4AF37]/15 border-[#D4AF37]/20 text-[#D4AF37]' 
                      : 'border-[#E0E0E0] text-[#333333] hover:text-[#D4AF37] hover:border-[#D4AF37]/30'
                  }`}
                  title="Wishlist"
                >
                  <FiHeart size={14} className={`sm:w-4 sm:h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              <button
                onClick={() => { onNavigate('product-details', { slug: product.slug }); onClose(); }}
                className="w-full text-center text-[10px] sm:text-[11px] font-bold text-[#333333] hover:text-[#007A8A] transition-colors py-2 flex items-center justify-center space-x-1"
              >
                <span>View Full Fashion Product Specifications</span>
                <FiChevronRight size={10} className="sm:w-3 sm:h-3" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}