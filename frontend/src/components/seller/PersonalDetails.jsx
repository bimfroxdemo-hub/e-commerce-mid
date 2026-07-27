import React from 'react';

const PersonalDetails = ({ formData, handleChange, handleNext, onNavigate }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    handleNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-gray-100 pb-3">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create Account</h2>
        <p className="text-xs text-gray-500 mt-1">Set up your personal seller credentials to initiate your B2B account.</p>
      </div>
      
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Your name *</label>
        <input
          type="text"
          name="fullName"
          required
          value={formData.fullName}
          onChange={handleChange}
          placeholder="First and last name"
          className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-orange-500 focus:bg-white py-3 px-4 rounded-xl focus:outline-none text-xs font-semibold transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Mobile number *</label>
        <div className="flex mt-1">
          <select className="border border-gray-400 rounded-l-xl bg-gray-100 px-3 outline-none text-xs font-semibold">
            <option>IN +91</option>
          </select>
          <input
            type="tel"
            name="mobileNumber"
            required
            value={formData.mobileNumber}
            onChange={handleChange}
            placeholder="Mobile number"
            className="block w-full border border-l-0 border-gray-400 rounded-r-xl p-3 outline-none text-xs font-semibold"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address *</label>
        <input
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          placeholder="your.email@example.com"
          className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-orange-500 focus:bg-white py-3 px-4 rounded-xl focus:outline-none text-xs font-semibold transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Password *</label>
        <input
          type="password"
          name="password"
          required
          value={formData.password}
          onChange={handleChange}
          placeholder="At least 6 characters"
          className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-orange-500 focus:bg-white py-3 px-4 rounded-xl focus:outline-none text-xs font-semibold transition-all"
        />
        <p className="text-[10px] text-gray-500 mt-1">ℹ Passwords must be at least 6 characters.</p>
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-b from-amber-300 to-amber-400 hover:from-amber-400 hover:to-amber-500 border border-amber-500 rounded-xl py-3 text-xs font-black uppercase tracking-widest text-slate-800 shadow-md shadow-amber-500/10 cursor-pointer transition-all"
      >
        Continue
      </button>

      <div className="mt-6 border-t border-gray-150 pt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => onNavigate('login')}
          className="text-blue-600 hover:underline font-bold outline-none focus:underline cursor-pointer"
        >
          Sign in &gt;
        </button>
      </div>
    </form>
  );
};

export default PersonalDetails;