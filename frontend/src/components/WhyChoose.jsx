import {
  FiTruck,
  FiShield,
  FiHeadphones,
  FiRefreshCw,
} from "react-icons/fi";

function WhyChooseUs() {
  return (
    <section className="bg-[#1a1a1a] py-24 overflow-hidden">

      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* ========================= */}
        {/* TOP */}
        {/* ========================= */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-20">

          <div>

            <p className="uppercase tracking-[6px] text-gray-400 text-sm">
              Why Choose Us
            </p>

            <h2 className="text-4xl text-white md:text-6xl font-bold mt-4 leading-tight">
              Luxury Fashion <br />
              Shopping Experience
            </h2>

          </div>

          <p className="text-gray-500 max-w-xl leading-8 text-lg">
            Discover premium quality fashion with
            fast delivery, secure payments and
            customer-first service designed for
            modern shopping.
          </p>

        </div>

        {/* ========================= */}
        {/* FEATURES */}
        {/* ========================= */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4">

          {/* BOX 1 - WHITE */}
          <div className="bg-white text-black p-10 hover:bg-black hover:text-white transition duration-500">

            <div className="text-5xl mb-8">
              <FiTruck />
            </div>

            <h3 className="text-2xl font-bold mb-4">
              Free Shipping
            </h3>

            <p className="leading-8 text-gray-600 hover:text-gray-300 transition">
              Free delivery available on all
              premium fashion orders above ₹999.
            </p>

          </div>

          {/* BOX 2 - BLACK */}
          <div className="bg-black text-white p-10 hover:bg-white hover:text-black transition duration-500">

            <div className="text-5xl mb-8">
              <FiShield />
            </div>

            <h3 className="text-2xl font-bold mb-4">
              Secure Payment
            </h3>

            <p className="leading-8 text-gray-400">
              Trusted and secure payment gateways
              for worry-free online shopping.
            </p>

          </div>

          {/* BOX 3 - WHITE */}
          <div className="bg-white text-black p-10 hover:bg-black hover:text-white transition duration-500">

            <div className="text-5xl mb-8">
              <FiHeadphones />
            </div>

            <h3 className="text-2xl font-bold mb-4">
              24/7 Support
            </h3>

            <p className="leading-8 text-gray-600">
              Our support team is always available
              whenever you need assistance.
            </p>

          </div>

          {/* BOX 4 - BLACK */}
          <div className="bg-black text-white p-10 hover:bg-white hover:text-black transition duration-500">

            <div className="text-5xl mb-8">
              <FiRefreshCw />
            </div>

            <h3 className="text-2xl font-bold mb-4">
              Easy Returns
            </h3>

            <p className="leading-8 text-gray-400">
              Smooth and hassle-free return and
              exchange process for all products.
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}

export default WhyChooseUs;