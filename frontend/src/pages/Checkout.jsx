import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  FaCreditCard,
  FaMoneyBillWave,
  FaLock,
  FaTimes,
} from "react-icons/fa";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const cart = location.state?.cart || [];

  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // TOTAL CALCULATION (FIXED)
  // =========================
  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  const shipping = 0;
  const totalAmount = subtotal + shipping;

  // =========================
  // PLACE ORDER
  // =========================
  const placeOrder = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    // ONLINE PAYMENT
    if (paymentMethod === "online") {
      alert("Redirecting To Razorpay Payment...");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart,
          amount: totalAmount,
          paymentMethod,
          shippingInfo: formData,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Order placed successfully");
        setShowPopup(false);
        navigate("/");
      } else {
        alert(data.message || "Order failed");
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // EMPTY CART CHECK
  // =========================
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl font-semibold">
        No Product Selected
      </div>
    );
  }

  return (
    <section className="bg-[#f5f5f5] min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-10">
          <FaLock />
          <h1 className="text-5xl font-bold">Checkout</h1>
        </div>

        {/* PRODUCT LIST */}
        <div className="bg-white p-6 md:p-8">
          {cart.map((item, index) => (
            <div key={index} className="flex gap-6 border-b pb-6 mb-6">
              <img
                src={item.image}
                className="w-32 h-32 object-cover"
                alt=""
              />

              <div>
                <h2 className="text-2xl font-bold">{item.title}</h2>
                <p className="text-xl mt-2">₹{item.price}</p>
                <p>Qty: {item.qty}</p>
              </div>
            </div>
          ))}

          <h2 className="text-3xl font-bold">
            Total: ₹{totalAmount}
          </h2>

          <button
            onClick={() => setShowPopup(true)}
            className="w-full bg-black text-white py-5 mt-6"
          >
            Order Now
          </button>
        </div>
      </div>

      {/* POPUP */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl p-6 relative">

            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4"
            >
              <FaTimes />
            </button>

            <h2 className="text-3xl font-bold mb-6">
              Shipping Details
            </h2>

            <form onSubmit={placeOrder}>

              <input
                name="fullName"
                placeholder="Full Name"
                onChange={handleChange}
                className="border p-3 w-full mb-3"
                required
              />

              <input
                name="email"
                placeholder="Email"
                onChange={handleChange}
                className="border p-3 w-full mb-3"
                required
              />

              <input
                name="phone"
                placeholder="Phone"
                onChange={handleChange}
                className="border p-3 w-full mb-3"
                required
              />

              <textarea
                name="address"
                placeholder="Address"
                onChange={handleChange}
                className="border p-3 w-full mb-3"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-4 mt-4"
              >
                {loading ? "Processing..." : "Place Order"}
              </button>

            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Checkout;