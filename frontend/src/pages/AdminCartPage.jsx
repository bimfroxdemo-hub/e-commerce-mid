import { useEffect, useState } from "react";
import {
  FaUser,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function AdminCartPage() {

  const navigate = useNavigate();

  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // ADMIN CHECK
  // =========================
  useEffect(() => {

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    const role = user?.role?.toLowerCase();

    if (!token || !user || role !== "admin") {
      navigate("/admin-login");
      return;
    }

    fetchCarts();

  }, []);

  // =========================
  // FETCH CARTS
  // =========================
  const fetchCarts = async () => {

    try {

      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/admin/carts",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ FIXED
          },
        }
      );

      const data = await res.json();

      console.log("ADMIN CART API:", data);

      // ✅ SAFE HANDLING (IMPORTANT FIX)
      const cartData =
        data.carts ||
        data.data ||
        data.cart ||
        data ||
        [];

      setCarts(Array.isArray(cartData) ? cartData : []);

    } catch (err) {
      console.log(err);
      setCarts([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // TOTALS
  // =========================
  const totalRevenue = carts.reduce(
    (acc, cart) =>
      acc +
      (cart.items || []).reduce(
        (sum, item) => sum + item.price * item.qty,
        0
      ),
    0
  );

  const totalProducts = carts.reduce(
    (acc, cart) => acc + (cart.items?.length || 0),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#f5f5f5] p-6 md:p-10">

      {/* HEADER */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold">
          Cart Management
        </h1>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">

        <div className="bg-white p-6 rounded-3xl">
          <p>Total Carts</p>
          <h2 className="text-4xl font-bold mt-3">{carts.length}</h2>
        </div>

        <div className="bg-white p-6 rounded-3xl">
          <p>Products</p>
          <h2 className="text-4xl font-bold mt-3">{totalProducts}</h2>
        </div>

        <div className="bg-white p-6 rounded-3xl">
          <p>Cart Value</p>
          <h2 className="text-4xl font-bold mt-3">₹{totalRevenue}</h2>
        </div>

      </div>

      {/* EMPTY */}
      {carts.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-3xl">
          <h2 className="text-3xl font-bold">No carts found</h2>
        </div>
      ) : (

        <div className="space-y-8">

          {carts.map((cart, index) => {

            const cartTotal = (cart.items || []).reduce(
              (acc, item) => acc + item.price * item.qty,
              0
            );

            return (
              <div key={index} className="bg-white rounded-3xl">

                {/* USER */}
                <div className="p-6 border-b flex justify-between">

                  <div className="flex items-center gap-4">
                    <FaUser className="text-3xl" />
                    <div>
                      <h2 className="font-bold text-xl">
                        User Cart
                      </h2>
                      <p className="text-gray-500">
                        {cart.userId}
                      </p>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold">
                    ₹{cartTotal}
                  </h2>

                </div>

                {/* ITEMS */}
                <div className="p-6 space-y-5">

                  {(cart.items || []).map((item, i) => (
                    <div key={i} className="flex justify-between border p-4 rounded-2xl">

                      <div className="flex gap-4">
                        <img
                          src={item.image}
                          className="w-20 h-20 object-cover rounded-xl"
                        />

                        <div>
                          <h3 className="font-bold">{item.title}</h3>
                          <p>Qty: {item.qty}</p>
                          <p>₹{item.price}</p>
                        </div>
                      </div>

                      <h3 className="font-bold text-xl">
                        ₹{item.price * item.qty}
                      </h3>

                    </div>
                  ))}

                </div>

              </div>
            );

          })}

        </div>
      )}

    </section>
  );
}

export default AdminCartPage;