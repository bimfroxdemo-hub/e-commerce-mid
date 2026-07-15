import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FiCheckCircle, FiShield, FiTruck, FiArrowLeft, FiTag, FiUser, FiPhone, FiMapPin, FiGlobe, FiCreditCard, FiSmartphone, FiSend, FiBox, FiHeart, FiPlus, FiEdit2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Checkout({ onNavigate }) {
  const { cart, appliedCoupon, clearCart, currentUser, setOrders } = useApp();

  // ✅ Saved addresses from user profile
  const savedAddresses = currentUser?.address || [];

  // ✅ Selected address state
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

  // ✅ Auto-select default address on mount
  useEffect(() => {
    if (savedAddresses.length > 0) {
      const defaultAddr = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
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

  // ✅ Handle address selection
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

  // ✅ Handle "Use New Address"
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

  const cartSubtotal = cart.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "fixed") discountAmount = appliedCoupon.value;
    else if (appliedCoupon.discountType === "percent") discountAmount = Math.round((cartSubtotal * appliedCoupon.value) / 100);
  }
  const finalTotal = Math.max(0, cartSubtotal - discountAmount);

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!fullName || !phone || !street || !city || !pincode) { toast.error("Please fill all shipping details."); return; }

    const newOrderId = "LUX-" + Math.floor(10000 + Math.random() * 90000);
    const newOrderObj = {
      id: newOrderId, userId: currentUser?.id || 101, date: new Date().toISOString().split('T')[0],
      items: [...cart], subtotal: cartSubtotal, discount: discountAmount, shipping: 0, total: finalTotal,
      paymentMethod: paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'card' ? 'Credit Card' : 'COD',
      shippingAddress: { fullName, street, city, state: stateName, zipCode: pincode, phone },
      status: "Ordered", trackingId: "",
      timeline: [{ title: "Order Placed", time: new Date().toLocaleTimeString(), active: true }, { title: "Confirmed", time: "", active: false }, { title: "Shipped", time: "", active: false }, { title: "Delivered", time: "", active: false }]
    };

    setOrders((prev) => [newOrderObj, ...prev]);
    setOrderSuccessId(newOrderId);
    clearCart();
    toast.success("Order Placed Successfully! 🎉");
  };

  if (orderSuccessId) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-8">
        <div className="p-6 bg-emerald-50 text-emerald-600 rounded-full w-fit mx-auto"><FiCheckCircle size={64} /></div>
        <h1 className="font-display font-extrabold text-3xl text-black uppercase">Order Placed!</h1>
        <div className="bg-white border border-gray-100 rounded-3xl p-8 text-left text-sm space-y-5 shadow-sm">
          <div className="flex justify-between border-b border-gray-50 pb-4"><span className="font-bold text-gray-500 uppercase">Order ID</span><span className="text-lg font-black text-black font-mono">{orderSuccessId}</span></div>
          <p className="flex items-center gap-2 text-gray-500"><FiUser /><strong className="text-black">{fullName}</strong></p>
          <p className="flex items-center gap-2 text-gray-500"><FiMapPin />{street}, {city} - {pincode}</p>
          <p className="flex items-center gap-2 text-gray-500"><FiCreditCard />₹{finalTotal.toLocaleString()}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => onNavigate('home')} className="border-2 border-gray-200 text-gray-700 font-bold text-sm py-4 rounded-xl uppercase cursor-pointer">Back to Store</button>
          <button onClick={() => onNavigate('user-orders')} className="bg-black text-white font-bold text-sm py-4 rounded-xl uppercase cursor-pointer">Track Order</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-6">
        <button onClick={() => onNavigate('cart')} className="p-2 hover:bg-slate-100 rounded-full cursor-pointer"><FiArrowLeft size={20} /></button>
        <h1 className="font-display font-extrabold text-2xl uppercase text-black">Secure Checkout</h1>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">

          {/* ✅ SAVED ADDRESSES SECTION */}
          {savedAddresses.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-base text-black uppercase pb-5 border-b border-gray-100 flex items-center gap-2">
                <FiMapPin size={18} />
                Select Delivery Address
              </h3>

              <div className="mt-5 space-y-3">
                {savedAddresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`flex items-start gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all ${
                      selectedAddressId === addr._id && !useNewAddress
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                        : 'border-gray-100 hover:border-gray-300 bg-white'
                    }`}
                    onClick={() => handleSelectAddress(addr)}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                      selectedAddressId === addr._id && !useNewAddress ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                    }`}>
                      {selectedAddressId === addr._id && !useNewAddress && <FiCheckCircle className="text-white" size={10} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-gray-800 uppercase">{addr.label || 'Address'}</span>
                        {addr.isDefault && (
                          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">DEFAULT</span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-700">{addr.fullName}</p>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                        {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                        <FiPhone size={12} /> {addr.phone}
                      </p>
                    </div>
                  </label>
                ))}

                {/* Use New Address Option */}
                <label
                  className={`flex items-center gap-4 p-5 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                    useNewAddress
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-gray-200 hover:border-gray-400 bg-white'
                  }`}
                  onClick={handleUseNewAddress}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    useNewAddress ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                  }`}>
                    {useNewAddress && <FiCheckCircle className="text-white" size={10} />}
                  </div>
                  <div className="flex items-center gap-2">
                    <FiPlus size={16} className="text-blue-600" />
                    <span className="text-sm font-bold text-blue-600">Deliver to a new address</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* ✅ ADDRESS FORM (shows when new address selected or no saved addresses) */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-base text-black uppercase pb-5 border-b border-gray-100 flex items-center gap-2">
              <FiMapPin size={18} />
              {useNewAddress || savedAddresses.length === 0 ? 'Delivery Address' : 'Edit Delivery Details'}
            </h3>

            {(!useNewAddress && savedAddresses.length > 0) ? (
              /* Show selected address summary (read-only with edit option) */
              <div className="mt-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{fullName}</p>
                    <p className="text-sm text-gray-600 mt-1">{street}, {city}, {stateName} - {pincode}</p>
                    <p className="text-sm text-gray-600 mt-1">Phone: {phone}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleUseNewAddress}
                    className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1"
                  >
                    <FiEdit2 size={12} /> Change
                  </button>
                </div>
              </div>
            ) : (
              /* Full address form */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                <input type="text" required placeholder="Full Name" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-black" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                <input type="tel" required placeholder="Phone Number" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-black" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <input type="text" required placeholder="Street Address" className="sm:col-span-2 w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-black" value={street} onChange={(e) => setStreet(e.target.value)} />
                <input type="text" required placeholder="City" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-black" value={city} onChange={(e) => setCity(e.target.value)} />
                <input type="text" required placeholder="State" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-black" value={stateName} onChange={(e) => setStateName(e.target.value)} />
                <input type="text" required placeholder="Pincode" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-black" value={pincode} onChange={(e) => setPincode(e.target.value)} />
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-base text-black uppercase pb-5 border-b border-gray-100 flex items-center gap-2"><FiCreditCard size={18} />Payment Method</h3>
            <div className="mt-5 space-y-4">
              {[{ id: "upi", title: "UPI / NetBanking", icon: <FiSmartphone size={22} /> }, { id: "card", title: "Credit / Debit Card", icon: <FiCreditCard size={22} /> }, { id: "cod", title: "Cash on Delivery", icon: <FiSend size={22} /> }].map((pm) => (
                <label key={pm.id} className={`flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === pm.id ? 'border-black bg-slate-50' : 'border-gray-100 hover:border-gray-300'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === pm.id ? 'border-black bg-black' : 'border-gray-300'}`}>{paymentMethod === pm.id && <FiCheckCircle className="text-white" size={10} />}</div>
                  <div className="text-gray-400">{pm.icon}</div>
                  <p className="text-sm font-bold text-black uppercase">{pm.title}</p>
                  <input type="radio" name="payment" checked={paymentMethod === pm.id} onChange={() => setPaymentMethod(pm.id)} className="hidden" />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm sticky top-8">
            <div className="p-6 border-b border-gray-50"><h3 className="font-bold text-base text-black uppercase flex items-center gap-2"><FiBox size={18} />Order Summary ({cart.length})</h3></div>
            <div className="p-6 space-y-4 max-h-[320px] overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id || item._id} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3"><img src={item.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=60'} alt={item.name} className="w-14 h-14 object-cover rounded-xl bg-slate-50" /><div><p className="text-sm font-semibold text-black line-clamp-1">{item.name}</p><p className="text-xs text-gray-400">Qty: {item.quantity}</p></div></div>
                  <p className="text-sm font-black text-black">₹{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 space-y-3">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span className="font-semibold">₹{cartSubtotal.toLocaleString()}</span></div>
              {appliedCoupon && <div className="flex justify-between text-sm text-emerald-600"><span><FiTag size={14} className="inline" /> {appliedCoupon.code}</span><span>-₹{discountAmount.toLocaleString()}</span></div>}
              <div className="flex justify-between text-sm"><span>Shipping</span><span className="text-emerald-600">Free</span></div>
              <div className="border-t pt-3 flex justify-between"><span className="text-lg font-bold">Total</span><span className="text-2xl font-extrabold">₹{finalTotal.toLocaleString()}</span></div>
            </div>
            <div className="px-6 pb-6">
              <button type="submit" className="w-full bg-black hover:bg-gray-800 text-white font-bold text-sm uppercase tracking-widest py-4 rounded-xl cursor-pointer flex items-center justify-center gap-2"><FiHeart size={16} />Place Order</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}