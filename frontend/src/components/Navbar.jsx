import { useState } from "react";
import { Link } from "react-router-dom";

import {
  FiSearch,
  FiUser,
  FiPhone,
  FiMenu,
  FiX,
} from "react-icons/fi";

import {
  HiOutlineShoppingBag,
} from "react-icons/hi2";

import {
  FaInstagram,
  FaWhatsapp,
  FaFacebookF,
} from "react-icons/fa";

function Navbar() {

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">

      {/* ========================= */}
      {/* TOP BAR */}
      {/* ========================= */}
      <div className="bg-black text-white">

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 px-4 md:px-6 py-2 text-xs">

          {/* LEFT TEXT */}
          <p className="tracking-[2px] md:tracking-widest text-center text-[10px] sm:text-xs">
            PREMIUM FASHION • FREE SHIPPING ABOVE ₹999
          </p>

          {/* RIGHT */}
          <div className="flex items-center gap-4 text-sm">

            <a
              href="#"
              className="hover:text-pink-400 transition"
            >
              <FaInstagram />
            </a>

            <a
              href="#"
              className="hover:text-green-400 transition"
            >
              <FaWhatsapp />
            </a>

            <a
              href="#"
              className="hover:text-blue-400 transition"
            >
              <FaFacebookF />
            </a>

            <div className="hidden md:flex items-center gap-2 ml-2">
              <FiPhone />
              <span>+91 98765 43210</span>
            </div>

          </div>

        </div>

      </div>

      {/* ========================= */}
      {/* MAIN NAVBAR */}
      {/* ========================= */}
      <nav className="max-w-7xl mx-auto flex justify-between items-center px-4 md:px-6 py-4">

        {/* LOGO */}
        <Link
          to="/"
          className="text-xl sm:text-2xl md:text-3xl font-bold tracking-[3px] md:tracking-[6px]"
        >
          LUXE STORE
        </Link>

        {/* ========================= */}
        {/* DESKTOP MENU */}
        {/* ========================= */}
        <div className="hidden lg:flex items-center gap-8 xl:gap-10 text-[15px] font-medium">

          <Link
            className="hover:text-gray-500 transition"
            to="/"
          >
            Home
          </Link>

          <Link
            className="hover:text-gray-500 transition"
            to="/shop"
          >
            Shop
          </Link>

          <Link
            className="hover:text-gray-500 transition"
            to="/men"
          >
            Men
          </Link>

          <Link
            className="hover:text-gray-500 transition"
            to="/women"
          >
            Women
          </Link>

          <Link
            className="hover:text-gray-500 transition"
            to="/kids"
          >
            Kids
          </Link>

          <Link
            className="hover:text-gray-500 transition"
            to="/contact"
          >
            Contact
          </Link>

        </div>

        {/* ========================= */}
        {/* RIGHT ICONS */}
        {/* ========================= */}
        <div className="flex items-center gap-3 sm:gap-5 text-xl sm:text-2xl">

          {/* SEARCH */}
          <button className="hover:text-gray-500 transition">
            <FiSearch />
          </button>

          {/* USER */}
          <button className="hover:text-gray-500 transition">
            <FiUser />
          </button>

          {/* CART */}
          <Link
            to="/cart"
            className="relative hover:text-gray-500 transition"
          >
            <HiOutlineShoppingBag />

            <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
              2
            </span>
          </Link>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            className="lg:hidden text-2xl ml-1"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>

        </div>

      </nav>

      {/* ========================= */}
      {/* MOBILE / TABLET MENU */}
      {/* ========================= */}
      <div
        className={`lg:hidden bg-white border-t overflow-hidden transition-all duration-300 ${
          menuOpen
            ? "max-h-[500px] py-5"
            : "max-h-0"
        }`}
      >

        <div className="flex flex-col px-6 text-[15px] font-medium">

          <Link
            to="/"
            className="py-3 border-b hover:text-gray-500"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>

          <Link
            to="/shop"
            className="py-3 border-b hover:text-gray-500"
            onClick={() => setMenuOpen(false)}
          >
            Shop
          </Link>

          <Link
            to="/men"
            className="py-3 border-b hover:text-gray-500"
            onClick={() => setMenuOpen(false)}
          >
            Men
          </Link>

          <Link
            to="/women"
            className="py-3 border-b hover:text-gray-500"
            onClick={() => setMenuOpen(false)}
          >
            Women
          </Link>

          <Link
            to="/kids"
            className="py-3 border-b hover:text-gray-500"
            onClick={() => setMenuOpen(false)}
          >
            Kids
          </Link>

          <Link
            to="/contact"
            className="py-3 hover:text-gray-500"
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </Link>

          {/* MOBILE SOCIALS */}
          <div className="flex items-center gap-5 mt-6 text-lg">

            <a
              href="#"
              className="hover:text-pink-500 transition"
            >
              <FaInstagram />
            </a>

            <a
              href="#"
              className="hover:text-green-500 transition"
            >
              <FaWhatsapp />
            </a>

            <a
              href="#"
              className="hover:text-blue-500 transition"
            >
              <FaFacebookF />
            </a>

          </div>

          {/* MOBILE PHONE */}
          <div className="flex items-center gap-2 mt-5 text-sm text-gray-600">

            <FiPhone />

            <span>+91 98765 43210</span>

          </div>

        </div>

      </div>

    </header>
  );
}

export default Navbar;