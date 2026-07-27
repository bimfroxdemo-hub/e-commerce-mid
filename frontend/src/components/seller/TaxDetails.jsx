import React, { useState } from 'react';

const TaxDetails = ({
  step,
  formData,
  handleChange,
  handleNext,
  handlePrev,
  setFormData
}) => {
  const [otpGenerated, setOtpGenerated] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleGenerateOtp = () => {
    setOtpGenerated(true);
    alert("Verification OTP sent! (Use OTP code '123456' to proceed)");
  };

  const handleVerifyOtp = (e) => {
    if (e) e.preventDefault();
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      if (otpInput === '123456') {
        handleNext();
      } else {
        setOtpError('Invalid verification code. Enter "123456" to proceed.');
      }
    }, 800);
  };

  const handleStep5Submit = (e) => {
    e.preventDefault();
    handleNext();
  };

  if (step === 5) {
    return (
      <form onSubmit={handleStep5Submit} className="space-y-6">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Update your Tax details</h2>
          <p className="text-xs text-gray-500 mt-1">Sellers must declare tax settings for billing audits.</p>
        </div>

        <div className="space-y-4">
          <label 
            className={`flex items-center space-x-3 p-4 border rounded-2xl cursor-pointer transition-all duration-200 ${
              !formData.exemptCategory 
                ? 'border-orange-500 bg-orange-50/10 shadow-sm' 
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <input
              type="radio"
              name="exemptCategory"
              checked={!formData.exemptCategory}
              onChange={() => setFormData(prev => ({ ...prev, exemptCategory: false }))}
              className="text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm font-bold text-slate-800">I have GSTIN / Tax number</span>
          </label>

          {!formData.exemptCategory && (
            <div className="pl-6 space-y-4 bg-slate-50/40 p-4 rounded-2xl border border-gray-100">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">GST Number *</label>
                <input
                  type="text"
                  name="gstNumber"
                  required
                  pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}"
                  title="15-character GSTIN format (e.g. 22AAAAA0000A1Z5)"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  placeholder="e.g. 22AAAAA0000A1Z5"
                  className="w-full bg-white border border-gray-200 focus:border-orange-500 py-2.5 px-3 rounded-xl focus:outline-none text-xs font-semibold font-mono uppercase tracking-wider"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">PAN Number *</label>
                <input
                  type="text"
                  name="panNumber"
                  required
                  pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                  title="10-character PAN format (e.g. ABCDE1234F)"
                  value={formData.panNumber}
                  onChange={handleChange}
                  placeholder="e.g. ABCDE1234F"
                  className="w-full bg-white border border-gray-200 focus:border-orange-500 py-2.5 px-3 rounded-xl focus:outline-none text-xs font-semibold font-mono uppercase tracking-wider"
                />
              </div>
            </div>
          )}

          <label 
            className={`flex items-center space-x-3 p-4 border rounded-2xl cursor-pointer transition-all duration-200 ${
              formData.exemptCategory 
                ? 'border-orange-500 bg-orange-50/10 shadow-sm' 
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <input
              type="radio"
              name="exemptCategory"
              checked={formData.exemptCategory}
              onChange={() => setFormData(prev => ({ ...prev, exemptCategory: true, gstNumber: '', panNumber: '' }))}
              className="text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm font-bold text-slate-800">I sell only GST exempt categories (e.g. Books)</span>
          </label>
        </div>

        <div className="flex space-x-4 pt-2">
          <button type="button" onClick={handlePrev} className="w-1/2 border border-gray-200 rounded-xl py-3 text-xs font-black uppercase tracking-widest text-[#333333] bg-white hover:bg-slate-50">Back</button>
          <button type="submit" className="w-1/2 bg-gradient-to-b from-amber-300 to-amber-400 border border-amber-500 text-slate-800 hover:from-amber-400 hover:to-amber-500 rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all">Next</button>
        </div>
      </form>
    );
  }

  if (step === 6) {
    if (formData.exemptCategory) {
      return (
        <div className="space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Tax Verification</h2>
            <p className="text-xs text-gray-500 mt-1">Verification parameters are cleared.</p>
          </div>
          <p className="text-xs text-gray-600">Tax verification is skipped for exempt categories. Click below to continue.</p>
          <div className="flex space-x-4 pt-2">
            <button type="button" onClick={handlePrev} className="w-1/2 border border-gray-300 rounded-xl py-3 text-xs font-black uppercase tracking-widest text-[#333333] bg-white">Back</button>
            <button type="button" onClick={handleNext} className="w-1/2 bg-gradient-to-b from-amber-300 to-amber-400 border border-amber-500 text-slate-800 hover:from-amber-400 hover:to-amber-500 rounded-xl py-3 text-xs font-black uppercase tracking-widest">Continue</button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Verify your Tax Details</h2>
          <p className="text-xs text-gray-500 mt-1">Complete your tax authentication to finalize your onboarding.</p>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-gray-150">
          ℹ An OTP verification code will be sent to confirm details registered under your tax ID.
        </p>

        {!otpGenerated ? (
          <div className="pt-2">
            <button
              type="button"
              onClick={handleGenerateOtp}
              className="bg-slate-100 hover:bg-slate-200 border border-gray-300 px-5 py-3 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer"
            >
              Generate OTP
            </button>
          </div>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 bg-slate-50/30 p-4 rounded-2xl border border-gray-100">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">Enter OTP Code</label>
              <input
                type="text"
                required
                pattern="[0-9]{6}"
                value={otpInput}
                onChange={(e) => {
                  setOtpInput(e.target.value.replace(/\D/g, ''));
                  setOtpError('');
                }}
                placeholder="Enter 6-digit OTP"
                className="mt-1 block w-2/3 border border-gray-300 focus:border-orange-500 bg-white rounded-xl p-2.5 text-center text-sm font-semibold tracking-wider outline-none"
              />
              {otpError && <p className="text-xs text-red-600 mt-1">❌ {otpError}</p>}
            </div>
            <div className="pt-2 flex space-x-3 items-center">
              <button
                type="submit"
                disabled={verifying || !otpInput}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-50 transition cursor-pointer"
              >
                {verifying ? 'Verifying...' : 'Verify & Continue'}
              </button>
              <button type="button" onClick={() => setOtpGenerated(false)} className="text-xs text-blue-600 hover:underline font-bold cursor-pointer">
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {!otpGenerated && (
          <div className="flex space-x-4 pt-4 border-t border-gray-100">
            <button type="button" onClick={handlePrev} className="w-1/2 border border-gray-300 rounded-xl py-3 text-xs font-black uppercase tracking-widest text-[#333333] bg-white hover:bg-slate-50">Back</button>
            <button type="button" disabled className="w-1/2 bg-gray-200 border border-gray-300 rounded-xl py-3 text-xs font-black uppercase tracking-widest text-gray-400 cursor-not-allowed">
              Next (Verify first)
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default TaxDetails;