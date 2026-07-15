import React, { useState } from 'react';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { authAPI } from "../services/api";
import { useApp } from "../context/AppContext";

export default function Login({ onNavigate }) {
  const { loginUser } = useApp();
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6;
  const validateName = (name) => name.trim().length >= 2;

  const validateForm = () => {
    const newErrors = {};
    if (!validateEmail(email)) newErrors.email = "Please enter a valid email address";
    
    if (mode !== 'forgot') {
      if (!validatePassword(password)) newErrors.password = "Password must be at least 6 characters";
    }

    if (mode === 'register') {
      if (!validateName(name)) newErrors.name = "Name must be at least 2 characters";
      if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = (password) => {
    if (password.length < 6) return { strength: 'weak', color: 'bg-red-500' };
    if (password.length < 8) return { strength: 'medium', color: 'bg-yellow-500' };
    if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)) 
      return { strength: 'strong', color: 'bg-green-500' };
    return { strength: 'medium', color: 'bg-yellow-500' };
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      if (mode === "forgot") {
        await authAPI.forgotPassword(email);
        toast.success("Reset instructions sent to your email");
        setMode("login");
        return;
      }

      if (mode === "register") {
        const data = await authAPI.register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        });

        toast.success(data.message || "Welcome to Atelier!");
        setMode("login");
        resetForm();
        return;
      }

      if (mode === "login") {
        const data = await authAPI.login(email.toLowerCase(), password);
        loginUser(data.user, data.token); 
        toast.success(data.message || "Welcome back!");
        setTimeout(() => onNavigate("home"), 100);
        return;
      }
    } catch (err) {
      console.error('Auth error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || "Authentication failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail(""); 
    setPassword(""); 
    setName(""); 
    setConfirmPassword("");
    setErrors({}); 
    setShowPassword(false);
  };

  // ✅ FIXED: Improved mode switcher function
  const handleModeSwitch = (newMode) => {
    console.log("🔄 Switching to mode:", newMode);
    setMode(newMode);
    resetForm();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div 
        className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xl space-y-6 animate-scale-in"
        style={{ zIndex: 10 }}
      >
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          <span className="text-[10px] text-primary uppercase font-bold tracking-[0.25em]">
            Atelier Access
          </span>
          <h2 className="font-display font-bold text-2xl text-black uppercase tracking-tight">
            {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Join Atelier' : 'Reset Password'}
          </h2>
          <p className="text-xs text-gray-400">
            {mode === 'login' ? 'Welcome back to elite design' : 
             mode === 'register' ? 'Create your design portfolio' : 
             'Recover your account access'}
          </p>
        </div>

        {/* ✅ FORM - Separated from mode switchers */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          
          {/* NAME (Register Only) */}
          {mode === 'register' && (
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-gray-700 uppercase flex items-center space-x-1">
                <FiUser /><span>Full Name</span>
              </label>
              <input
                type="text" 
                required 
                placeholder="e.g. Vishal Nishad"
                className={`w-full bg-slate-50 border ${errors.name ? 'border-red-300' : 'border-transparent'} py-2.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary`}
                value={name} 
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <p className="text-red-500 text-[10px]">{errors.name}</p>}
            </div>
          )}

          {/* EMAIL */}
          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-gray-700 uppercase flex items-center space-x-1">
              <FiMail /><span>Email Address</span>
            </label>
            <input
              type="email" 
              required 
              placeholder="your.email@example.com"
              className={`w-full bg-slate-50 border ${errors.email ? 'border-red-300' : 'border-transparent'} py-2.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary`}
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="text-red-500 text-[10px]">{errors.email}</p>}
          </div>

          {/* PASSWORD */}
          {mode !== 'forgot' && (
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-gray-700 uppercase flex items-center space-x-1">
                <FiLock /><span>Security Code</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} 
                  required 
                  placeholder="••••••••"
                  className={`w-full bg-slate-50 border ${errors.password ? 'border-red-300' : 'border-transparent'} py-2.5 px-3 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary`}
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-[10px]">{errors.password}</p>}
              
              {/* Password Strength */}
              {mode === 'register' && password && (
                <div className="mt-1 flex space-x-1">
                  {[1,2,3].map(i => {
                    const { strength } = getPasswordStrength(password);
                    return (
                      <div 
                        key={i} 
                        className={`h-1 w-full rounded ${
                          strength === 'weak' && i === 1 ? 'bg-red-500' : 
                          strength === 'medium' && i <= 2 ? 'bg-yellow-500' : 
                          strength === 'strong' ? 'bg-green-500' : 
                          'bg-gray-200'
                        }`} 
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* CONFIRM PASSWORD (Register Only) */}
          {mode === 'register' && (
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-gray-700 uppercase flex items-center space-x-1">
                <FiLock /><span>Confirm Password</span>
              </label>
              <input
                type="password" 
                required 
                placeholder="••••••••"
                className={`w-full bg-slate-50 border ${errors.confirmPassword ? 'border-red-300' : 'border-transparent'} py-2.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary`}
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {errors.confirmPassword && <p className="text-red-500 text-[10px]">{errors.confirmPassword}</p>}
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit" 
            disabled={loading}
            className="w-full bg-black hover:bg-primary text-white text-[11px] font-bold uppercase tracking-widest py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {loading ? 'Processing...' : 
             mode === 'login' ? 'Authorize Access' : 
             mode === 'register' ? 'Create Account' : 
             'Send Reset Link'}
          </button>
        </form>

        {/* ✅ FIXED: MODE SWITCHER - Moved outside form and improved */}
        <div className="pt-4 border-t text-center text-xs space-y-3">
          
          {/* Primary Mode Switch */}
          <div className="flex items-center justify-center space-x-2">
            <span className="text-gray-500">
              {mode === 'login' ? "New to Atelier?" : "Already have an account?"}
            </span>
            <button 
              type="button"
              onClick={() => handleModeSwitch(mode === 'login' ? 'register' : 'login')}
              className="text-primary hover:text-primary/80 font-semibold underline decoration-dotted underline-offset-2 hover:underline-offset-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-opacity-50 rounded px-1"
            >
              {mode === 'login' ? "Create Account" : "Sign In"}
            </button>
          </div>

          {/* Forgot Password Link */}
          {mode === 'login' && (
            <div className="flex items-center justify-center space-x-2">
              <span className="text-gray-500">Forgot your password?</span>
              <button 
                type="button"
                onClick={() => handleModeSwitch('forgot')}
                className="text-primary hover:text-primary/80 font-semibold underline decoration-dotted underline-offset-2 hover:underline-offset-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-opacity-50 rounded px-1"
              >
                Reset here
              </button>
            </div>
          )}

          {/* Back to Login from Forgot Password */}
          {mode === 'forgot' && (
            <div className="flex items-center justify-center space-x-2">
              <span className="text-gray-500">Remember your password?</span>
              <button 
                type="button"
                onClick={() => handleModeSwitch('login')}
                className="text-primary hover:text-primary/80 font-semibold underline decoration-dotted underline-offset-2 hover:underline-offset-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-opacity-50 rounded px-1"
              >
                Sign In
              </button>
            </div>
          )}
        </div>

        {/* ✅ DEBUG: Current mode display (remove in production) */}
        <div className="text-center">
          <small className="text-gray-400 font-mono text-[10px]">
            Current Mode: {mode}
          </small>
        </div>
      </div>
    </div>
  );
}