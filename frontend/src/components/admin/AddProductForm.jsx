import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { adminAPI } from '../../services/api';
import { Plus, Eye, Check, Sliders } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddProductForm() {
  const { categories = [] } = useApp();

  // Form States
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState(5000);
  const [salePrice, setSalePrice] = useState("");
  const [stock, setStock] = useState(15);
  const [image, setImage] = useState("");
  const [tagInput, setTagInput] = useState("new");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || price === undefined) {
      toast.error("Product name and list price are required.");
      return;
    }

    const tagsArray = tagInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

    try {
      setIsLoading(true);

      const payload = {
        name: name.trim(),
        description: description || "Expertly crafted premium addition to our boutique catalog.",
        price: Number(price),
        salePrice: salePrice ? Number(salePrice) : null,
        category: category || (categories[0]?._id || 'General'),
        inventory: {
          quantity: Number(stock),
          lowStockThreshold: 5
        },
        images: image ? [{ url: image, alt: name, isPrimary: true }] : [],
        tags: tagsArray
      };

      const response = await adminAPI.products.create(payload);

      if (response?.success) {
        toast.success(`Published "${name}" SKU successfully!`);
        // Reset Form Fields
        setName("");
        setCategory("");
        setPrice(5000);
        setSalePrice("");
        setStock(15);
        setImage("");
        setTagInput("new");
        setDescription("");
      } else {
        toast.error(response?.message || "Failed to publish product");
      }
    } catch (error) {
      console.error("Product upload error:", error);
      toast.error("An error occurred while creating product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 relative">
      {/* Creation Form Block */}
      <div className="lg:col-span-7 space-y-5 sm:space-y-6">
        <div>
          <h4 className="text-xs font-bold text-[#1A1A3A] uppercase tracking-wider">
            Form: Deploy Single Product SKU
          </h4>
          <p className="text-[10px] text-[#666666] mt-1 leading-relaxed">
            Define category, list price, initial stock, and detail tags to append to the database memory pool.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-[#F8F8F8] p-4 sm:p-5 rounded-2xl border border-[#E0E0E0] font-sans"
        >
          <div className="space-y-1 text-xs sm:col-span-2">
            <label className="font-bold text-[#333333] uppercase tracking-wider text-[9px]">
              Product / Garment Name *
            </label>
            <input
              type="text"
              required
              disabled={isLoading}
              placeholder="e.g. Italian Silk Cocktail Dress"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-[#E0E0E0] py-2.5 px-3.5 rounded-xl focus:outline-none focus:border-[#007A8A] focus:ring-2 focus:ring-[#007A8A]/10 text-[11px] text-[#1A1A3A] font-semibold transition-all"
            />
          </div>

          <div className="space-y-1 text-xs sm:col-span-2">
            <label className="font-bold text-[#333333] uppercase tracking-wider text-[9px]">
              Boutique Category *
            </label>
            <select
              value={category}
              disabled={isLoading}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white border border-[#E0E0E0] py-2.5 px-3 rounded-xl focus:outline-none focus:border-[#007A8A] focus:ring-2 focus:ring-[#007A8A]/10 text-[11px] font-medium text-[#1A1A3A] cursor-pointer transition-all"
            >
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-[#333333] uppercase tracking-wider text-[9px]">
              List Price (₹ INR) *
            </label>
            <input
              type="number"
              required
              disabled={isLoading}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full bg-white border border-[#E0E0E0] py-2.5 px-3 rounded-xl focus:outline-none focus:border-[#007A8A] focus:ring-2 focus:ring-[#007A8A]/10 text-[11px] text-[#1A1A3A] font-mono font-bold transition-all"
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-[#333333] uppercase tracking-wider text-[9px]">
              Sticker Sale Price (₹ INR)
            </label>
            <input
              type="number"
              disabled={isLoading}
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="Optional sale price"
              className="w-full bg-white border border-[#E0E0E0] py-2.5 px-3 rounded-xl focus:outline-none focus:border-[#007A8A] focus:ring-2 focus:ring-[#007A8A]/10 text-[11px] text-[#1A1A3A] font-mono transition-all"
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-[#333333] uppercase tracking-wider text-[9px]">
              Initial In-Stock Units *
            </label>
            <input
              type="number"
              required
              disabled={isLoading}
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              className="w-full bg-white border border-[#E0E0E0] py-2.5 px-3 rounded-xl focus:outline-none focus:border-[#007A8A] focus:ring-2 focus:ring-[#007A8A]/10 text-[11px] text-[#1A1A3A] font-mono font-semibold transition-all"
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-[#333333] uppercase tracking-wider text-[9px]">
              Product Tags (comma separated)
            </label>
            <input
              type="text"
              disabled={isLoading}
              placeholder="new, featured, deal, trending"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="w-full bg-white border border-[#E0E0E0] py-2.5 px-3.5 rounded-xl focus:outline-none focus:border-[#007A8A] focus:ring-2 focus:ring-[#007A8A]/10 text-[11px] text-[#1A1A3A] font-medium transition-all"
            />
          </div>

          <div className="space-y-1 text-xs sm:col-span-2">
            <label className="font-bold text-[#333333] uppercase tracking-wider text-[9px]">
              Product Display Image URL
            </label>
            <input
              type="url"
              disabled={isLoading}
              placeholder="https://images.unsplash.com/photo-..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full bg-white border border-[#E0E0E0] py-2.5 px-3.5 rounded-xl focus:outline-none focus:border-[#007A8A] focus:ring-2 focus:ring-[#007A8A]/10 text-[11px] text-[#1A1A3A] font-mono transition-all"
            />
          </div>

          <div className="space-y-1 text-xs sm:col-span-2">
            <label className="font-bold text-[#333333] uppercase tracking-wider text-[9px]">
              Garment Detailed Narrative Description
            </label>
            <textarea
              rows={3}
              disabled={isLoading}
              placeholder="Write elegant, eye-catching copy for the customer catalog page..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-[#E0E0E0] py-2.5 px-3.5 rounded-xl focus:outline-none focus:border-[#007A8A] focus:ring-2 focus:ring-[#007A8A]/10 text-[11px] leading-relaxed text-[#1A1A3A] font-sans resize-y transition-all"
            />
          </div>

          <div className="sm:col-span-2 pt-1 sm:pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#B8941F] text-[#1A1A3A] text-[10px] font-bold uppercase tracking-widest py-3 px-6 sm:px-8 rounded-xl cursor-pointer transition-all active:scale-95 shadow-sm hover:shadow-md disabled:opacity-50"
            >
              {isLoading ? 'Uploading...' : 'Publish SKU to Catalog'}
            </button>
          </div>
        </form>
      </div>

      {/* Real-Time Preview Block */}
      <div className="lg:col-span-5 flex flex-col justify-start space-y-4">
        <div>
          <h4 className="text-xs font-bold text-[#1A1A3A] uppercase tracking-wider flex items-center space-x-1.5">
            <Eye size={12} className="text-[#007A8A]" />
            <span>Real-time Live Card Preview</span>
          </h4>
          <p className="text-[10px] text-[#666666] mt-1 leading-relaxed">
            See exactly how your newly drafted design appears on the storefront page.
          </p>
        </div>

        <div className="bg-white border border-[#E0E0E0] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(26,26,58,0.08)] hover:shadow-[0_12px_36px_rgba(0,122,138,0.12)] transition-shadow group flex flex-col h-full max-w-sm mx-auto w-full">
          <div className="relative aspect-[3/4] overflow-hidden bg-[#F8F8F8]">
            <img
              src={image || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400"}
              alt="Preview product"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />

            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-col gap-1">
              <span className="bg-[#1A1A3A] text-white text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                {categories.find(c => c._id === category || c.id === category)?.name || 'General'}
              </span>
            </div>

            <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4">
              <span
                className={`text-[8px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm ${
                  stock === 0
                    ? 'bg-rose-50 text-rose-700 border-rose-100'
                    : stock <= 5
                    ? 'bg-[#D4AF37]/15 text-[#8A6D16] border-[#D4AF37]/30'
                    : 'bg-[#007A8A]/10 text-[#007A8A] border-[#007A8A]/20'
                }`}
              >
                {stock === 0 ? "Empty" : stock <= 5 ? `Low (${stock})` : `In Stock (${stock})`}
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
            <div className="space-y-1.5">
              <h3 className="font-sans font-extrabold text-[13px] text-[#1A1A3A] tracking-tight leading-snug line-clamp-1">
                {name || "Bespoke Garment Name"}
              </h3>
              <p className="text-[10px] text-[#666666] font-sans line-clamp-2 leading-relaxed">
                {description || "Provide a detailed description to see elegant typography stream here on the card interface."}
              </p>
            </div>

            <div className="flex flex-col xs:flex-row xs:items-baseline xs:justify-between gap-3 mt-4 pt-4 border-t border-[#E0E0E0]">
              <div className="flex items-baseline space-x-2">
                <span className="text-[13px] font-bold text-[#007A8A] font-mono">
                  ₹{price.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {tagInput.split(',').slice(0, 2).map((t, i) => t && (
                  <span
                    key={i}
                    className="bg-[#F8F8F8] border border-[#E0E0E0] text-[#333333] text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md"
                  >
                    {t.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center rounded-2xl z-50">
          <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
            <div className="w-10 h-10 border-4 border-[#1A1A3A] border-t-[#D4AF37] rounded-full animate-spin"></div>
            <p className="text-xs font-extrabold text-[#1A1A3A] uppercase tracking-widest">Publishing SKU...</p>
          </div>
        </div>
      )}
    </div>
  );
}