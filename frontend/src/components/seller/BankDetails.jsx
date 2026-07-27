import React, { useState } from 'react';

const BankDetails = ({
  formData,
  handleChange,
  handleNext,
  handlePrev
}) => {
  const [accountError, setAccountError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setAccountError('');

    if (formData.accountNumber !== formData.confirmAccountNumber) {
      setAccountError('Account numbers do not match. Please verify your entries.');
      return;
    }
    handleNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-100 pb-3">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Bank Account Details</h2>
        <p className="text-xs text-gray-500 mt-1">Linked accounts are utilized for direct payouts and billing ledgers.</p>
      </div>

      {accountError && (
        <div className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-150 animate-fadeIn">
          ❌ {accountError}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Account Holder Name *</label>
          <input
            type="text"
            name="accountHolder"
            required
            value={formData.accountHolder || ''}
            onChange={handleChange}
            placeholder="Name as registered in bank ledger"
            className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-orange-500 focus:bg-white py-3 px-4 rounded-xl focus:outline-none text-xs font-semibold transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Bank Name *</label>
          <input
            type="text"
            name="bankName"
            required
            value={formData.bankName || ''}
            onChange={handleChange}
            placeholder="e.g. HDFC Bank"
            className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-orange-500 focus:bg-white py-3 px-4 rounded-xl focus:outline-none text-xs font-semibold transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Account Number *</label>
            <input
              type="password"
              name="accountNumber"
              required
              value={formData.accountNumber || ''}
              onChange={handleChange}
              placeholder="Enter Account Number"
              className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-orange-500 focus:bg-white py-3 px-4 rounded-xl focus:outline-none text-xs font-semibold font-mono tracking-wider transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Confirm Account Number *</label>
            <input
              type="text"
              name="confirmAccountNumber"
              required
              value={formData.confirmAccountNumber || ''}
              onChange={handleChange}
              placeholder="Re-enter Account Number"
              className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-orange-500 focus:bg-white py-3 px-4 rounded-xl focus:outline-none text-xs font-semibold font-mono tracking-wider transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">IFSC Code *</label>
          <input
            type="text"
            name="ifscCode"
            required
            pattern="^[A-Z]{4}0[A-Z0-9]{6}$"
            title="Valid 11-character IFSC format (e.g. HDFC0001234)"
            value={formData.ifscCode || ''}
            onChange={handleChange}
            placeholder="e.g. HDFC0001234"
            className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-orange-500 focus:bg-white py-3 px-4 rounded-xl focus:outline-none text-xs font-semibold font-mono uppercase tracking-widest transition-all"
          />
        </div>
      </div>

      <div className="flex space-x-4 pt-2">
        <button 
          type="button" 
          onClick={handlePrev} 
          className="w-1/2 border border-gray-200 rounded-xl py-3 text-xs font-black uppercase tracking-widest text-[#333333] bg-white hover:bg-slate-50 cursor-pointer transition-all"
        >
          Back
        </button>
        <button
          type="submit"
          className="w-1/2 bg-gradient-to-b from-amber-300 to-amber-400 border border-amber-500 text-white hover:from-amber-400 hover:to-amber-500 rounded-xl py-3 text-xs font-black uppercase tracking-widest cursor-pointer transition-all shadow-md shadow-amber-500/10"
        >
          Continue
        </button>
      </div>
    </form>
  );
};

export default BankDetails;