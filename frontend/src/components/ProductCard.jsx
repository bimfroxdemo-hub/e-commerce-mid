import { Link } from "react-router-dom";

function ProductCard({ product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group relative block overflow-hidden bg-white shadow-sm hover:shadow-xl transition duration-300"
    >

      {/* MAIN IMAGE */}
      <img
        src={product.image}
        alt={product.title}
        loading="lazy"
        className="w-full h-[420px] object-cover transition duration-700 ease-in-out group-hover:scale-105 group-hover:opacity-0"
      />

      {/* HOVER IMAGE */}
      <img
        src={product.hoverImage || product.image}
        alt={`${product.title} back view`}
        loading="lazy"
        className="absolute inset-0 w-full h-[420px] object-cover opacity-0 group-hover:opacity-100 transition duration-700 ease-in-out group-hover:scale-105"
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition duration-500" />

      {/* PRODUCT INFO */}
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white translate-y-10 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition duration-500">

        <h2 className="text-lg font-semibold tracking-wide">
          {product.title}
        </h2>

        <p className="text-sm text-gray-200 mt-1">
          ₹ {product.price}
        </p>

      </div>

    </Link>
  );
}

export default ProductCard;