import {
  FaInstagram,
  FaWhatsapp,
  FaFacebookF,
} from "react-icons/fa";

import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiSend,
} from "react-icons/fi";

function Contact() {
  return (
    <section className="bg-[#f8f8f8] min-h-screen py-16 md:py-24">

      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* ========================= */}
        {/* TOP SECTION */}
        {/* ========================= */}
        <div className="mb-16">

          <p className="uppercase tracking-[6px] text-gray-400 text-sm font-medium">
            Contact Support
          </p>

          <h1 className="text-4xl md:text-6xl font-bold mt-4 leading-tight">
            Let’s Talk With Us
          </h1>

          <div className="w-24 h-[4px] bg-black mt-6"></div>

        </div>

        {/* ========================= */}
        {/* MAIN CONTENT */}
        {/* ========================= */}
        <div className="grid lg:grid-cols-2 gap-10">

          {/* ========================= */}
          {/* LEFT SIDE */}
          {/* ========================= */}
          <div className="bg-white shadow-sm p-8 md:p-12">

            <h2 className="text-3xl font-bold mb-5">
              Get In Touch
            </h2>

            <p className="text-gray-600 leading-8 mb-10">
              Have questions about our collections,
              delivery, orders or collaborations?
              Our team is always ready to help you.
            </p>

            {/* CONTACT INFO */}
            <div className="space-y-8">

              {/* PHONE */}
              <div className="flex items-start gap-5">

                <div className="w-14 h-14 bg-black text-white flex items-center justify-center text-xl">
                  <FiPhone />
                </div>

                <div>
                  <h3 className="font-semibold text-lg">
                    Phone Number
                  </h3>

                  <p className="text-gray-500 mt-1">
                    +91 98765 43210
                  </p>
                </div>

              </div>

              {/* EMAIL */}
              <div className="flex items-start gap-5">

                <div className="w-14 h-14 bg-black text-white flex items-center justify-center text-xl">
                  <FiMail />
                </div>

                <div>
                  <h3 className="font-semibold text-lg">
                    Email Address
                  </h3>

                  <p className="text-gray-500 mt-1">
                    support@luxestore.com
                  </p>
                </div>

              </div>

              {/* LOCATION */}
              <div className="flex items-start gap-5">

                <div className="w-14 h-14 bg-black text-white flex items-center justify-center text-xl">
                  <FiMapPin />
                </div>

                <div>
                  <h3 className="font-semibold text-lg">
                    Location
                  </h3>

                  <p className="text-gray-500 mt-1">
                    Ahmedabad, Gujarat, India
                  </p>
                </div>

              </div>

            </div>

            {/* SOCIAL */}
            <div className="flex items-center gap-5 mt-12">

              <a
                href="#"
                className="w-12 h-12 border border-black flex items-center justify-center hover:bg-black hover:text-white transition"
              >
                <FaInstagram />
              </a>

              <a
                href="#"
                className="w-12 h-12 border border-black flex items-center justify-center hover:bg-black hover:text-white transition"
              >
                <FaWhatsapp />
              </a>

              <a
                href="#"
                className="w-12 h-12 border border-black flex items-center justify-center hover:bg-black hover:text-white transition"
              >
                <FaFacebookF />
              </a>

            </div>

          </div>

          {/* ========================= */}
          {/* RIGHT SIDE */}
          {/* ========================= */}
          <div className="bg-white shadow-sm p-8 md:p-12">

            <h2 className="text-3xl font-bold mb-5">
              Send Message
            </h2>

            <p className="text-gray-600 mb-10">
              Fill out the form and our team
              will get back to you shortly.
            </p>

            {/* FORM */}
            <form className="space-y-6">

              {/* NAME */}
              <div>

                <label className="block mb-2 text-sm font-medium">
                  Your Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full border border-gray-300 px-5 py-4 outline-none focus:border-black transition"
                />

              </div>

              {/* EMAIL */}
              <div>

                <label className="block mb-2 text-sm font-medium">
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full border border-gray-300 px-5 py-4 outline-none focus:border-black transition"
                />

              </div>

              {/* MESSAGE */}
              <div>

                <label className="block mb-2 text-sm font-medium">
                  Your Message
                </label>

                <textarea
                  rows="6"
                  placeholder="Write your message..."
                  className="w-full border border-gray-300 px-5 py-4 outline-none focus:border-black transition resize-none"
                ></textarea>

              </div>

              {/* BUTTON */}
              <button
                type="submit"
                className="bg-black text-white px-8 py-4 flex items-center gap-3 hover:bg-gray-900 transition"
              >
                Send Message
                <FiSend />
              </button>

            </form>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Contact;