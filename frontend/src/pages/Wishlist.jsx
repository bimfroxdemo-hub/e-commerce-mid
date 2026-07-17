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
    <main
      id="wishlist-page"
      className="min-h-screen w-full overflow-hidden bg-[#F8F8F8] px-3 py-8 font-sans sm:px-5 sm:py-12 lg:px-8"
    >
      <div className="mx-auto w-full max-w-7xl space-y-8">

        {/* Header */}
        <header className="rounded-2xl border border-[#E0E0E0] bg-white p-5 shadow-sm sm:rounded-3xl sm:p-7">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] sm:h-12 sm:w-12">
              <FiHeart size={21} className="fill-[#D4AF37]/10" />
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#D4AF37] sm:text-[10px]">
                Your Collection
              </p>

              <h1 className="mt-1 font-display text-xl font-black uppercase tracking-tight text-[#1A1A3A] sm:text-3xl">
                My Saved Wishlist ({wishlist.length})
              </h1>

              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#666666] sm:text-xs">
                Your private handpicked couture favorites
              </p>
            </div>
          </div>
        </header>

        {wishlist.length > 0 ? (
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {wishlist.map((item) => (
              <article
                key={item.id || item._id}
                className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E0E0E0] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#007A8A]/40 hover:shadow-xl sm:rounded-3xl"
              >
                {/* Product Image */}
                <div className="relative aspect-[4/5] overflow-hidden bg-[#F8F8F8]">
                  <img
                    src={
                      item.image ||
                      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400'
                    }
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1A1A3A]/25 via-transparent to-transparent" />

                  <button
                    onClick={() => handleRemove(item)}
                    className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border border-white/50 bg-white/90 text-[#666666] shadow-md transition-all hover:bg-[#1A1A3A] hover:text-white sm:right-3 sm:top-3 sm:h-9 sm:w-9"
                    title="Remove from wishlist"
                  >
                    <FiTrash2 size={13} />
                  </button>

                  <span className="absolute bottom-2.5 left-2.5 rounded-full border border-white/30 bg-[#1A1A3A]/75 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-white backdrop-blur-md sm:bottom-3 sm:left-3">
                    Saved
                  </span>
                </div>

                {/* Product Details */}
                <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
                  <div className="min-w-0">
                    <span className="block truncate text-[8px] font-bold uppercase tracking-[0.16em] text-[#007A8A] sm:text-[10px] sm:tracking-widest">
                      {item.brand || 'Kabiraaz Fashion'}
                    </span>

                    <h3
                      onClick={() =>
                        onNavigate('product-details', {
                          slug: item.slug || item.id || item._id,
                        })
                      }
                      className="mt-1 line-clamp-2 cursor-pointer text-xs font-bold leading-snug text-[#1A1A3A] transition-colors hover:text-[#007A8A] sm:text-sm"
                    >
                      {item.name}
                    </h3>

                    <p className="mt-2 font-mono text-sm font-black text-[#007A8A] sm:text-base">
                      ₹{(Number(item.price) || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="mt-3 border-t border-[#E0E0E0] pt-3 sm:mt-4 sm:pt-4">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#D4AF37] py-2.5 text-[8px] font-black uppercase tracking-wider text-[#1A1A3A] transition-all hover:bg-[#B8941F] hover:shadow-md sm:gap-2 sm:py-3 sm:text-[10px] sm:tracking-widest"
                    >
                      <FiShoppingBag size={12} />
                      <span className="hidden xs:inline sm:inline">
                        Add to Bag
                      </span>
                      <span className="xs:hidden sm:hidden">Add</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="flex min-h-[430px] flex-col items-center justify-center rounded-2xl border border-[#E0E0E0] bg-white px-5 py-16 text-center shadow-sm sm:min-h-[480px] sm:rounded-3xl">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#007A8A]/10 text-[#007A8A]">
              <FiHeart size={42} />
            </div>

            <h3 className="mt-6 text-lg font-black text-[#1A1A3A] sm:text-xl">
              Your wishlist is empty
            </h3>

            <p className="mt-2 max-w-sm text-xs leading-relaxed text-[#666666] sm:text-sm">
              Browse our catalog to select handpicked garments and premium accessories.
            </p>

            <button
              onClick={() => onNavigate('shop')}
              className="mt-6 rounded-xl bg-[#D4AF37] px-7 py-3 text-[10px] font-black uppercase tracking-widest text-[#1A1A3A] transition-all hover:bg-[#B8941F] hover:shadow-md sm:px-8 sm:text-xs"
            >
              Start Shopping
            </button>
          </section>
        )}
      </div>
    </main>
  );
}