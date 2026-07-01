import ProductCard from "../components/ProductCard";
import products from "../data/products";
import { Link } from "react-router-dom";

function Men() {
  const menProducts = products.filter(
    (item) => item.category === "men"
  );

  return (
    <div className="bg-white">

      {/* HERO */}
      <section className="bg-gray-100 py-20 text-center">

        <p className="text-sm tracking-[6px] text-gray-500">
          MEN COLLECTION
        </p>

        <h1 className="text-5xl font-bold mt-4">
          Modern Style
        </h1>

        <p className="text-gray-600 mt-4 max-w-xl mx-auto">
          Discover premium outfits designed for confident and modern men.
        </p>
      </section>

      {/* PRODUCTS */}
      <section className="max-w-7xl mx-auto px-6 py-16">

        <div className="flex justify-between items-center mb-10">

          <h2 className="text-3xl font-bold">
            Trending Men Wear
          </h2>

          <Link
            to="/shop"
            className="text-sm underline"
          >
            View All
          </Link>

        </div>

        <div className="grid md:grid-cols-3 gap-8">

          {menProducts.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}

        </div>

      </section>

    </div>
  );
}

export default Men;