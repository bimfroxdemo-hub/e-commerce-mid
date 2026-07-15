import React from 'react';
import { useApp } from '../context/AppContext';
import { FiHeart, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Wishlist({ onNavigate }) {
  const { wishlist, toggleWishlist, addToCart } = useApp();

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const handleRemove = (product) => {
    toggleWishlist(product);
    toast.error(`${product.name} removed from wishlist.`);
  };

  return (
    <div id="wishlist-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 transition-all">
      <div className="border-b border-gray-100 pb-5">
        <h1 className="font-display font-bold text-2xl sm:text-3xl uppercase text-black tracking-tight">
          My Saved Wishlist ({wishlist.length})
        </h1>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-bold">Your private handpicked couture favorites</p>
      </div>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <div key={item.id || item._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col justify-between group">
              <div className="relative aspect-square overflow-hidden bg-slate-50">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400'}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={() => handleRemove(item)}
                  className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-rose-500 hover:text-white rounded-full text-gray-400 shadow-md transition-colors cursor-pointer"
                >
                  <FiTrash2 size={13} />
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.brand || 'Luxe Atelier'}</span>
                  <h3
                    onClick={() => onNavigate('product-details', { slug: item.slug || item.id || item._id })}
                    className="text-sm font-semibold text-gray-800 hover:text-black transition-colors cursor-pointer truncate mt-0.5"
                  >
                    {item.name}
                  </h3>
                  <p className="text-sm font-bold text-black mt-2">₹{(Number(item.price) || 0).toLocaleString()}</p>
                </div>

                <div className="pt-4 border-t border-gray-50 mt-4">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full bg-black hover:bg-gray-800 text-white text-[11px] font-bold uppercase tracking-widest py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <FiShoppingBag size={12} />
                    <span>Add to Bag</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-50 space-y-4">
          <div className="p-4 bg-slate-50 rounded-full w-fit mx-auto text-gray-300">
            <FiHeart size={44} />
          </div>
          <h3 className="font-semibold text-gray-800">Your wishlist is empty</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Browse our catalog to select handpicked garments and premium accessories.
          </p>
          <button
            onClick={() => onNavigate('shop')}
            className="bg-black hover:bg-gray-800 text-white text-xs font-bold px-6 py-2.5 rounded-full uppercase tracking-wider transition-colors cursor-pointer"
          >
            Start Shopping
          </button>
        </div>
      )}
    </div>
  );
}