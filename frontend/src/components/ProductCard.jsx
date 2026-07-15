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
    toast.success(`${product.name} added to cart!`, { style: { background: '#000', color: '#fff', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' } });
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
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50 cursor-pointer" onClick={() => onNavigate('product-details', { slug: productSlug })}>
        <img src={product.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400'} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
        <div className="absolute top-3 left-3 flex flex-col space-y-1.5 z-10">
          {discountPercent > 0 && (<span className="bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">{discountPercent}% OFF</span>)}
          {!isInStock && (<span className="bg-gray-800 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">OUT OF STOCK</span>)}
          {productStock <= 5 && productStock > 0 && (<span className="bg-amber-100 text-amber-700 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-amber-200">Only {productStock} Left</span>)}
        </div>
        <button onClick={handleWishlist} className={`absolute top-3 right-3 z-10 p-2.5 rounded-full shadow-md backdrop-blur-sm transition-all duration-300 cursor-pointer ${isWishlisted ? 'bg-rose-500 text-white scale-110' : 'bg-white/85 hover:bg-white text-gray-400 hover:text-rose-500 hover:scale-110'}`} title={isWishlisted ? "Remove" : "Save"}>
          <FiHeart size={15} className={isWishlisted ? 'fill-current' : ''} />
        </button>
        <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button onClick={(e) => { e.stopPropagation(); onQuickView && onQuickView(product); }} className="bg-white hover:bg-black hover:text-white text-black p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer"><FiEye size={16} /></button>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{product.brand || 'Luxe Atelier'}</span>
            <div className="flex items-center space-x-1"><FiStar size={11} className="text-amber-400 fill-amber-400" /><span className="text-xs font-bold text-gray-700">{product.rating || 5.0}</span><span className="text-[9px] text-gray-400">({product.reviewsCount || 0})</span></div>
          </div>
          <h4 onClick={() => onNavigate('product-details', { slug: productSlug })} className="text-sm font-semibold text-gray-800 hover:text-black transition-colors cursor-pointer line-clamp-1">{product.name}</h4>
        </div>
        <div className="pt-3 border-t border-gray-50 mt-3 space-y-3">
          <div className="flex items-baseline space-x-2">
            <span className="text-base font-bold text-black">₹{productPrice.toLocaleString()}</span>
            {productOldPrice > productPrice && (<span className="text-xs text-gray-400 line-through">₹{productOldPrice.toLocaleString()}</span>)}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={handleAddToCart} disabled={!isInStock} className={`flex items-center justify-center space-x-1.5 py-2 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all border duration-200 cursor-pointer ${isInCart ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 hover:bg-black hover:text-white text-gray-800 border-gray-100 hover:border-black'} ${!isInStock ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isInCart ? (<><FiCheck size={12} /><span>Added</span></>) : (<><FiShoppingBag size={11} /><span>Add Bag</span></>)}
            </button>
            <button onClick={handleBuyNow} disabled={!isInStock} className={`bg-black hover:bg-gray-800 text-white py-2 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-colors duration-200 cursor-pointer text-center ${!isInStock ? 'opacity-50 cursor-not-allowed' : ''}`}>Buy Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}