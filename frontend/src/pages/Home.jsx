import { Link } from "react-router-dom";
import products from "../data/products";
import ProductCard from "../components/ProductCard";
import WhyChoose from "../components/WhyChoose";
function Home() {
    return (
        <>

            {/* HERO - PREMIUM STYLE */}
            <section className="relative h-[95vh] overflow-hidden">

                <img
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8"
                    className="absolute w-full h-full object-cover scale-105"
                    alt=""
                />

                {/* DARK OVERLAY + GRADIENT */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80"></div>

                {/* CONTENT */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-6">

                    <p className="tracking-[6px] text-sm text-gray-300 mb-4">
                        NEW SEASON 2026
                    </p>

                    <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                        Modern Luxury
                        <br />
                        Fashion
                    </h1>

                    <p className="mt-6 text-gray-300 max-w-2xl text-lg">
                        Premium outfits designed for men, women & kids with modern lifestyle aesthetics.
                    </p>

                    <div className="mt-8 flex gap-4">

                        <Link
                            to="/shop"
                            className="bg-white text-black px-8 py-4 rounded-full font-semibold hover:scale-105 transition"
                        >
                            Shop Now
                        </Link>

                        <Link
                            to="/men"
                            className="border border-white px-8 py-4 rounded-full hover:bg-white hover:text-black transition"
                        >
                            Explore
                        </Link>

                    </div>

                </div>

            </section>

            {/* CATEGORY SECTION - PREMIUM CARDS */}
            <section className="max-w-7xl mx-auto px-6 py-28">

                {/* HEADER */}
                <div className="text-center mb-16">

                    <p className="tracking-[6px] text-gray-500 text-sm">
                        SHOP BY STYLE
                    </p>

                    <h2 className="text-5xl font-bold mt-3">
                        Categories
                    </h2>

                    <p className="text-gray-500 mt-4 max-w-xl mx-auto">
                        Explore our premium fashion collections for every lifestyle
                    </p>

                </div>

                {/* GRID */}
                <div className="grid md:grid-cols-3 gap-8">

                    {/* MEN */}
                    <Link
                        to="/men"
                        className="group bg-white  overflow-hidden shadow-sm hover:shadow-2xl transition duration-500"
                    >

                        <div className="overflow-hidden">

                            <img
                                src="https://i.pinimg.com/736x/a9/f2/f9/a9f2f9ba3ea005e260c1fa586ab486f8.jpg"
                                className="h-[400px] w-full object-cover group-hover:scale-110 transition duration-700"
                            />

                        </div>

                        <div className="p-6 text-center">

                            <h3 className="text-2xl font-bold tracking-widest">
                                MEN
                            </h3>

                            <p className="text-gray-500 mt-2">
                                Stylish modern menswear
                            </p>

                            <button className="mt-5 px-6 py-2 border border-black rounded-full text-sm group-hover:bg-black group-hover:text-white transition">
                                Explore
                            </button>

                        </div>

                    </Link>

                    {/* WOMEN */}
                    <Link
                        to="/women"
                        className="group bg-white  overflow-hidden shadow-sm hover:shadow-2xl transition duration-500"
                    >

                        <div className="overflow-hidden">

                            <img
                                src="https://i.pinimg.com/736x/a3/48/f5/a348f573a3b246a1ff2fb8fdaec04ed3.jpg"
                                className="h-[400px] w-full object-cover group-hover:scale-110 transition duration-700"
                            />

                        </div>

                        <div className="p-6 text-center">

                            <h3 className="text-2xl font-bold tracking-widest">
                                WOMEN
                            </h3>

                            <p className="text-gray-500 mt-2">
                                Elegant fashion collection
                            </p>

                            <button className="mt-5 px-6 py-2 border border-black rounded-full text-sm group-hover:bg-black group-hover:text-white transition">
                                Explore
                            </button>

                        </div>

                    </Link>

                    {/* KIDS */}
                    <Link
                        to="/kids"
                        className="group bg-whitel overflow-hidden shadow-sm hover:shadow-2xl transition duration-500"
                    >

                        <div className="overflow-hidden">

                            <img
                                src="https://i.pinimg.com/736x/86/40/05/864005dacb3ce60b3e1f3ff52cc6bcdb.jpg"
                                className="h-[400px] w-full object-cover group-hover:scale-110 transition duration-700"
                            />

                        </div>

                        <div className="p-6 text-center">

                            <h3 className="text-2xl font-bold tracking-widest">
                                KIDS
                            </h3>

                            <p className="text-gray-500 mt-2">
                                Comfortable kids wear
                            </p>

                            <button className="mt-5 px-6 py-2 border border-black rounded-full text-sm group-hover:bg-black group-hover:text-white transition">
                                Explore
                            </button>

                        </div>

                    </Link>

                </div>

            </section>


            {/* TRENDING PRODUCTS - LUXURY GRID */}
            <section className="bg-white py-24">

                <div className="max-w-7xl mx-auto px-6">

                    {/* HEADER */}
                    <div className="flex justify-between items-center mb-14">

                        <h2 className="text-4xl md:text-5xl font-light tracking-tight">
                            Trending <span className="font-semibold">Products</span>
                        </h2>

                        <Link
                            to="/shop"
                            className="text-sm uppercase tracking-[0.3em] border-b border-black pb-1 hover:opacity-60"
                        >
                            View All
                        </Link>

                    </div>

                    {/* GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">

                        {products.slice(0, 6).map((product) => (
                            <div key={product.id} className="group">

                                {/* IMAGE BLOCK */}
                                <div className="relative overflow-hidden">

                                    <img
                                        src={product.image}
                                        alt={product.title}
                                        className="w-full h-[380px] object-cover transition duration-500 group-hover:scale-[1.03]"
                                    />

                                    {/* PRICE BADGE */}
                                    <div className="absolute top-4 left-4 bg-white px-3 py-1 text-sm">
                                        ₹{product.price}
                                    </div>

                                </div>

                                {/* INFO */}
                                <div className="mt-5 flex justify-between items-start">

                                    <div>
                                        <h3 className="text-lg font-medium">
                                            {product.title}
                                        </h3>

                                        <p className="text-gray-500 text-sm mt-1">
                                            {product.category}
                                        </p>
                                    </div>

                                    <button className="text-sm border-b border-black pb-1 hover:opacity-60">
                                        Add
                                    </button>

                                </div>

                            </div>
                        ))}

                    </div>

                </div>

            </section>

            {/* ===============================TESTIMONIALS ===========================================================*/}
            <WhyChoose />

            {/* PREMIUM BANNER */}
            <section className="py-28 text-black text-center">

                <p className="tracking-[6px] text-gray-400">
                    LIMITED OFFER
                </p>

                <h2 className="text-5xl font-bold mt-4">
                    Flat 20% OFF
                </h2>

                <p className="mt-4 text-gray-400">
                    On your first premium order
                </p>

                <Link
                    to="/shop"
                    className="mt-8 inline-block bg-black text-white px-10 py-4 rounded-full font-semibold hover:scale-105 transition"
                >
                    Shop Now
                </Link>

            </section>



        </>
    );
}

export default Home;