import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FiHeart, FiShoppingBag, FiStar, FiTruck, FiShield, FiCornerDownLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';

export default function ProductDetails({ routeParams, onNavigate, onQuickView }) {
  const { products, cart, wishlist, toggleWishlist, addToCart, trackProductView } = useApp();
  const slug = routeParams?.slug;

  const product = products.find((p) => p.slug === slug || p.id === slug || p._id === slug) || products[0];

  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    if (product) {
      setActiveImage(product.image || '');
      if (trackProductView) trackProductView(product);
    }
  }, [product]);

  if (!product) return <div className="p-20 text-center text-gray-500">Product not found.</div>;

  const productId = product.id || product._id;
  const productSlug = product.slug || product.id || product._id;
  const productStock = Number(product.stock) || 0;
  const isInStock = productStock > 0;
  const productPrice = Number(product.price) || 0;
  const productOldPrice = Number(product.oldPrice) || 0;
  const discountPercent = productOldPrice > productPrice ? Math.round(((productOldPrice - productPrice) / productOldPrice) * 100) : 0;

  const isWishlisted = wishlist.some((item) => item.id === productId || item._id === productId);
  const isInCart = cart.some((item) => item.id === productId || item._id === productId);

  const handleAddToCart = () => {
    if (!isInStock) { toast.error("This item is out of stock."); return; }
    addToCart(product, qty);
    toast.success(`${qty}x ${product.name} added to bag!`);
  };

  const handleBuyNow = () => {
    if (!isInStock) { toast.error("This item is out of stock."); return; }
    addToCart(product, qty);
    onNavigate('checkout');
  };

  const handleWishlist = () => {
    toggleWishlist(product);
    if (!isWishlisted) { toast.success("Added to wishlist", { icon: '❤️' }); }
    else { toast.error("Removed from wishlist"); }
  };

  const relatedProducts = products.filter((p) => (p.category || '').toLowerCase() === (product.category || '').toLowerCase() && (p.id || p._id) !== productId).slice(0, 4);

  return (
    <div id="product-details-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      <nav className="text-xs text-gray-400 font-bold uppercase tracking-wider">
        <button onClick={() => onNavigate('home')} className="hover:text-black">Home</button><span className="mx-2">/</span>
        <button onClick={() => onNavigate('shop')} className="hover:text-black">Shop</button><span className="mx-2">/</span>
        <span className="text-gray-800 truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-[4/5] w-full rounded-3xl overflow-hidden bg-slate-50 border border-gray-100 relative group">
            <img src={activeImage || product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            {discountPercent > 0 && (<div className="absolute top-4 left-4"><span className="bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">{discountPercent}% OFF</span></div>)}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-3">
              {product.images.map((img, i) => (<button key={i} onClick={() => setActiveImage(img)} className={`w-20 aspect-square rounded-xl overflow-hidden border-2 transition-all bg-slate-50 cursor-pointer ${activeImage === img ? 'border-black scale-105' : 'border-transparent hover:border-gray-200'}`}><img src={img} alt="Thumb" className="w-full h-full object-cover" /></button>))}
            </div>
          )}
        </div>

        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{product.brand || 'Luxe Atelier'}</span>
              <div className="flex items-center space-x-1"><FiStar size={13} className="text-amber-400 fill-amber-400" /><span className="text-sm font-bold text-gray-800">{product.rating || 5.0}</span><span className="text-xs text-gray-400">({product.reviewsCount || 0})</span></div>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-black uppercase tracking-tight">{product.name}</h1>
            <div className="flex items-baseline space-x-4">
              <span className="text-3xl font-bold text-black">₹{productPrice.toLocaleString()}</span>
              {productOldPrice > productPrice && (<span className="text-base text-gray-400 line-through">₹{productOldPrice.toLocaleString()}</span>)}
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>
            <p className={`text-sm font-medium ${isInStock ? 'text-emerald-600' : 'text-rose-500'}`}>{isInStock ? `In Stock (${productStock} available)` : 'Out of Stock'}</p>

            <div className="space-y-2.5 pt-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Select Size</span>
              <div className="flex space-x-3">
                {["S", "M", "L", "XL"].map((sz) => (<button key={sz} onClick={() => setSelectedSize(sz)} className={`w-11 h-11 rounded-xl text-xs font-bold border transition-all cursor-pointer ${selectedSize === sz ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-black'}`}>{sz}</button>))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
              <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 bg-white space-x-4">
                <span className="text-xs text-gray-400 font-bold uppercase">Qty</span>
                <div className="flex items-center space-x-3">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-1 text-gray-500 hover:text-black">-</button>
                  <span className="font-bold text-sm w-4 text-center">{qty}</span>
                  <button onClick={() => setQty(Math.min(productStock, qty + 1))} className="p-1 text-gray-500 hover:text-black">+</button>
                </div>
              </div>
              <button onClick={handleAddToCart} disabled={!isInStock} className={`flex-1 bg-black hover:bg-gray-800 text-white py-3.5 px-8 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md cursor-pointer flex items-center justify-center space-x-3 ${!isInStock ? 'opacity-50 cursor-not-allowed' : ''}`}><FiShoppingBag size={14}/><span>{isInCart ? 'Added to Bag' : 'Add To Bag'}</span></button>
              <button onClick={handleBuyNow} disabled={!isInStock} className={`bg-gray-800 hover:bg-black text-white py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer ${!isInStock ? 'opacity-50 cursor-not-allowed' : ''}`}>Buy Now</button>
              <button onClick={handleWishlist} className={`p-3.5 rounded-xl border transition-all cursor-pointer ${isWishlisted ? 'bg-rose-50 border-rose-200 text-rose-500' : 'border-gray-200 text-gray-400 hover:text-rose-500'}`}><FiHeart size={18} className={isWishlisted ? 'fill-current' : ''} /></button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
            <div className="flex flex-col items-center text-center p-3 bg-slate-50 rounded-2xl"><FiTruck className="text-black mb-1.5" size={16} /><span className="text-[10px] font-bold text-gray-800 uppercase">Free Shipping</span></div>
            <div className="flex flex-col items-center text-center p-3 bg-slate-50 rounded-2xl"><FiShield className="text-black mb-1.5" size={16} /><span className="text-[10px] font-bold text-gray-800 uppercase">Secure Payment</span></div>
            <div className="flex flex-col items-center text-center p-3 bg-slate-50 rounded-2xl"><FiCornerDownLeft className="text-black mb-1.5" size={16} /><span className="text-[10px] font-bold text-gray-800 uppercase">Easy Returns</span></div>
          </div>
        </div>
      </div>

      <section className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex border-b border-gray-100 overflow-x-auto space-x-6">
          {[{ id: "description", label: "Description" }, { id: "specifications", label: "Specifications" }, { id: "delivery", label: "Delivery" }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-3 text-xs uppercase tracking-widest font-bold border-b-2 cursor-pointer whitespace-nowrap ${activeTab === tab.id ? 'border-black text-black' : 'border-transparent text-gray-400'}`}>{tab.label}</button>
          ))}
        </div>
        <div className="text-sm leading-relaxed text-gray-500 max-w-3xl">
          {activeTab === "description" && <p>{product.description}</p>}
          {activeTab === "specifications" && (<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{Object.entries(product.specs || { Material: 'Premium Blend', Origin: 'India' }).map(([key, val]) => (<div key={key} className="flex justify-between border-b border-gray-50 py-2 text-xs"><span className="font-bold text-gray-700 uppercase">{key}</span><span className="text-gray-500">{val}</span></div>))}</div>)}
          {activeTab === "delivery" && (<ul className="list-disc pl-5 space-y-1.5 text-xs"><li>Metros: 2-3 working days</li><li>Rest of India: 4-5 working days</li><li>Free shipping on orders above ₹999</li></ul>)}
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <h2 className="font-display font-extrabold text-2xl text-black uppercase">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((item) => (<ProductCard key={item.id || item._id} product={item} onNavigate={onNavigate} onQuickView={onQuickView} />))}
          </div>
        </section>
      )}
    </div>
  );
}