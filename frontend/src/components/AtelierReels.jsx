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
    brand: product.brand || "Kabiraaz Fashion",
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="aspect-[9/16] rounded-2xl bg-zinc-100 animate-pulse border border-zinc-200" />
          ))}
        </div>
      </section>
    );
  }

  if (!reels.length) return null;

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#F8F8F8] rounded-3xl my-8">
        {/* Header - Instagram / Luxe Inspired */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4 pb-2 border-b border-zinc-200/60">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#007A8A] animate-ping" />
              <span className="text-[11px] text-[#D4AF37] uppercase font-black tracking-[0.25em]">#KabiraazFashion</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-[#1A1A3A] uppercase tracking-tight">
              Atelier Reels
            </h2>
            <p className="text-xs text-[#333333]/80 font-medium mt-1">Watch our latest style drops & shop the look directly</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-zinc-200">
            <FiInstagram className="text-[#D4AF37] text-lg animate-pulse" />
            <span className="text-xs font-semibold text-[#1A1A3A]">@kabiraaz.fashion</span>
          </div>
        </div>

        {/* Reels Grid (Ultra responsive, supports tiny mobiles clean layout) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
          {reels.map((reel, idx) => {
            const linkedProduct = normalizeProductForCart(reel.product);
            const productImage = linkedProduct ? getProductImage(linkedProduct) : "";
            const displayThumbnail = reel.thumbnailUrl || productImage;

            return (
              <div
                key={reel._id || reel.id || idx}
                onClick={(e) => playReel(e, reel)}
                className="relative aspect-[9/16] rounded-2xl md:rounded-3xl overflow-hidden group cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 bg-[#1A1A3A] border border-zinc-200/50"
              >
                {/* 1. Simulated Instagram Profile Badge (Top Left Overlay) */}
                <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#2E3192] to-[#007A8A] p-[1.2px]">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                        <span className="text-[7px] text-[#D4AF37] font-black">K</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-white font-bold tracking-wide truncate max-w-[65px] xs:max-w-[80px]">
                      kabiraaz
                    </span>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
                    <FiInstagram className="text-white w-2.5 h-2.5" />
                  </div>
                </div>

                {/* Thumbnail Layer */}
                {displayThumbnail ? (
                  <img 
                    src={displayThumbnail} 
                    alt={reel.title || 'Reel'} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A3A] via-[#2E3192] to-[#007A8A] flex items-center justify-center">
                    <FiPlay className="text-white/80" size={40} />
                  </div>
                )}

                {/* Standard Instagram Style Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/40 pointer-events-none" />

                {/* Center Hover Instagram Play Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="w-12 h-12 bg-[#007A8A]/80 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 scale-90 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                    <FiPlay className="w-5 h-5 text-[#D4AF37] ml-0.5 fill-[#D4AF37]" />
                  </div>
                </div>

                {/* Bottom Content Area */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-20 flex flex-col gap-2.5">
                  <div>
                    <h3 className="text-white text-[12px] sm:text-[13px] font-black line-clamp-1 mb-0.5 tracking-wide uppercase drop-shadow">
                      {reel.title || (linkedProduct ? linkedProduct.name : 'Exclusive Look')}
                    </h3>
                    {linkedProduct && (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[#D4AF37] text-[12px] sm:text-[13px] font-black">
                          ₹{Number(linkedProduct.price || 0).toLocaleString()}
                        </span>
                        {linkedProduct.oldPrice && (
                          <span className="text-white/40 text-[9px] line-through">
                            ₹{Number(linkedProduct.oldPrice).toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {linkedProduct && (
                    <div className="flex items-center gap-1.5 pt-0.5 w-full">
                      <button
                        onClick={(e) => handleAddToCart(e, reel)}
                        className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 text-[9px] font-black uppercase tracking-wider py-2 rounded-xl flex items-center justify-center gap-1 transition-all"
                      >
                        <FiShoppingCart size={10} /> Add
                      </button>

                      <button
                        onClick={(e) => handleBuyNow(e, reel)}
                        className="flex-[1.4] bg-gradient-to-r from-[#D4AF37] to-[#F8F8F8] hover:from-[#c28c2e] hover:to-[#e6b945] text-[#1A1A3A] text-[9px] font-black uppercase tracking-wider py-2 rounded-xl flex items-center justify-center gap-1 transition-all shadow-md"
                      >
                        <FiShoppingBag size={10} /> Buy Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ✅ INSTAGRAM STYLE MODAL PLAYER */}
      {playingReel && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/95 backdrop-blur-md"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPlayingReel(null); }}
        >
          <div
            className="relative z-10 w-full max-w-[400px] h-[85vh] sm:h-auto sm:aspect-[9/16] bg-[#1A1A3A] rounded-3xl overflow-hidden shadow-2xl border border-white/15 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()} // Prevent closing modal on inner clicks
          >
            {/* Modal Header */}
            <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between">
              <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#007A8A] p-[1.5px]">
                  <div className="w-full h-full rounded-full bg-[#1A1A3A] flex items-center justify-center">
                    <span className="text-[8px] text-[#D4AF37] font-black">K</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-white font-bold leading-tight">kabiraaz.fashion</span>
                  <span className="text-[8px] text-[#D4AF37] font-bold tracking-widest uppercase leading-none">Atelier</span>
                </div>
              </div>

              {/* Elegant Close Button */}
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPlayingReel(null); }}
                className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white/90 border border-white/10 text-xl flex items-center justify-center hover:bg-red-500 hover:text-white hover:scale-105 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Video Container Area */}
            <div className="absolute inset-0 z-10 bg-black">
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
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-white/50 text-xs gap-3">
                  <FiInstagram size={35} className="text-[#D4AF37] animate-pulse" />
                  <p>Video source not available</p>
                </div>
              )}
            </div>

            {/* Premium Attached Product Drawer inside Player */}
            {normalizeProductForCart(playingReel.product) && (
              <div className="absolute left-3 right-3 bottom-4 z-40 bg-gradient-to-b from-[#1A1A3A]/90 to-black/95 backdrop-blur-xl border border-white/15 rounded-2xl p-3 shadow-2xl">
                <div className="flex items-center gap-3">
                  <img 
                    src={normalizeProductForCart(playingReel.product).image} 
                    alt="product" 
                    className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow-md" 
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white text-[11px] sm:text-xs font-black truncate tracking-wide">
                      {normalizeProductForCart(playingReel.product).name}
                    </h4>
                    <p className="text-[#D4AF37] text-[11px] font-black mt-0.5">
                      ₹{Number(normalizeProductForCart(playingReel.product).price || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button
                    onClick={(e) => { setPlayingReel(null); handleAddToCart(e, playingReel); }}
                    className="bg-[#007A8A]/90 hover:bg-[#007A8A] text-white border border-[#007A8A]/20 text-[10px] font-black uppercase tracking-wider py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Add To Cart
                  </button>
                  <button
                    onClick={(e) => { setPlayingReel(null); handleBuyNow(e, playingReel); }}
                    className="bg-gradient-to-r from-[#D4AF37] to-[#F8F8F8] text-[#1A1A3A] hover:opacity-90 text-[10px] font-black uppercase tracking-wider py-2.5 rounded-xl transition-all cursor-pointer shadow-lg"
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