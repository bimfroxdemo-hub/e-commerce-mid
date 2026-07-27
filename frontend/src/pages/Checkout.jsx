import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { checkoutAPI } from '../services/api'; // ✅ API methods import kiya gaya hai
import {
  FiCheckCircle,
  FiShield,
  FiArrowLeft,
  FiTag,
  FiUser,
  FiPhone,
  FiMapPin,
  FiCreditCard,
  FiSmartphone,
  FiSend,
  FiBox,
  FiHeart,
  FiPlus,
  FiEdit2,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Checkout({ onNavigate }) {
  const { cart, appliedCoupon, clearCart, currentUser, setOrders } = useApp();

  const savedAddresses = currentUser?.address || [];

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(savedAddresses.length === 0);

  const [fullName, setFullName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [orderSuccessId, setOrderSuccessId] = useState(null);
  
  // 🔥 Processing state to disable button on click
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (savedAddresses.length > 0) {
      const defaultAddr =
        savedAddresses.find((a) => a.isDefault) || savedAddresses[0];

      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id);
        setFullName(defaultAddr.fullName || currentUser?.name || "");
        setPhone(defaultAddr.phone || currentUser?.phone || "");
        setStreet(defaultAddr.street || "");
        setCity(defaultAddr.city || "");
        setStateName(defaultAddr.state || "");
        setPincode(defaultAddr.pincode || "");
      }
    }
  }, []);

  // Helper function: Razorpay Checkout script ko dynamically load karne ke liye
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr._id);
    setUseNewAddress(false);
    setFullName(addr.fullName || "");
    setPhone(addr.phone || "");
    setStreet(addr.street || "");
    setCity(addr.city || "");
    setStateName(addr.state || "");
    setPincode(addr.pincode || "");
  };

  const handleUseNewAddress = () => {
    setSelectedAddressId(null);
    setUseNewAddress(true);
    setFullName(currentUser?.name || "");
    setPhone(currentUser?.phone || "");
    setStreet("");
    setCity("");
    setStateName("");
    setPincode("");
  };

  const cartSubtotal = cart.reduce(
    (acc, item) =>
      acc +
      (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );

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

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!fullName || !phone || !street || !city || !pincode) {
      toast.error("Please fill all shipping details.");
      return;
    }

    setIsProcessing(true);

    try {
      const checkoutData = {
        customerInfo: {
          name: fullName,
          email: currentUser?.email || "customer@luxestore.com",
          phone: phone,
        },
        shippingAddress: {
          name: fullName, 
          email: currentUser?.email || "customer@luxestore.com", 
          phone: phone, 
          address: street, 
          city: city, 
          state: stateName, 
          pincode: pincode, 
          country: 'India',
        },
        billingAddress: {
          name: fullName,
          address: street,
          city: city,
          state: stateName,
          pincode: pincode,
          country: 'India',
        },
        paymentMethod: (paymentMethod === 'upi' || paymentMethod === 'card') ? 'card' : 'cod', 
        notes: '',
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        items: cart.map(item => ({
          product: item._id || item.id,
          quantity: item.quantity,
        }))
      };

      console.log('🛒 Outgoing Checkout Payload:', checkoutData);

      const response = await checkoutAPI.processCheckout(checkoutData);

      if (!response.success) {
        toast.error(response.message || "Failed to process checkout.");
        setIsProcessing(false);
        return;
      }

      // ✅ Trigger Razorpay modal on checkout screen
      if (response.data?.requiresPayment) {
        const { razorpayOrder, order } = response.data;

        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          toast.error("Razorpay SDK failed to load. Are you connected to the internet?");
          setIsProcessing(false);
          return;
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TEwh63sWlSdMfX", // ✅ Fixed: using new active Key ID as fallback
          amount: razorpayOrder.amount, 
          currency: razorpayOrder.currency,
          name: 'Kabiraaz Fashion',
          description: 'Secure Order Payment',
          order_id: razorpayOrder.id,
          handler: async function (rzpRes) {
            setIsProcessing(true);
            try {
              const verificationPayload = {
                razorpay_order_id: rzpRes.razorpay_order_id,
                razorpay_payment_id: rzpRes.razorpay_payment_id,
                razorpay_signature: rzpRes.razorpay_signature,
                orderId: order._id, 
              };

              const verificationRes = await checkoutAPI.verifyPayment(verificationPayload);

              if (verificationRes.success) {
                // Success screen setup
                setOrderSuccessId(order.orderId || order._id);
                clearCart();
                toast.success("Order Placed Successfully! 🎉");
              } else {
                toast.error(verificationRes.message || "Payment verification failed.");
              }
            } catch (err) {
              console.error(err);
              toast.error("Something went wrong during payment verification.");
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            name: fullName,
            contact: phone,
            email: currentUser?.email || "customer@luxestore.com",
          },
          theme: {
            color: '#007A8A', 
          },
          modal: {
            ondismiss: function () {
              toast.error("Payment modal cancelled.");
              setIsProcessing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();

      } else {
        // Cash on Delivery (COD) Flow
        const finalOrder = response.data.order;
        setOrderSuccessId(finalOrder.orderId || finalOrder._id);
        clearCart();
        toast.success("Order Placed (COD) Successfully! 🎉");
        setIsProcessing(false);
      }

    } catch (error) {
      console.error(error);
      toast.error(error.message || "An unexpected error occurred during checkout.");
      setIsProcessing(false);
    }
  };

  if (orderSuccessId) {
    return (
      <main className="min-h-screen bg-[#F8F8F8] px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto w-full max-w-xl space-y-7 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#007A8A]/10 text-[#007A8A] shadow-sm sm:h-24 sm:w-24">
            <FiCheckCircle size={52} className="sm:h-16 sm:w-16" />
          </div>

          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
              Kabiraaz Fashion
            </p>

            <h1 className="font-display text-2xl font-black uppercase text-[#1A1A3A] sm:text-3xl">
              Order Placed
            </h1>

            <p className="mt-2 text-xs text-[#666666] sm:text-sm">
              Thank you for shopping with us. Your order has been confirmed.
            </p>
          </div>

          <div className="space-y-4 rounded-2xl border border-[#E0E0E0] bg-white p-5 text-left shadow-sm sm:rounded-3xl sm:p-7">
            <div className="flex flex-col gap-2 border-b border-[#E0E0E0] pb-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
                Order ID
              </span>

              <span className="font-mono text-lg font-black text-[#007A8A]">
                {orderSuccessId}
              </span>
            </div>

            <p className="flex items-start gap-3 text-sm text-[#666666]">
              <FiUser className="mt-0.5 shrink-0 text-[#D4AF37]" />
              <strong className="text-[#1A1A3A]">{fullName}</strong>
            </p>

            <p className="flex items-start gap-3 text-sm leading-relaxed text-[#666666]">
              <FiMapPin className="mt-0.5 shrink-0 text-[#D4AF37]" />
              <span>
                {street}, {city}
                {stateName ? `, ${stateName}` : ""} - {pincode}
              </span>
            </p>

            <p className="flex items-center gap-3 text-sm text-[#666666]">
              <FiCreditCard className="text-[#D4AF37]" />
              <strong className="font-mono text-[#1A1A3A]">
                ₹{finalTotal.toLocaleString()}
              </strong>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={() => onNavigate("home")}
              className="rounded-xl border border-[#E0E0E0] bg-white px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-[#1A1A3A] transition-all hover:border-[#007A8A] hover:text-[#007A8A]"
            >
              Back to Store
            </button>

            <button
              onClick={() => onNavigate("user-orders")}
              className="rounded-xl bg-[#D4AF37] px-4 py-3.5 text-xs font-black uppercase tracking-wider text-[#1A1A3A] transition-all hover:bg-[#B8941F]"
            >
              Track Order
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#F8F8F8] px-3 py-5 sm:px-5 sm:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6 sm:space-y-8">

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#E0E0E0] pb-5 sm:pb-6">
          <button
            onClick={() => onNavigate("cart")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E0E0E0] bg-white text-[#1A1A3A] transition-all hover:border-[#007A8A] hover:text-[#007A8A]"
          >
            <FiArrowLeft size={18} />
          </button>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#D4AF37]">
              Kabiraaz Fashion
            </p>

            <h1 className="font-display text-xl font-black uppercase text-[#1A1A3A] sm:text-2xl">
              Secure Checkout
            </h1>
          </div>
        </div>

        <form
          onSubmit={handlePlaceOrder}
          className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12 lg:gap-7"
        >
          <div className="space-y-5 lg:col-span-7">

            {/* Saved Addresses */}
            {savedAddresses.length > 0 && (
              <section className="rounded-2xl border border-[#E0E0E0] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
                <div className="flex items-center gap-3 border-b border-[#E0E0E0] pb-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#007A8A]/10 text-[#007A8A]">
                    <FiMapPin size={17} />
                  </span>

                  <h3 className="text-sm font-black uppercase tracking-wider text-[#1A1A3A]">
                    Select Delivery Address
                  </h3>
                </div>

                <div className="mt-5 space-y-3">
                  {savedAddresses.map((addr) => {
                    const isSelected =
                      selectedAddressId === addr._id && !useNewAddress;

                    return (
                      <label
                        key={addr._id}
                        onClick={() => handleSelectAddress(addr)}
                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition-all sm:gap-4 sm:p-5 ${
                          isSelected
                            ? "border-[#007A8A] bg-[#007A8A]/5 shadow-sm"
                            : "border-[#E0E0E0] bg-white hover:border-[#007A8A]/50"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                            isSelected
                              ? "border-[#007A8A] bg-[#007A8A]"
                              : "border-[#E0E0E0]"
                          }`}
                        >
                          {isSelected && (
                            <FiCheckCircle
                              className="text-white"
                              size={10}
                            />
                          )}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold uppercase text-[#1A1A3A] sm:text-sm">
                              {addr.label || "Address"}
                            </span>

                            {addr.isDefault && (
                              <span className="rounded-full bg-[#D4AF37]/15 px-2 py-0.5 text-[8px] font-black text-[#8A6D16]">
                                DEFAULT
                              </span>
                            )}
                          </div>

                          <p className="text-xs font-bold text-[#333333] sm:text-sm">
                            {addr.fullName}
                          </p>

                          <p className="mt-1 text-xs leading-relaxed text-[#666666] sm:text-sm">
                            {addr.street}, {addr.city}, {addr.state} -{" "}
                            {addr.pincode}
                          </p>

                          <p className="mt-1 flex items-center gap-1 text-xs text-[#666666] sm:text-sm">
                            <FiPhone size={12} className="text-[#007A8A]" />
                            {addr.phone}
                          </p>
                        </div>
                      </label>
                    );
                  })}

                  <label
                    onClick={handleUseNewAddress}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed p-4 transition-all sm:gap-4 sm:p-5 ${
                      useNewAddress
                        ? "border-[#007A8A] bg-[#007A8A]/5"
                        : "border-[#E0E0E0] hover:border-[#007A8A]"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        useNewAddress
                          ? "border-[#007A8A] bg-[#007A8A]"
                          : "border-[#E0E0E0]"
                      }`}
                    >
                      {useNewAddress && (
                        <FiCheckCircle className="text-white" size={10} />
                      )}
                    </span>

                    <span className="flex items-center gap-2 text-xs font-bold text-[#007A8A] sm:text-sm">
                      <FiPlus size={16} />
                      Deliver to a new address
                    </span>
                  </label>
                </div>
              </section>
            )}

            {/* Address Form */}
            <section className="rounded-2xl border border-[#E0E0E0] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
              <div className="flex items-center gap-3 border-b border-[#E0E0E0] pb-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D4AF37]/15 text-[#D4AF37]">
                  <FiMapPin size={17} />
                </span>

                <h3 className="text-sm font-black uppercase tracking-wider text-[#1A1A3A]">
                  {useNewAddress || savedAddresses.length === 0
                    ? "Delivery Address"
                    : "Edit Delivery Details"}
                </h3>
              </div>

              {!useNewAddress && savedAddresses.length > 0 ? (
                <div className="mt-5 rounded-2xl border border-[#E0E0E0] bg-[#F8F8F8] p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#1A1A3A]">
                        {fullName}
                      </p>

                      <p className="mt-1 text-xs leading-relaxed text-[#666666] sm:text-sm">
                        {street}, {city}, {stateName} - {pincode}
                      </p>

                      <p className="mt-1 text-xs text-[#666666] sm:text-sm">
                        Phone: {phone}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleUseNewAddress}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-[#007A8A] hover:bg-[#007A8A]/10"
                    >
                      <FiEdit2 size={12} />
                      Change
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  {[
                    {
                      label: "Full Name",
                      value: fullName,
                      setValue: setFullName,
                      type: "text",
                    },
                    {
                      label: "Phone Number",
                      value: phone,
                      setValue: setPhone,
                      type: "tel",
                    },
                    {
                      label: "Street Address",
                      value: street,
                      setValue: setStreet,
                      type: "text",
                      full: true,
                    },
                    {
                      label: "City",
                      value: city,
                      setValue: setCity,
                      type: "text",
                    },
                    {
                      label: "State",
                      value: stateName,
                      setValue: setStateName,
                      type: "text",
                    },
                    {
                      label: "Pincode",
                      value: pincode,
                      setValue: setPincode,
                      type: "text",
                    },
                  ].map((field) => (
                    <label
                      key={field.label}
                      className={field.full ? "sm:col-span-2" : ""}
                    >
                      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#666666]">
                        {field.label}
                      </span>

                      <input
                        type={field.type}
                        required
                        placeholder={field.label}
                        value={field.value}
                        onChange={(e) => field.setValue(e.target.value)}
                        className="w-full rounded-xl border border-[#E0E0E0] bg-[#F8F8F8] px-3.5 py-3 text-xs text-[#1A1A3A] outline-none transition-all placeholder:text-[#666666] focus:border-[#007A8A] focus:bg-white focus:ring-2 focus:ring-[#007A8A]/10 sm:text-sm"
                      />
                    </label>
                  ))}
                </div>
              )}
            </section>

            {/* Payment */}
            <section className="rounded-2xl border border-[#E0E0E0] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
              <div className="flex items-center gap-3 border-b border-[#E0E0E0] pb-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#007A8A]/10 text-[#007A8A]">
                  <FiCreditCard size={17} />
                </span>

                <h3 className="text-sm font-black uppercase tracking-wider text-[#1A1A3A]">
                  Payment Method
                </h3>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  {
                    id: "upi",
                    title: "UPI / NetBanking",
                    icon: <FiSmartphone size={21} />,
                  },
                  {
                    id: "card",
                    title: "Credit / Debit Card",
                    icon: <FiCreditCard size={21} />,
                  },
                  {
                    id: "cod",
                    title: "Cash on Delivery",
                    icon: <FiSend size={21} />,
                  },
                ].map((pm) => {
                  const isSelected = paymentMethod === pm.id;

                  return (
                    <label
                      key={pm.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition-all sm:gap-4 sm:p-5 ${
                        isSelected
                          ? "border-[#1A1A3A] bg-[#1A1A3A]/5"
                          : "border-[#E0E0E0] hover:border-[#007A8A]/50"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                          isSelected
                            ? "border-[#1A1A3A] bg-[#1A1A3A]"
                            : "border-[#E0E0E0]"
                        }`}
                      >
                        {isSelected && (
                          <FiCheckCircle className="text-white" size={10} />
                        )}
                      </span>

                      <span
                        className={
                          isSelected
                            ? "text-[#007A8A]"
                            : "text-[#666666]"
                        }
                      >
                        {pm.icon}
                      </span>

                      <p className="text-xs font-bold uppercase text-[#1A1A3A] sm:text-sm">
                        {pm.title}
                      </p>

                      <input
                        type="radio"
                        name="payment"
                        checked={isSelected}
                        onChange={() => setPaymentMethod(pm.id)}
                        className="hidden"
                      />
                    </label>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Order Summary */}
          <aside className="lg:sticky lg:top-24 lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-[#E0E0E0] bg-white shadow-sm sm:rounded-3xl">
              <div className="flex items-center gap-3 border-b border-[#E0E0E0] p-4 sm:p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D4AF37]/15 text-[#D4AF37]">
                  <FiBox size={17} />
                </span>

                <h3 className="text-sm font-black uppercase tracking-wider text-[#1A1A3A]">
                  Order Summary ({cart.length})
                </h3>
              </div>

              <div className="max-h-[320px] space-y-4 overflow-y-auto p-4 sm:p-6">
                {cart.map((item) => (
                  <div
                    key={item.id || item._id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={
                          item.image ||
                          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=80"
                        }
                        alt={item.name}
                        className="h-14 w-14 shrink-0 rounded-xl border border-[#E0E0E0] bg-[#F8F8F8] object-cover"
                      />

                      <div className="min-w-0">
                        <p className="line-clamp-2 text-xs font-bold text-[#1A1A3A] sm:text-sm">
                          {item.name}
                        </p>

                        <p className="mt-1 text-[10px] text-[#666666]">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>

                    <p className="shrink-0 font-mono text-xs font-black text-[#1A1A3A] sm:text-sm">
                      ₹
                      {(
                        (Number(item.price) || 0) *
                        (Number(item.quantity) || 1)
                      ).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-[#E0E0E0] p-4 sm:p-6">
                <div className="flex justify-between text-sm text-[#333333]">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold">
                    ₹{cartSubtotal.toLocaleString()}
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-[#007A8A]">
                    <span className="flex items-center gap-1">
                      <FiTag size={14} />
                      {appliedCoupon.code}
                    </span>

                    <span className="font-mono">
                      -₹{discountAmount.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm text-[#333333]">
                  <span>Shipping</span>
                  <span className="font-semibold text-[#007A8A]">
                    Free
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-dashed border-[#E0E0E0] pt-4">
                  <span className="text-lg font-black text-[#1A1A3A]">
                    Total
                  </span>

                  <span className="font-mono text-xl font-black text-[#1A1A3A] sm:text-2xl">
                    ₹{finalTotal.toLocaleString()}
                  </span>
                </div>

                {/* Place Order Button with dynamic disable & loading states */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] py-3.5 text-xs font-black uppercase tracking-widest text-[#1A1A3A] transition-all hover:bg-[#B8941F] hover:shadow-md sm:text-sm ${
                    isProcessing ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isProcessing ? (
                    <span>Processing Order...</span>
                  ) : (
                    <>
                      <FiHeart size={16} />
                      <span>Place Order</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 pt-1 text-[#666666]">
                  <FiShield size={15} className="text-[#007A8A]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Secure Payments
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}