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
    <div id="quickview-overlay" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative animate-scale-in">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-slate-100 hover:bg-black hover:text-white rounded-full text-gray-500 transition-all cursor-pointer"
        >
          <FiX size={18} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product image */}
          <div className="h-72 md:h-full relative bg-slate-50">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4">
              {product.discount > 0 && (
                <span className="bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                  {product.discount}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Details side */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-4">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{product.brand}</p>
              <h3 className="font-display font-bold text-xl text-black mt-1">{product.name}</h3>

              {/* Rating */}
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex items-center space-x-1">
                  <FiStar size={14}className="text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-gray-800">{product.rating}</span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-xs text-gray-400 font-medium">{product.reviewsCount} Boutique Reviews</span>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline space-x-3 mt-4">
                <span className="text-2xl font-bold text-black">₹{product.price.toLocaleString()}</span>
                {product.oldPrice > product.price && (
                  <span className="text-sm text-gray-400 line-through">₹{product.oldPrice.toLocaleString()}</span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-gray-500 leading-relaxed mt-4">
                {product.description.slice(0, 150)}...
              </p>

              {/* Sizes (Dynamic Mock) */}
              <div className="mt-5 space-y-2">
                <span className="text-xs font-bold text-gray-700 block uppercase tracking-wider">Select Size</span>
                <div className="flex space-x-2">
                  {["S", "M", "L", "XL"].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedSize === sz
                          ? 'bg-black text-white border-black scale-105'
                          : 'border-gray-200 text-gray-600 hover:border-black'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mt-5 space-y-2">
                <span className="text-xs font-bold text-gray-700 block uppercase tracking-wider">Quantity</span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-bold text-sm w-4 text-center">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <div className="flex space-x-2">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-black hover:bg-primary text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center space-x-2"
                >
                  <FiShoppingBag size={14}/>
                  <span>Add To Bag</span>
                </button>
                <button
                  onClick={handleWishlist}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isWishlisted 
                      ? 'bg-danger/15 border-danger/20 text-danger' 
                      : 'border-gray-200 text-gray-400 hover:text-danger hover:border-danger/30'
                  }`}
                  title="Wishlist"
                >
                  <FiHeart size={16} className={isWishlisted ? 'fill-current' : ''} />
                </button>
              </div>

              <button
                onClick={() => { onNavigate('product-details', { slug: product.slug }); onClose(); }}
                className="w-full text-center text-[11px] font-bold text-gray-400 hover:text-primary transition-colors py-2 flex items-center justify-center space-x-1"
              >
                <span>View Full Atelier Product Specifications</span>
                <FiChevronRight size={12} />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
