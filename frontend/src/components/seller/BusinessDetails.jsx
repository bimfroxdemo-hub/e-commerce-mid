import React from 'react';

const BusinessDetails = ({
  step,
  formData,
  handleChange,
  handleNext,
  handlePrev,
  checkingStore,
  storeAvailable,
  checkStoreAvailability
}) => {
  const handleSubmitStep2 = (e) => {
    e.preventDefault();
    handleNext();
  };

  const handleSubmitStep3 = (e) => {
    e.preventDefault();
    handleNext();
  };

  const handleSubmitStep4 = (e) => {
    e.preventDefault();
    handleNext();
  };

  if (step === 2) {
    return (
      <form onSubmit={handleSubmitStep2} className="space-y-6">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Register and Start Selling</h2>
          <p className="text-xs text-gray-500 mt-1">Specify your registration parameters and confirm your agreement.</p>
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Business license type</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'GSTIN', label: 'Goods & Services Tax (GSTIN)' },
              { key: 'PAN', label: 'Business PAN' },
              { key: 'Udyam', label: 'Udyam Registration' },
              { key: 'FSSAI', label: 'FSSAI License' }
            ].map((option) => (
              <label 
                key={option.key} 
                className={`flex items-center space-x-3 p-3.5 border rounded-2xl cursor-pointer transition-all duration-200 ${
                  formData.licenseType === option.key 
                    ? 'border-orange-500 bg-orange-50/20 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="licenseType"
                  value={option.key}
                  checked={formData.licenseType === option.key}
                  onChange={handleChange}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                />
                <span className="text-slate-800 text-xs font-semibold">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Company/Business name *</label>
          <input
            type="text"
            name="businessName"
            required
            value={formData.businessName}
            onChange={handleChange}
            placeholder="As registered on official document"
            className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-orange-500 focus:bg-white py-3 px-4 rounded-xl focus:outline-none text-xs font-semibold transition-all"
          />
        </div>

        <div className="bg-gradient-to-r from-orange-50/40 to-amber-50/20 p-4 rounded-2xl border border-orange-100/50">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="agreedToTerms"
              checked={formData.agreedToTerms}
              onChange={handleChange}
              className="mt-1 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-[11px] text-slate-600 leading-relaxed">
              I have read and agree to comply with and/or be bound by the terms of Kabira Services Solutions.
            </span>
          </label>
        </div>

        <div className="flex space-x-4 pt-2">
          <button 
            type="button" 
            onClick={handlePrev} 
            className="w-1/2 border border-gray-200 rounded-xl py-3 text-xs font-black uppercase tracking-widest text-[#333333] bg-white hover:bg-slate-50 transition-all cursor-pointer"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!formData.agreedToTerms || !formData.businessName}
            className="w-1/2 bg-gradient-to-b from-amber-300 to-amber-400 border border-amber-500 text-white hover:from-amber-400 hover:to-amber-500 rounded-xl py-3 text-xs font-black uppercase tracking-widest disabled:opacity-50 transition-all shadow-md shadow-amber-500/10 cursor-pointer"
          >
            Continue
          </button>
        </div>
      </form>
    );
  }

  if (step === 3) {
    return (
      <form onSubmit={handleSubmitStep3} className="space-y-6">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Tell us about your business</h2>
          <p className="text-xs text-gray-500 mt-1">Configure your public store name, main niche, and fulfillment warehouse location.</p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Set a name for your 'Kabira Store' *</label>
          <div className="flex gap-2">
            <input
              type="text"
              name="storeName"
              required
              value={formData.storeName}
              onChange={handleChange}
              placeholder="e.g. My Retail Store"
              className="flex-1 bg-slate-50 border border-transparent hover:border-gray-200 focus:border-orange-500 focus:bg-white py-3 px-4 rounded-xl focus:outline-none text-xs font-semibold transition-all"
            />
            <button
              type="button"
              onClick={checkStoreAvailability}
              className="bg-slate-100 hover:bg-slate-200 border border-gray-200 px-4 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer"
            >
              {checkingStore ? 'Checking...' : 'Check Availability'}
            </button>
          </div>
          {storeAvailable && <p className="text-[11px] text-emerald-600 font-semibold mt-1">✔ Store name is available!</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Select Product Category *</label>
          <select
            name="primaryCategory"
            required
            value={formData.primaryCategory}
            onChange={handleChange}
            className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-orange-500 focus:bg-white py-3 px-4 rounded-xl focus:outline-none text-xs font-semibold transition-all cursor-pointer"
          >
            <option value="">Choose primary category</option>
            <option value="electronics">Electronics & Gadgets</option>
            <option value="apparel">Clothing & Apparel</option>
            <option value="grocery">Grocery & FSSAI</option>
            <option value="home">Home & Kitchen</option>
          </select>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Enter your business address</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5 col-span-1">
              <label className="text-[10px] font-bold text-gray-500">Pincode *</label>
              <input
                type="text"
                name="pincode"
                required
                pattern="[0-9]{6}"
                title="6-digit Pincode (e.g. 400001)"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="400001"
                className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-orange-500 focus:bg-white py-2.5 px-3 rounded-xl focus:outline-none text-xs font-mono font-semibold"
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="text-[10px] font-bold text-gray-500">Address Line 1 *</label>
              <input
                type="text"
                name="addressLine1"
                required
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="Flat / Building, Street"
                className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-orange-500 focus:bg-white py-2.5 px-3 rounded-xl focus:outline-none text-xs"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500">Address Line 2</label>
            <input
              type="text"
              name="addressLine2"
              value={formData.addressLine2 || ''}
              onChange={handleChange}
              placeholder="Landmark / Locality"
              className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-orange-500 focus:bg-white py-2.5 px-3 rounded-xl focus:outline-none text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500">City *</label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-orange-500 focus:bg-white py-2.5 px-3 rounded-xl focus:outline-none text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500">State *</label>
              <input
                type="text"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-orange-500 focus:bg-white py-2.5 px-3 rounded-xl focus:outline-none text-xs"
              />
            </div>
          </div>
        </div>

        <div className="flex space-x-4 pt-2">
          <button type="button" onClick={handlePrev} className="w-1/2 border border-gray-300 rounded-xl py-3 text-xs font-black uppercase tracking-widest text-[#333333] bg-white hover:bg-slate-50 cursor-pointer">Back</button>
          <button type="submit" className="w-1/2 bg-gradient-to-b from-amber-300 to-amber-400 border border-amber-500 text-slate-800 hover:from-amber-400 hover:to-amber-500 rounded-xl py-3 text-xs font-black uppercase tracking-widest cursor-pointer">Continue</button>
        </div>
      </form>
    );
  }

  if (step === 4) {
    return (
      <form onSubmit={handleSubmitStep4} className="space-y-6">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight font-sans">Choose shipping method</h2>
          <p className="text-xs text-gray-500 mt-1">Select your standard logistics framework.</p>
        </div>

        <div className="space-y-3.5">
          {[
            { 
              key: 'kabira_fba', 
              label: 'Fulfillment by Kabira (FBK)', 
              desc: 'Store your products in Kabira warehouse. We handle picking and shipping.' 
            },
            { 
              key: 'easy_ship', 
              label: 'Kabira Easy Ship', 
              desc: 'Pack orders at your location. We pick them up and deliver.' 
            },
            { 
              key: 'self_ship', 
              label: 'Self Ship', 
              desc: 'Store, pack, and ship orders to customers on your own.' 
            }
          ].map((method) => (
            <label 
              key={method.key} 
              className={`block p-4 border rounded-2xl cursor-pointer transition-all duration-200 ${
                formData.shippingMethod === method.key 
                  ? 'border-orange-500 bg-orange-50/10 shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <input
                  type="radio"
                  name="shippingMethod"
                  value={method.key}
                  checked={formData.shippingMethod === method.key}
                  onChange={handleChange}
                  className="mt-1 text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <span className="font-bold block text-sm text-slate-800">{method.label}</span>
                  <span className="text-[11px] text-slate-500 mt-1 block leading-relaxed">{method.desc}</span>
                </div>
              </div>
            </label>
          ))}
        </div>

        <div className="flex space-x-4 pt-2">
          <button type="button" onClick={handlePrev} className="w-1/2 border border-gray-200 rounded-xl py-3 text-xs font-black uppercase tracking-widest text-[#333333] bg-white hover:bg-slate-50 cursor-pointer">Back</button>
          <button type="submit" className="w-1/2 bg-gradient-to-b from-amber-300 to-amber-400 border border-amber-500 text-slate-800 hover:from-amber-400 hover:to-amber-500 rounded-xl py-3 text-xs font-black uppercase tracking-widest cursor-pointer">Next</button>
        </div>
      </form>
    );
  }

  return null;
};

export default BusinessDetails;