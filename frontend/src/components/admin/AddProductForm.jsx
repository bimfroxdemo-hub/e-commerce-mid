import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Eye, CheckCircle2, Sliders } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddProductForm() {
  const { addProduct } = useApp();

  // Single Product state fields
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("Luxe Atelier");
  const [category, setCategory] = useState("Women");
  const [price, setPrice] = useState(5000);
  const [oldPrice, setOldPrice] = useState(7000);
  const [stock, setStock] = useState(15);
  const [image, setImage] = useState("");
  const [tagInput, setTagInput] = useState("new");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price) {
      toast.error("Product name and list price are required.");
      return;
    }

    const tagsArray = tagInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

    if (stock <= 5 && stock > 0) {
      tagsArray.push('low-stock');
    } else if (stock === 0) {
      tagsArray.push('out-of-stock');
    }

    addProduct({
      name,
      brand,
      category,
      price: Number(price),
      oldPrice: Number(oldPrice) || Number(price) * 1.3,
      stock: Number(stock),
      description: description || "Expertly crafted premium addition to our boutique catalog.",
      image: image || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400",
      tags: tagsArray.length ? tagsArray : ["new"]
    });

    toast.success(`Published "${name}" SKU successfully!`);

    // Reset Form Fields
    setName("");
    setPrice(5000);
    setOldPrice(7000);
    setStock(15);
    setImage("");
    setTagInput("new");
    setDescription("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
      
      {/* Creation Form Block */}
      <div className="lg:col-span-7 space-y-5 sm:space-y-6">
        <div>
          <h4 className="text-xs font-bold text-[#1A1A3A] uppercase tracking-wider">
            Form: Deploy Single Product SKU
          </h4>
          <p className="text-[10px] text-[#666666] mt-1 leading-relaxed">
            Define category, list price, initial stock, designer brand, and detail tags to append to the catalog memory pool.
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
              placeholder="e.g. Italian Silk Cocktail Dress"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-[#E0E0E0] py-2.5 px-3.5 rounded-xl focus:outline-none focus:border-[#007A8A] focus:ring-2 focus:ring-[#007A8A]/10 text-[11px] text-[#1A1A3A] font-semibold transition-all"
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-[#333333] uppercase tracking-wider text-[9px]">
              Designer Brand *
            </label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full bg-white border border-[#E0E0E0] py-2.5 px-3 rounded-xl focus:outline-none focus:border-[#007A8A] focus:ring-2 focus:ring-[#007A8A]/10 text-[11px] font-medium text-[#1A1A3A] cursor-pointer transition-all"
            >
              <option value="Luxe Atelier">Luxe Atelier</option>
              <option value="Veloce">Veloce</option>
              <option value="Aero">Aero</option>
              <option value="Vanguard">Vanguard</option>
            </select>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-[#333333] uppercase tracking-wider text-[9px]">
              Boutique Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white border border-[#E0E0E0] py-2.5 px-3 rounded-xl focus:outline-none focus:border-[#007A8A] focus:ring-2 focus:ring-[#007A8A]/10 text-[11px] font-medium text-[#1A1A3A] cursor-pointer transition-all"
            >
              <option value="Women">Women</option>
              <option value="Men">Men</option>
              <option value="Kids">Kids</option>
              <option value="Accessories">Accessories</option>
              <option value="Footwear">Footwear</option>
            </select>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-[#333333] uppercase tracking-wider text-[9px]">
              List Price (₹ INR) *
            </label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full bg-white border border-[#E0E0E0] py-2.5 px-3 rounded-xl focus:outline-none focus:border-[#007A8A] focus:ring-2 focus:ring-[#007A8A]/10 text-[11px] text-[#1A1A3A] font-mono font-bold transition-all"
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-[#333333] uppercase tracking-wider text-[9px]">
              Sticker Old Price (₹ INR)
            </label>
            <input
              type="number"
              value={oldPrice}
              onChange={(e) => setOldPrice(Number(e.target.value))}
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
              placeholder="Write elegant, eye-catching copy for the customer catalog page..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-[#E0E0E0] py-2.5 px-3.5 rounded-xl focus:outline-none focus:border-[#007A8A] focus:ring-2 focus:ring-[#007A8A]/10 text-[11px] leading-relaxed text-[#1A1A3A] font-sans resize-y transition-all"
            />
          </div>

          <div className="sm:col-span-2 pt-1 sm:pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#B8941F] text-[#1A1A3A] text-[10px] font-bold uppercase tracking-widest py-3 px-6 sm:px-8 rounded-xl cursor-pointer transition-all active:scale-95 shadow-sm hover:shadow-md"
            >
              Publish SKU to Catalog
            </button>
          </div>
        </form>
      </div>

      {/* Real-Time Luxury Card Preview Block */}
      <div className="lg:col-span-5 flex flex-col justify-start space-y-4">
        <div>
          <h4 className="text-xs font-bold text-[#1A1A3A] uppercase tracking-wider flex items-center space-x-1.5">
            <Eye size={12} className="text-[#007A8A]" />
            <span>Real-time Live Card Preview</span>
          </h4>
          <p className="text-[10px] text-[#666666] mt-1 leading-relaxed">
            See exactly how your newly drafted design appears on the customer storefront page.
          </p>
        </div>

        {/* Storefront card replica */}
        <div className="bg-white border border-[#E0E0E0] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(26,26,58,0.08)] hover:shadow-[0_12px_36px_rgba(0,122,138,0.12)] transition-shadow group flex flex-col h-full max-w-sm mx-auto w-full">
          <div className="relative aspect-[3/4] overflow-hidden bg-[#F8F8F8]">
            <img
              src={image || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400"}
              alt="Preview product"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />

            {/* Badges Overlay */}
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-col gap-1">
              <span className="bg-[#1A1A3A] text-white text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                {category}
              </span>
              <span className="bg-white/85 backdrop-blur-md text-[#1A1A3A] border border-[#007A8A]/20 text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                {brand}
              </span>
            </div>

            {/* In-stock Badge Overlay */}
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
                {description || "Provide a detailed narrative description to see elegant typography stream here on the card interface."}
              </p>
            </div>

            <div className="flex flex-col xs:flex-row xs:items-baseline xs:justify-between gap-3 mt-4 pt-4 border-t border-[#E0E0E0]">
              <div className="flex items-baseline space-x-2">
                <span className="text-[13px] font-bold text-[#007A8A] font-mono">
                  ₹{price.toLocaleString()}
                </span>

                {oldPrice && oldPrice > price && (
                  <span className="text-[10px] text-[#666666] line-through font-mono">
                    ₹{oldPrice.toLocaleString()}
                  </span>
                )}
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

    </div>
  );
}