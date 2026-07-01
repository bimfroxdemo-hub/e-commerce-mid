import { useEffect, useState } from "react";
import {
  FaTrash,
  FaShoppingBag,
  FaPlus,
  FaMinus,
} from "react-icons/fa";

function Cart() {

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [qty, setQty] = useState(1);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });

  // ================= FETCH CART =================

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {

    try {

      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) return;

      const res = await fetch(
        `http://localhost:5000/api/cart/${user.id}`
      );

      const data = await res.json();

      setCart(data.items || []);

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }
  };

  // ================= REMOVE ITEM =================

  const removeItem = async (productId) => {

    try {

      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/cart/remove",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId }),
        }
      );

      const data = await res.json();

      setCart(data.items || []);

    } catch (err) {

      console.log(err);

    }
  };

  // ================= OPEN CHECKOUT =================

  const openCheckout = (item) => {

    setSelectedItem(item);
    setQty(item.qty || 1);
    setShowCheckout(true);

  };

  // ================= TOTAL =================

  const itemTotal = selectedItem?.price * qty || 0;

  // ================= PLACE ORDER =================

  const placeOrder = async (e) => {

    e.preventDefault();

    try {

      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: [{ ...selectedItem, qty }],
            amount: itemTotal,
            shippingInfo: formData,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {

        alert("Order placed successfully");

        setShowCheckout(false);

        fetchCart();

      } else {

        alert(data.message);

      }

    } catch (err) {

      console.log(err);

    }
  };

  // ================= LOADING =================

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Loading...
      </div>
    );
  }

  // ================= UI =================

  return (

    <section className="min-h-screen bg-gray-100 py-10 px-4">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="flex items-center gap-3 mb-10">

          <FaShoppingBag className="text-4xl text-black" />

          <h1 className="text-4xl font-bold">
            Shopping Cart
          </h1>

        </div>

        {/* EMPTY CART */}

        {cart.length === 0 ? (

          <div className="bg-white rounded-3xl p-16 text-center shadow-sm">

            <p className="text-gray-500 text-lg">
              Your cart is empty
            </p>

          </div>

        ) : (

          <div className="space-y-6">

            {cart.map((item, index) => (

              <div
                key={index}
                className="bg-white rounded-3xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-center gap-5"
              >

                {/* LEFT */}

                <div className="flex items-center gap-5">

                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-28 h-28 object-cover rounded-2xl"
                  />

                  <div>

                    <h2 className="text-xl font-semibold">
                      {item.title}
                    </h2>

                    <p className="text-gray-500 mt-1">
                      ₹{item.price}
                    </p>

                    <p className="text-sm text-gray-400 mt-1">
                      Qty : {item.qty}
                    </p>

                  </div>

                </div>

                {/* BUTTONS */}

                <div className="flex gap-3">

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="px-5 py-3 border border-red-500 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition flex items-center gap-2"
                  >
                    <FaTrash />
                    Remove
                  </button>

                  <button
                    onClick={() => openCheckout(item)}
                    className="px-5 py-3 bg-black text-white rounded-xl hover:opacity-90 transition"
                  >
                    Checkout
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      {/* ================= CHECKOUT MODAL ================= */}

      {showCheckout && selectedItem && (

        <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">

          <div className="bg-white w-full max-w-xl rounded-3xl p-8">

            <h2 className="text-3xl font-bold mb-6">
              Checkout
            </h2>

            {/* PRODUCT */}

            <div className="mb-5">

              <h3 className="text-lg font-semibold">
                {selectedItem.title}
              </h3>

              <p className="text-gray-500">
                ₹{selectedItem.price}
              </p>

            </div>

            {/* QTY */}

            <div className="flex items-center gap-4 mb-5">

              <button
                onClick={() => qty > 1 && setQty(qty - 1)}
                className="p-3 bg-gray-100 rounded-lg"
              >
                <FaMinus />
              </button>

              <span className="text-xl font-bold">
                {qty}
              </span>

              <button
                onClick={() => setQty(qty + 1)}
                className="p-3 bg-gray-100 rounded-lg"
              >
                <FaPlus />
              </button>

            </div>

            {/* TOTAL */}

            <p className="text-2xl font-bold mb-6">
              Total : ₹{itemTotal}
            </p>

            {/* FORM */}

            <form
              onSubmit={placeOrder}
              className="space-y-4"
            >

              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                required
                className="w-full border p-4 rounded-xl"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [e.target.name]: e.target.value,
                  })
                }
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="w-full border p-4 rounded-xl"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [e.target.name]: e.target.value,
                  })
                }
              />

              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                required
                className="w-full border p-4 rounded-xl"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [e.target.name]: e.target.value,
                  })
                }
              />

              <textarea
                name="address"
                placeholder="Address"
                required
                className="w-full border p-4 rounded-xl"
                rows="4"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [e.target.name]: e.target.value,
                  })
                }
              />

              {/* PLACE ORDER */}

              <button
                type="submit"
                className="w-full bg-black text-white py-4 rounded-xl font-semibold hover:opacity-90 transition"
              >
                Place Order
              </button>

            </form>

            {/* CLOSE */}

            <button
              onClick={() => setShowCheckout(false)}
              className="mt-5 text-red-500"
            >
              Close
            </button>

          </div>

        </div>

      )}

    </section>
  );
}

export default Cart;