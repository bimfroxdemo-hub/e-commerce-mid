import React from 'react';

const SellerLanding = ({ onNavigate }) => {
    return (
        <div className="bg-white text-gray-900 font-sans min-h-screen flex flex-col justify-between">
            {/* Hero Section */}
            <div className="relative bg-slate-900 text-white py-24 px-6 sm:px-12 text-center lg:text-left">
                <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="space-y-6 max-w-xl">
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-none">
                            Become a Seller on <span className="text-orange-500">Kabira B2B</span>
                        </h1>
                        <p className="text-lg text-gray-300">
                            Join thousands of brands and retailers across India. Access bulk orders, direct payouts, and streamlined logistics structures.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                            <button
                                onClick={() => onNavigate('seller-onboarding')}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded shadow transition duration-200"
                            >
                                Register as Seller
                            </button>
                            {/* ✅ Updated Code */}
                            <button
                                onClick={() => onNavigate('login')}
                                className="bg-transparent border border-white hover:bg-white hover:text-slate-900 text-white font-bold py-3 px-8 rounded transition duration-200"
                            >
                                Sign In
                            </button>
                        </div>
                    </div>
                    <div className="w-full max-w-md bg-slate-800 p-8 rounded-lg border border-slate-700 shadow-xl space-y-4">
                        <h3 className="text-xl font-bold text-orange-400">Why sell on Kabira?</h3>
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li>⚡ <strong>Direct Settlements:</strong> Quick payouts directly to your linked bank ledger.</li>
                            <li>📦 <strong>Fulfillment Options:</strong> Store products in our warehouses or self-ship.</li>
                            <li>📝 <strong>GST & Tax Simplification:</strong> Integrated PTC code system for streamlined reporting.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Steps segment */}
            <div className="py-16 max-w-5xl mx-auto px-6 text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-12">How onboarding works</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[
                        { step: "1", title: "Create Account", desc: "Set up your credentials and verify contact details." },
                        { step: "2", title: "Business Info", desc: "Select license types like GSTIN, PAN, or Udyam." },
                        { step: "3", title: "Tax & Bank Setup", desc: "Verify your tax parameters and link settlement bank." },
                        { step: "4", title: "Launch Store", desc: "Configure shipping configurations and start selling!" }
                    ].map((item, idx) => (
                        <div key={idx} className="space-y-2">
                            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 font-black text-xl flex items-center justify-center mx-auto">
                                {item.step}
                            </div>
                            <h4 className="font-bold text-gray-800">{item.title}</h4>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SellerLanding;