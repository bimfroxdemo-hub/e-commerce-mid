import {
  useParams,
  Link,
  useNavigate,
} from "react-router-dom";

import { useState } from "react";

import {
  FiHeart,
  FiMinus,
  FiPlus,
  FiStar,
} from "react-icons/fi";

import products from "../data/products";

function ProductDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const product = products.find(
    (item) => item.id === Number(id)
  );

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl font-bold">
        Product not found
      </div>
    );
  }

  const productImages = [
    product.image,
    product.hoverImage || product.image,
    product.image,
  ];

  const [mainImage, setMainImage] =
    useState(productImages[0]);

  const [qty, setQty] = useState(1);

  // =========================
  // ADD TO CART FUNCTION
  // =========================
  const handleAddToCart = () => {

    const token = localStorage.getItem("token");

    // ❌ NOT LOGIN → GO TO LOGIN PAGE
    if (!token) {
      navigate("/login", {
        state: {
          from: `/product/${product.id}`,
        },
      });
      return;
    }

    // ✅ LOGIN → API CALL
    addToCartAPI(token);
  };

  // =========================
  // API CALL
  // =========================
  const addToCartAPI = async (token) => {

    try {

      const res = await fetch(
        "http://localhost:5000/api/cart/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: product.id.toString(),
            title: product.title,
            price: product.price,
            image: product.image,
            qty,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Added To Cart");
      } else {
        alert(data.message);
      }

    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="bg-[#faf7f2] min-h-screen">

      <section className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16">

        {/* LEFT */}
        <div>

          <div className="relative overflow-hidden rounded-[30px] bg-white">

            <img
              src={mainImage}
              alt={product.title}
              className="w-full h-[700px] object-cover"
            />

            <button className="absolute top-5 right-5 bg-white w-12 h-12 rounded-full flex items-center justify-center shadow">
              <FiHeart />
            </button>

          </div>

          {/* THUMBNAILS */}
          <div className="flex gap-4 mt-5">

            {productImages.map((img, index) => (
              <button
                key={index}
                onClick={() => setMainImage(img)}
                className="w-24 h-24 overflow-hidden rounded-xl border"
              >
                <img
                  src={img}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}

          </div>

        </div>

        {/* RIGHT */}
        <div className="flex flex-col justify-center">

          <h1 className="text-5xl font-bold">
            {product.title}
          </h1>

          {/* RATING */}
          <div className="flex text-yellow-500 mt-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <FiStar key={i} />
            ))}
          </div>

          {/* PRICE */}
          <h2 className="text-4xl font-bold mt-6">
            ₹{product.price}
          </h2>

          {/* DESCRIPTION */}
          <p className="mt-6 text-gray-600 leading-8">
            {product.description}
          </p>

          {/* QUANTITY */}
          <div className="flex items-center gap-5 mt-10">

            <button
              onClick={() =>
                qty > 1 && setQty(qty - 1)
              }
              className="border w-10 h-10 rounded-full flex items-center justify-center"
            >
              <FiMinus />
            </button>

            <span className="text-xl font-semibold">
              {qty}
            </span>

            <button
              onClick={() => setQty(qty + 1)}
              className="border w-10 h-10 rounded-full flex items-center justify-center"
            >
              <FiPlus />
            </button>

          </div>

          {/* BUTTONS */}
          <div className="flex gap-5 mt-12">

            <button
              onClick={handleAddToCart}
              className="bg-black text-white px-10 py-5 rounded-2xl flex-1 hover:bg-gray-900 transition"
            >
              Add To Cart
            </button>

            <Link
              to="/cart"
              className="border border-black px-10 py-5 rounded-2xl flex-1 text-center hover:bg-black hover:text-white transition"
            >
              Go To Cart
            </Link>

          </div>

        </div>

      </section>

    </div>
  );
}

export default ProductDetails;