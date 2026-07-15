import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiTag, FiShield, FiHeart, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Cart({ onNavigate }) {
  const { cart, updateCartQty, removeFromCart, clearCart, appliedCoupon, applyCouponCode } = useApp();
  const [couponText, setCouponText] = useState("");

  const cartSubtotal = cart.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const cartCount = cart.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
  const cartOriginalTotal = cart.reduce((acc, item) => { const orig = Number(item.oldPrice) || Math.round((Number(item.price) || 0) * 1.2); return acc + (orig * (Number(item.quantity) || 1)); }, 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "fixed") discountAmount = appliedCoupon.value;
    else if (appliedCoupon.discountType === "percent") discountAmount = Math.round((cartSubtotal * appliedCoupon.value) / 100);
  }
  const finalTotal = Math.max(0, cartSubtotal - discountAmount);
  const totalSavings = (cartOriginalTotal - cartSubtotal) + discountAmount;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponText.trim()) return;
    if (applyCouponCode) {
      const res = applyCouponCode(couponText.trim());
      if (res.success) { toast.success(res.message); setCouponText(""); }
      else { toast.error(res.message); }
    } else { toast.error("Coupon feature not available"); }
  };

  return (
    <div id="cart-page" className="bg-[#f1f3f6] min-h-screen py-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {cart.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-5 items-start">
            <div className="flex-1 w-full bg-white shadow-sm rounded-md overflow-hidden border border-gray-200/60">
              <div className="p-5 border-b border-gray-200 flex justify-between items-end">
                <div><h1 className="text-2xl font-semibold text-gray-900">Shopping Cart</h1><p className="text-sm text-gray-500 mt-1">{cartCount} items in your cart.</p></div>
              </div>
              <div className="divide-y divide-gray-200">
                {cart.map((item) => {
                  const itemPrice = Number(item.price) || 0;
                  const itemQty = Number(item.quantity) || 1;
                  const origPrice = Number(item.oldPrice) || Math.round(itemPrice * 1.2);
                  const discPct = origPrice > itemPrice ? Math.round(((origPrice - itemPrice) / origPrice) * 100) : 0;
                  return (
                    <div key={item.id || item._id} className="p-5 flex flex-col sm:flex-row gap-6 hover:bg-gray-50/50 transition-colors">
                      <div className="w-full sm:w-36 h-36 flex-shrink-0 cursor-pointer" onClick={() => onNavigate('product-details', { slug: item.slug || item.id || item._id })}>
                        <img src={item.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200'} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1.5">
                            <h3 onClick={() => onNavigate('product-details', { slug: item.slug || item.id || item._id })} className="text-lg font-medium text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer line-clamp-2">{item.name}</h3>
                            <p className={`text-sm font-medium ${(Number(item.stock) || 0) > 0 ? 'text-[#007600]' : 'text-rose-500'}`}>{(Number(item.stock) || 0) > 0 ? 'In Stock' : 'Out of Stock'}</p>
                            <p className="text-xs text-gray-500">Brand: <span className="font-medium text-gray-800">{item.brand || 'Premium Luxe'}</span></p>
                          </div>
                          <div className="text-right hidden sm:block">
                            <p className="text-xl font-bold text-gray-900">₹{(itemPrice * itemQty).toLocaleString()}</p>
                            {origPrice > itemPrice && <p className="text-sm text-gray-500 line-through">₹{(origPrice * itemQty).toLocaleString()}</p>}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-4 pt-2">
                          <div className="flex items-center border border-gray-300 rounded-sm bg-white overflow-hidden shadow-sm h-8">
                            <button onClick={() => updateCartQty(item.id || item._id, itemQty - 1)} disabled={itemQty <= 1} className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 h-full flex items-center disabled:opacity-50"><FiMinus size={12} /></button>
                            <span className="px-4 font-semibold text-sm border-x border-gray-300 h-full flex items-center">{itemQty}</span>
                            <button onClick={() => updateCartQty(item.id || item._id, itemQty + 1)} className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 h-full flex items-center"><FiPlus size={12} /></button>
                          </div>
                          <button onClick={() => { removeFromCart(item.id || item._id); toast.success("Item removed"); }} className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline font-medium">Delete</button>
                        </div>
                        <div className="block sm:hidden mt-4">
                          <span className="text-xl font-bold text-gray-900">₹{(itemPrice * itemQty).toLocaleString()}</span>
                          {discPct > 0 && <span className="text-sm text-[#007600] font-medium ml-2">{discPct}% off</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-5 bg-white flex justify-end items-center"><p className="text-lg text-gray-900">Subtotal ({cartCount} items): <span className="font-bold">₹{cartSubtotal.toLocaleString()}</span></p></div>
            </div>

            <div className="w-full lg:w-[360px] sticky top-24 space-y-4">
              <div className="bg-white p-4 shadow-sm rounded-md border border-gray-200/60 flex items-start gap-3">
                <FiCheck size={18} className="text-[#007600] mt-0.5" />
                <div><p className="text-sm font-medium text-[#007600]">Eligible for FREE Delivery.</p></div>
              </div>
              <div className="bg-white p-5 shadow-sm rounded-md border border-gray-200/60">
                <h3 className="text-gray-500 font-bold uppercase tracking-wider text-xs border-b border-gray-200 pb-3 mb-4">Price Details</h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex justify-between"><span>Price ({cartCount} items)</span><span>₹{cartOriginalTotal.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Discount</span><span className="text-[#007600] font-medium">- ₹{(cartOriginalTotal - cartSubtotal).toLocaleString()}</span></div>
                  {appliedCoupon && (<div className="flex justify-between bg-green-50 p-2 rounded text-[#007600]"><span className="font-medium flex items-center gap-1"><FiTag size={14}/> {appliedCoupon.code}</span><span className="font-bold">- ₹{discountAmount.toLocaleString()}</span></div>)}
                  <div className="flex justify-between"><span>Delivery</span><span className="text-[#007600] font-medium">Free</span></div>
                  <div className="border-t border-dashed border-gray-300 pt-3 flex justify-between items-center"><span className="text-lg font-bold text-gray-900">Total</span><span className="text-xl font-bold text-gray-900">₹{finalTotal.toLocaleString()}</span></div>
                  <div className="text-sm text-[#007600] font-medium">You save ₹{totalSavings.toLocaleString()}</div>
                </div>
                <button onClick={() => onNavigate('checkout')} className="w-full mt-4 bg-[#fb641b] hover:bg-[#e05a18] text-white font-bold py-3.5 rounded-sm shadow-sm text-[15px]">Proceed to Checkout</button>
                <div className="mt-4 flex items-center justify-center gap-2 text-gray-500"><FiShield size={16} /><span className="text-xs">Secure Payments</span></div>
              </div>
              <div className="bg-white p-5 shadow-sm rounded-md border border-gray-200/60">
                <form onSubmit={handleApplyCoupon} className="space-y-3">
                  <label className="text-sm font-medium text-gray-800 block">Apply Coupon</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Enter code (LUXE15)" className="flex-1 border border-gray-300 rounded-sm px-3 py-2 text-sm uppercase outline-none" value={couponText} onChange={(e) => setCouponText(e.target.value)} />
                    <button type="submit" className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium px-4 py-2 rounded-sm text-sm">Apply</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-md border border-gray-200/60 py-20 px-4 flex flex-col items-center justify-center text-center">
            <FiShoppingBag size={64} className="text-gray-300 mb-6" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty!</h2>
            <p className="text-sm text-gray-500 mb-6">Add items to get started.</p>
            <button onClick={() => onNavigate('shop')} className="bg-[#2874f0] hover:bg-[#1b64d8] text-white font-medium px-10 py-3 rounded-sm">Shop Now</button>
          </div>
        )}
      </div>
    </div>
  );
}