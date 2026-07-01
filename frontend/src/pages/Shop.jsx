import products from "../data/products";
import ProductCard from "../components/ProductCard";
import { FiSearch } from "react-icons/fi";
import { useState } from "react";

function Shop() {

  const [search, setSearch] = useState("");

  // =========================
  // FILTER PRODUCTS
  // =========================
  const filteredProducts = products.filter((product) =>
    product.title
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <section className="bg-[#f8f8f8] min-h-screen py-16">

      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* ========================= */}
        {/* TOP SECTION */}
        {/* ========================= */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14">

          {/* LEFT */}
          <div>

            <p className="uppercase tracking-[6px] text-gray-400 text-sm font-medium">
              Premium Fashion
            </p>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mt-4 leading-tight">
              Shop Collection
            </h1>

            <div className="w-28 h-[4px] bg-black mt-6"></div>

          </div>

          {/* SEARCH */}
          <div className="relative w-full lg:w-[350px]">

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full bg-white border border-gray-200 py-4 pl-14 pr-5 outline-none focus:border-black transition"
            />

            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-gray-500" />

          </div>

        </div>

        {/* ========================= */}
        {/* PRODUCT GRID */}
        {/* ========================= */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-8">

          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <div
                key={index}
                className="bg-white overflow-hidden shadow-sm hover:shadow-2xl transition duration-300 hover:-translate-y-1"
              >
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white p-16 text-center shadow-sm">

              <h2 className="text-3xl font-bold mb-4">
                No Products Found
              </h2>

              <p className="text-gray-500">
                Try searching something else
              </p>

            </div>
          )}

        </div>

      </div>

    </section>
  );
}

export default Shop;