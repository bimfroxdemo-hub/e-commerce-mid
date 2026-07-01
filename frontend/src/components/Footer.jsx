function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white mt-20">

      {/* TOP SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">

        {/* BRAND */}
        <div>
          <h2 className="text-3xl font-bold tracking-widest">
            LUXE STORE
          </h2>

          <p className="text-gray-400 mt-4 leading-7">
            Premium fashion destination for Men, Women & Kids.
            Discover modern luxury clothing with best quality.
          </p>
        </div>

        {/* MEN */}
        <div>
          <h3 className="text-xl font-semibold mb-4">
            Men
          </h3>

          <ul className="space-y-3 text-gray-400">
            <li className="hover:text-white cursor-pointer">Shirts</li>
            <li className="hover:text-white cursor-pointer">T-Shirts</li>
            <li className="hover:text-white cursor-pointer">Hoodies</li>
            <li className="hover:text-white cursor-pointer">Jeans</li>
          </ul>
        </div>

        {/* WOMEN */}
        <div>
          <h3 className="text-xl font-semibold mb-4">
            Women
          </h3>

          <ul className="space-y-3 text-gray-400">
            <li className="hover:text-white cursor-pointer">Tops</li>
            <li className="hover:text-white cursor-pointer">Dresses</li>
            <li className="hover:text-white cursor-pointer">Kurtis</li>
            <li className="hover:text-white cursor-pointer">Ethnic Wear</li>
          </ul>
        </div>

        {/* KIDS + CONTACT */}
        <div>
          <h3 className="text-xl font-semibold mb-4">
            Kids
          </h3>

          <ul className="space-y-3 text-gray-400 mb-6">
            <li className="hover:text-white cursor-pointer">Frocks</li>
            <li className="hover:text-white cursor-pointer">T-Shirts</li>
            <li className="hover:text-white cursor-pointer">Sets</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2">
            Contact
          </h3>

          <p className="text-gray-400">
            support@luxestore.com
          </p>

          <p className="text-gray-400">
            +91 98765 43210
          </p>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-gray-800 py-6 text-center text-gray-500 text-sm">
        © 2026 LUXE STORE. All Rights Reserved.
      </div>

    </footer>
  );
}

export default Footer;