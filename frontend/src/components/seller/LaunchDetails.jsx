import React from 'react';

const LaunchDetails = ({
  formData,
  handleChange,
  handlePrev,
  handleLaunchBusiness
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    handleLaunchBusiness();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-100 pb-3">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Configure & Launch Store</h2>
        <p className="text-xs text-gray-500 mt-1">Define final storefront parameters, and launch your business.</p>
      </div>

      <div className="space-y-4 border-b border-gray-150 pb-6">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Shipping Fee Configuration</h3>
        <div className="grid grid-cols-1 gap-3">
          <label 
            className={`block p-4 border rounded-2xl cursor-pointer transition-all duration-200 ${
              formData.shippingFeeType === 'free' 
                ? 'border-orange-500 bg-orange-50/10 shadow-sm' 
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center space-x-3.5">
              <input
                type="radio"
                name="shippingFeeType"
                value="free"
                checked={formData.shippingFeeType === 'free'}
                onChange={handleChange}
                className="text-orange-600 focus:ring-orange-500"
              />
              <div>
                <span className="font-bold text-sm block text-slate-800">Offer free Shipping</span>
                <span className="text-[11px] text-slate-500 mt-1 block">Free shipping badges are highlighted on your bulk catalogs.</span>
              </div>
            </div>
          </label>

          <label 
            className={`block p-4 border rounded-2xl cursor-pointer transition-all duration-200 ${
              formData.shippingFeeType === 'set_fee' 
                ? 'border-orange-500 bg-orange-50/10 shadow-sm' 
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-start space-x-3.5">
              <input
                type="radio"
                name="shippingFeeType"
                value="set_fee"
                checked={formData.shippingFeeType === 'set_fee'}
                onChange={handleChange}
                className="mt-1 text-orange-600 focus:ring-orange-500"
              />
              <div className="w-full">
                <span className="font-bold text-sm block text-slate-800">Set Custom Flat Fee</span>
                <span className="text-[11px] text-slate-500 mt-1 block leading-relaxed">Define customized logistic fees for various shipping zones.</span>
                {formData.shippingFeeType === 'set_fee' && (
                  <div className="grid grid-cols-3 gap-4 mt-4 bg-slate-50 p-4 rounded-xl border border-gray-150 animate-fadeIn">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-500">Local (₹) *</label>
                      <input
                        type="number"
                        name="localFee"
                        required
                        min="0"
                        value={formData.localFee}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-200 focus:border-orange-500 py-1.5 px-3 rounded-lg focus:outline-none text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-500">Regional (₹) *</label>
                      <input
                        type="number"
                        name="regionalFee"
                        required
                        min="0"
                        value={formData.regionalFee}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-200 focus:border-orange-500 py-1.5 px-3 rounded-lg focus:outline-none text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-500">National (₹) *</label>
                      <input
                        type="number"
                        name="nationalFee"
                        required
                        min="0"
                        value={formData.nationalFee}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-200 focus:border-orange-500 py-1.5 px-3 rounded-lg focus:outline-none text-xs font-semibold"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Default Product Tax Code</h3>
        <p className="text-[11px] text-slate-500 mt-1">Choose a default code that applies to the majority of your products.</p>
        <div>
          <select
            name="productTaxCode"
            value={formData.productTaxCode}
            onChange={handleChange}
            className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-orange-500 focus:bg-white py-3 px-4 rounded-xl focus:outline-none text-xs font-semibold transition-all cursor-pointer"
          >
            <option value="A_GEN_EXEMPT">A_GEN_EXEMPT (0%)</option>
            <option value="A_GEN_MINIMUM">A_GEN_MINIMUM (0.25%)</option>
            <option value="A_GEN_JEWELLERY">A_GEN_JEWELLERY (3%)</option>
            <option value="A_GEN_REDUCED">A_GEN_REDUCED (5%)</option>
            <option value="A_GEN_STANDARD">A_GEN_STANDARD (18%)</option>
            <option value="A_GEN_PEAK">A_GEN_PEAK (28%)</option>
          </select>
        </div>
      </div>

      <div className="bg-amber-50 p-4 border border-amber-200 rounded-2xl mt-6">
        <p className="text-[11px] text-amber-800 font-medium font-sans">
          By clicking "Launch your business", you confirm that the verification info, business configuration, tax mapping, and address provided are accurate.
        </p>
      </div>

      <div className="flex space-x-4 pt-2">
        <button type="button" onClick={handlePrev} className="w-1/2 border border-gray-300 rounded-xl py-3 text-xs font-black uppercase tracking-widest text-[#333333] bg-white hover:bg-slate-50 cursor-pointer transition-all">Back</button>
        <button
          type="submit"
          className="w-1/2 bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 border border-amber-600 rounded-xl py-3 text-xs font-black uppercase tracking-widest text-white shadow-md cursor-pointer transition-all"
        >
          Launch your business
        </button>
      </div>
    </form>
  );
};

export default LaunchDetails;