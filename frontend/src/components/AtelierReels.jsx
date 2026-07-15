import React, { useEffect, useState } from "react";
import {
  FiArrowRight,
  FiExternalLink,
  FiInstagram,
  FiPlay,
  FiShoppingBag,
  FiShoppingCart,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { reelsAPI } from "../services/api";
import { useApp } from "../context/AppContext";

// ✅ Helper Functions OUTSIDE the component to prevent Reference Errors
const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.reels)) return data.reels;
  if (Array.isArray(data?.data?.reels)) return data.data.reels;
  if (Array.isArray(data?.data?.data)) return data.data.data;
  return [];
};

const getProductImage = (product) => {
  if (!product) return "";
  return product.image || product.thumbnail || product.thumbnailUrl || product.images?.[0]?.url || product.images?.[0] || "";
};

const normalizeProductForCart = (product) => {
  if (!product) return null;
  const id = product.id || product._id || product.productId;
  if (!id) return null;

  return {
    ...product,
    id,
    _id: product._id || id,
    name: product.name || "Linked Product",
    slug: product.slug || id,
    image: getProductImage(product) || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600",
    price: Number(product.salePrice ?? product.price ?? 0),
    oldPrice: product.oldPrice ?? product.compareAtPrice ?? null,
    category: typeof product.category === "object" ? product.category?.name || "Fashion" : product.category || "Fashion",
    brand: product.brand || "Luxe Atelier",
    stock: product.inventory?.quantity ?? product.stock ?? 10,
  };
};

const getInstaEmbedUrl = (url) => {
  if (!url) return "";
  try {
    const urlObj = new URL(url);
    const cleanUrl = urlObj.origin + urlObj.pathname;
    return cleanUrl.endsWith("/") ? `${cleanUrl}embed` : `${cleanUrl}/embed`;
  } catch (e) {
    return url;
  }
};

const AtelierReels = ({ siteSettings, onNavigate }) => {
  const { addToCart } = useApp();

  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingReel, setPlayingReel] = useState(null);

  const fetchReels = async () => {
    try {
      setLoading(true);
      const data = await reelsAPI.getPublic(5);
      setReels(normalizeArray(data));
    } catch (error) {
      console.error("Failed to fetch reels:", error);
      setReels([]); // Safe fallback on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  // ✅ STOP BUBBLING: Prevent click from reaching Home page
  const playReel = (e, reel) => {
    e.preventDefault();
    e.stopPropagation();
    setPlayingReel(reel);
  };

  const handleAddToCart = async (e, reel) => {
    e.preventDefault();
    e.stopPropagation();
    const product = normalizeProductForCart(reel.product);
    if (!product) return toast.error("No product linked with this reel");
    try {
      const result = await addToCart(product, 1);
      if (result?.success !== false) toast.success("Added to cart successfully! 🛍️");
    } catch (error) {
      toast.error("Failed to add product to cart");
    }
  };

  const handleBuyNow = async (e, reel) => {
    e.preventDefault();
    e.stopPropagation();
    const product = normalizeProductForCart(reel.product);
    if (!product) return toast.error("No product linked with this reel");
    try {
      const result = await addToCart(product, 1);
      if (result?.success === false) return toast.error(result?.message || "Failed to add product");
      toast.success("Proceeding to checkout");
      if (onNavigate) onNavigate("checkout", { source: "reel", productId: product.id });
    } catch (error) {
      toast.error("Failed to start checkout");
    }
  };

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="aspect-[9/16] rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (!reels.length) return null;

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-center sm:text-left">
            <span className="text-[10px] text-[#d49a34] uppercase font-bold tracking-[0.3em]">#LuxeAtelier</span>
            <h2 className="font-display font-extrabold text-2xl text-black uppercase mt-1">Atelier Reels</h2>
            <p className="text-xs text-gray-400 mt-1">Watch our latest style drops & shop the look</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {reels.map((reel, idx) => {
            const linkedProduct = normalizeProductForCart(reel.product);
            const productImage = linkedProduct ? getProductImage(linkedProduct) : "";
            const displayThumbnail = reel.thumbnailUrl || productImage;

            return (
              <div
                key={reel._id || reel.id || idx}
                onClick={(e) => playReel(e, reel)}
                className="relative aspect-[9/16] rounded-2xl md:rounded-3xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
              >
                {displayThumbnail ? (
                  <img src={displayThumbnail} alt={reel.title || 'Reel'} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-pink-600 to-orange-400 flex items-center justify-center">
                    <FiPlay className="text-white/80" size={44} />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/30 pointer-events-none" />

                {/* Center Play Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                    <FiPlay className="w-6 h-6 text-white ml-1 fill-white" />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex flex-col gap-3">
                  <div>
                    <h3 className="text-white text-[13px] font-black line-clamp-1 mb-1">
                      {reel.title || (linkedProduct ? linkedProduct.name : 'Exclusive Look')}
                    </h3>
                    {linkedProduct && (
                      <span className="text-[#d49a34] text-[12px] font-black">
                        ₹{Number(linkedProduct.price || 0).toLocaleString()}
                        {linkedProduct.oldPrice && (
                          <span className="text-white/50 text-[9px] line-through ml-2">₹{Number(linkedProduct.oldPrice).toLocaleString()}</span>
                        )}
                      </span>
                    )}
                  </div>

                  {linkedProduct && (
                    <div className="flex items-center gap-2 pt-1 w-full">
                      <button
                        onClick={(e) => handleAddToCart(e, reel)}
                        className="flex-1 bg-black/60 hover:bg-black/90 backdrop-blur-md text-white border border-white/30 text-[9px] font-black uppercase tracking-widest py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                      >
                        <FiShoppingCart size={11} /> Add
                      </button>

                      <button
                        onClick={(e) => handleBuyNow(e, reel)}
                        className="flex-[1.5] bg-gradient-to-r from-[#d49a34] to-[#f3c05b] hover:from-[#c28c2e] text-black text-[9px] font-black uppercase tracking-widest py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg"
                      >
                        <FiShoppingBag size={11} /> Buy Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ✅ MODAL PLAYER */}
      {playingReel && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPlayingReel(null); }}
        >
          <div
            className="relative z-10 w-full max-w-[430px] aspect-[9/16] bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()} // Prevent clicking video from closing modal
          >
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPlayingReel(null); }}
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 text-2xl flex items-center justify-center hover:bg-red-500 hover:scale-110 transition-all cursor-pointer"
            >
              ×
            </button>

            <div className="absolute inset-0 z-10">
              {playingReel.videoUrl ? (
                <video src={playingReel.videoUrl} className="w-full h-full object-cover" autoPlay controls loop playsInline />
              ) : playingReel.reelUrl ? (
                <iframe
                  src={getInstaEmbedUrl(playingReel.reelUrl)}
                  className="w-full h-full"
                  frameBorder="0"
                  scrolling="no"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 text-white/50 text-sm gap-4">
                  <FiInstagram size={40} className="text-white/30" />
                  <p>Video source not available</p>
                </div>
              )}
            </div>

            {normalizeProductForCart(playingReel.product) && (
              <div className="absolute left-3 right-3 bottom-6 z-40 bg-black/80 backdrop-blur-xl border border-white/15 rounded-2xl p-3 shadow-2xl">
                <div className="flex items-center gap-3">
                  <img src={normalizeProductForCart(playingReel.product).image} alt="product" className="w-14 h-14 rounded-xl object-cover border border-white/10" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white text-xs font-black truncate">{normalizeProductForCart(playingReel.product).name}</h4>
                    <p className="text-[#d49a34] text-[11px] font-bold mt-0.5">₹{Number(normalizeProductForCart(playingReel.product).price || 0).toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button
                    onClick={(e) => { setPlayingReel(null); handleAddToCart(e, playingReel); }}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600 text-[10px] font-black uppercase tracking-wider py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Add To Cart
                  </button>
                  <button
                    onClick={(e) => { setPlayingReel(null); handleBuyNow(e, playingReel); }}
                    className="bg-gradient-to-r from-[#d49a34] to-[#f3c05b] text-black text-[10px] font-black uppercase tracking-wider py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Buy Now ⚡
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AtelierReels;