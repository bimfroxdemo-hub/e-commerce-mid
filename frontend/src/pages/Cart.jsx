import React, { useState } from 'react';
import { useApp } from "../context/AppContext";
import {
  FiTrash2,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiTag,
  FiShield,
  FiCheck,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Cart({ onNavigate }) {
  const {
    cart,
    updateCartQty,
    removeFromCart,
    appliedCoupon,
    applyCouponCode,
  } = useApp();

  const [couponText, setCouponText] = useState("");

  const cartSubtotal = cart.reduce(
    (acc, item) =>
      acc + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );

  const cartCount = cart.reduce(
    (acc, item) => acc + (Number(item.quantity) || 1),
    0
  );

  const cartOriginalTotal = cart.reduce((acc, item) => {
    const orig =
      Number(item.oldPrice) ||
      Math.round((Number(item.price) || 0) * 1.2);

    return acc + orig * (Number(item.quantity) || 1);
  }, 0);

  let discountAmount = 0;

  if (appliedCoupon) {
    if (appliedCoupon.discountType === "fixed") {
      discountAmount = appliedCoupon.value;
    } else if (appliedCoupon.discountType === "percent") {
      discountAmount = Math.round(
        (cartSubtotal * appliedCoupon.value) / 100
      );
    }
  }

  const finalTotal = Math.max(0, cartSubtotal - discountAmount);
  const totalSavings = cartOriginalTotal - cartSubtotal + discountAmount;

  const handleApplyCoupon = (e) => {
    e.preventDefault();

    if (!couponText.trim()) return;

    if (applyCouponCode) {
      const res = applyCouponCode(couponText.trim());

      if (res.success) {
        toast.success(res.message);
        setCouponText("");
      } else {
        toast.error(res.message);
      }
    } else {
      toast.error("Coupon feature not available");
    }
  };

  return (
    <main
      id="cart-page"
      className="min-h-screen w-full overflow-hidden bg-[#F8F8F8] px-3 py-5 sm:px-5 sm:py-8 lg:px-8"
    >
      <div className="mx-auto w-full max-w-[1280px]">
        {cart.length > 0 ? (
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">

            {/* Cart Items */}
            <section className="min-w-0 overflow-hidden rounded-2xl border border-[#E0E0E0] bg-white shadow-sm sm:rounded-3xl">
              <div className="flex flex-col gap-1 border-b border-[#E0E0E0] p-4 sm:flex-row sm:items-end sm:justify-between sm:p-6">
                <div>
                  <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                    Kabiraaz Fashion
                  </p>

                  <h1 className="text-xl font-black text-[#1A1A3A] sm:text-2xl">
                    Shopping Cart
                  </h1>

                  <p className="mt-1 text-xs text-[#666666] sm:text-sm">
                    {cartCount} {cartCount === 1 ? "item" : "items"} in your cart.
                  </p>
                </div>

                <div className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#007A8A] sm:flex">
                  <FiShield size={14} />
                  Secure shopping
                </div>
              </div>

              <div className="divide-y divide-[#E0E0E0]">
                {cart.map((item) => {
                  const itemPrice = Number(item.price) || 0;
                  const itemQty = Number(item.quantity) || 1;
                  const origPrice =
                    Number(item.oldPrice) ||
                    Math.round(itemPrice * 1.2);

                  const discPct =
                    origPrice > itemPrice
                      ? Math.round(
                          ((origPrice - itemPrice) / origPrice) * 100
                        )
                      : 0;

                  const itemId = item.id || item._id;
                  const isInStock = (Number(item.stock) || 0) > 0;

                  return (
                    <article
                      key={itemId}
                      className="flex flex-col gap-4 p-4 transition-colors hover:bg-[#F8F8F8]/70 sm:flex-row sm:gap-5 sm:p-6"
                    >
                      {/* Product Image */}
                      <div
                        className="h-48 w-full shrink-0 cursor-pointer overflow-hidden rounded-xl border border-[#E0E0E0] bg-[#F8F8F8] sm:h-32 sm:w-32 md:h-36 md:w-36"
                        onClick={() =>
                          onNavigate("product-details", {
                            slug: item.slug || itemId,
                          })
                        }
                      >
                        <img
                          src={
                            item.image ||
                            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=300"
                          }
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 space-y-1.5">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-[#007A8A]">
                              {item.brand || "Premium Collection"}
                            </p>

                            <h3
                              onClick={() =>
                                onNavigate("product-details", {
                                  slug: item.slug || itemId,
                                })
                              }
                              className="line-clamp-2 cursor-pointer text-base font-bold leading-snug text-[#1A1A3A] transition-colors hover:text-[#007A8A] sm:text-lg"
                            >
                              {item.name}
                            </h3>

                            <p
                              className={`text-xs font-semibold ${
                                isInStock
                                  ? "text-[#007A8A]"
                                  : "text-red-600"
                              }`}
                            >
                              {isInStock ? "In Stock" : "Out of Stock"}
                            </p>

                            <p className="text-[11px] text-[#666666]">
                              Brand:{" "}
                              <span className="font-semibold text-[#333333]">
                                {item.brand || "Premium Luxe"}
                              </span>
                            </p>
                          </div>

                          {/* Desktop Price */}
                          <div className="hidden shrink-0 text-right sm:block">
                            <p className="font-mono text-lg font-black text-[#1A1A3A] md:text-xl">
                              ₹{(itemPrice * itemQty).toLocaleString()}
                            </p>

                            {origPrice > itemPrice && (
                              <p className="font-mono text-xs text-[#666666] line-through">
                                ₹{(origPrice * itemQty).toLocaleString()}
                              </p>
                            )}

                            {discPct > 0 && (
                              <span className="mt-1 inline-block rounded-full bg-[#D4AF37]/15 px-2 py-0.5 text-[9px] font-bold text-[#8A6D16]">
                                {discPct}% OFF
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <div className="inline-flex h-9 items-center overflow-hidden rounded-xl border border-[#E0E0E0] bg-[#F8F8F8]">
                            <button
                              onClick={() =>
                                updateCartQty(itemId, itemQty - 1)
                              }
                              disabled={itemQty <= 1}
                              className="flex h-full items-center px-3 text-[#333333] transition-colors hover:bg-white hover:text-[#007A8A] disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label="Decrease quantity"
                            >
                              <FiMinus size={13} />
                            </button>

                            <span className="flex h-full min-w-10 items-center justify-center border-x border-[#E0E0E0] px-2 font-mono text-sm font-bold text-[#1A1A3A]">
                              {itemQty}
                            </span>

                            <button
                              onClick={() =>
                                updateCartQty(itemId, itemQty + 1)
                              }
                              className="flex h-full items-center px-3 text-[#333333] transition-colors hover:bg-white hover:text-[#007A8A]"
                              aria-label="Increase quantity"
                            >
                              <FiPlus size={13} />
                            </button>
                          </div>

                          <button
                            onClick={() => {
                              removeFromCart(itemId);
                              toast.success("Item removed");
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-[#666666] transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <FiTrash2 size={13} />
                            Remove
                          </button>
                        </div>

                        {/* Mobile Price */}
                        <div className="mt-4 flex items-center justify-between border-t border-[#E0E0E0] pt-3 sm:hidden">
                          <div>
                            <span className="font-mono text-lg font-black text-[#1A1A3A]">
                              ₹{(itemPrice * itemQty).toLocaleString()}
                            </span>

                            {origPrice > itemPrice && (
                              <span className="ml-2 font-mono text-xs text-[#666666] line-through">
                                ₹{(origPrice * itemQty).toLocaleString()}
                              </span>
                            )}
                          </div>

                          {discPct > 0 && (
                            <span className="rounded-full bg-[#D4AF37]/15 px-2 py-1 text-[9px] font-bold text-[#8A6D16]">
                              {discPct}% OFF
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Subtotal */}
              <div className="flex flex-col gap-2 border-t border-[#E0E0E0] bg-[#F8F8F8] p-4 sm:flex-row sm:items-center sm:justify-end sm:p-5">
                <p className="text-sm text-[#333333] sm:text-base">
                  Subtotal ({cartCount} items):
                  <span className="ml-2 font-mono font-black text-[#1A1A3A]">
                    ₹{cartSubtotal.toLocaleString()}
                  </span>
                </p>
              </div>
            </section>

            {/* Summary Sidebar */}
            <aside className="space-y-4 lg:sticky lg:top-24">

              {/* Delivery Notice */}
              <div className="flex items-start gap-3 rounded-2xl border border-[#007A8A]/20 bg-[#007A8A]/5 p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#007A8A]/10">
                  <FiCheck size={16} className="text-[#007A8A]" />
                </span>

                <div>
                  <p className="text-xs font-bold text-[#007A8A]">
                    Eligible for FREE Delivery
                  </p>
                  <p className="mt-1 text-[10px] leading-relaxed text-[#666666]">
                    Your order qualifies for complimentary delivery.
                  </p>
                </div>
              </div>

              {/* Price Details */}
              <div className="rounded-2xl border border-[#E0E0E0] bg-white p-4 shadow-sm sm:p-5">
                <h3 className="mb-4 border-b border-[#E0E0E0] pb-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#1A1A3A]">
                  Price Details
                </h3>

                <div className="space-y-3 text-sm text-[#333333]">
                  <div className="flex items-center justify-between gap-3">
                    <span>Price ({cartCount} items)</span>
                    <span className="font-mono">
                      ₹{cartOriginalTotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span>Product Discount</span>
                    <span className="font-mono font-semibold text-[#007A8A]">
                      - ₹{(cartOriginalTotal - cartSubtotal).toLocaleString()}
                    </span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#007A8A]/20 bg-[#007A8A]/5 p-2.5 text-[#007A8A]">
                      <span className="flex items-center gap-1.5 text-xs font-bold">
                        <FiTag size={14} />
                        {appliedCoupon.code}
                      </span>

                      <span className="font-mono text-xs font-bold">
                        - ₹{discountAmount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <span>Delivery</span>
                    <span className="font-semibold text-[#007A8A]">
                      Free
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-dashed border-[#E0E0E0] pt-4">
                    <span className="text-base font-black text-[#1A1A3A]">
                      Total
                    </span>

                    <span className="font-mono text-xl font-black text-[#1A1A3A]">
                      ₹{finalTotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="rounded-lg bg-[#D4AF37]/10 px-3 py-2 text-xs font-bold text-[#8A6D16]">
                    You save ₹{totalSavings.toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => onNavigate("checkout")}
                  className="mt-5 w-full rounded-xl bg-[#D4AF37] py-3.5 text-sm font-black uppercase tracking-wider text-[#1A1A3A] shadow-sm transition-all hover:bg-[#B8941F] hover:shadow-md"
                >
                  Proceed to Checkout
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-[#666666]">
                  <FiShield size={15} className="text-[#007A8A]" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    Secure Payments
                  </span>
                </div>
              </div>

              {/* Coupon */}
              <div className="rounded-2xl border border-[#E0E0E0] bg-white p-4 shadow-sm sm:p-5">
                <form onSubmit={handleApplyCoupon} className="space-y-3">
                  <label className="flex items-center gap-2 text-xs font-bold text-[#1A1A3A]">
                    <FiTag size={14} className="text-[#D4AF37]" />
                    Apply Coupon
                  </label>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={couponText}
                      onChange={(e) => setCouponText(e.target.value)}
                      className="min-w-0 flex-1 rounded-xl border border-[#E0E0E0] bg-[#F8F8F8] px-3 py-2.5 text-xs uppercase text-[#1A1A3A] outline-none transition-all placeholder:normal-case placeholder:text-[#666666] focus:border-[#007A8A] focus:bg-white focus:ring-2 focus:ring-[#007A8A]/10"
                    />

                    <button
                      type="submit"
                      className="rounded-xl border border-[#007A8A] bg-white px-4 py-2.5 text-xs font-bold text-[#007A8A] transition-all hover:bg-[#007A8A] hover:text-white"
                    >
                      Apply
                    </button>
                  </div>
                </form>
              </div>
            </aside>
          </div>
        ) : (
          /* Empty Cart */
          <section className="flex min-h-[480px] flex-col items-center justify-center rounded-2xl border border-[#E0E0E0] bg-white px-5 py-16 text-center shadow-sm sm:rounded-3xl">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#007A8A]/10">
              <FiShoppingBag size={42} className="text-[#007A8A]" />
            </div>

            <h2 className="mt-6 text-xl font-black text-[#1A1A3A] sm:text-2xl">
              Your cart is empty
            </h2>

            <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#666666]">
              Discover premium styles from the Kabiraaz Fashion collection and add your favourites here.
            </p>

            <button
              onClick={() => onNavigate("shop")}
              className="mt-6 rounded-xl bg-[#D4AF37] px-8 py-3 text-sm font-black uppercase tracking-wider text-[#1A1A3A] transition-all hover:bg-[#B8941F] hover:shadow-md"
            >
              Continue Shopping
            </button>
          </section>
        )}
      </div>
    </main>
  );
}