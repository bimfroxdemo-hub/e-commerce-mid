import React, { useState, useRef, useEffect } from 'react';
import {
  FiEye,
  FiEyeOff,
  FiMessageCircle,
  FiShoppingBag,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { authAPI } from "../services/api";
import { useApp } from "../context/AppContext";
import SellerRegister from './SellerRegister';

const GoogleLogin = ({ onSuccess }) => {
  const { loginWithGoogle } = useApp();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      if (typeof window.google === 'undefined') {
        toast.error('Google SDK is still loading. Please wait.');
        return;
      }
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '95642146856-5doqkmqdiki84pfdicd2fq2oactsd821.apps.googleusercontent.com',
        scope: 'email profile',
        callback: async (tokenResponse) => {
          if (tokenResponse.access_token) {
            const result = await loginWithGoogle(tokenResponse.access_token);
            if (result.success) onSuccess(result.user);
            else toast.error(result.message || 'Google login failed');
          }
        },
      });
      client.requestAccessToken();
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const isReady = typeof window.google !== 'undefined';
  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={loading || !isReady}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.7h3.56c2.08-1.92 3.28-4.75 3.28-8.03z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.7c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.66-2.84z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.12-3.12C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l2.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      {!isReady ? 'Loading Google...' : 'Continue with Google'}
    </button>
  );
};

const FacebookLogin = ({ onSuccess }) => {
  const { loginWithFacebook } = useApp();
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    const initFB = () => {
      const rawAppId = import.meta.env.VITE_FACEBOOK_APP_ID;
      if (!rawAppId) {
        console.error("❌ VITE_FACEBOOK_APP_ID is missing!");
        return;
      }
      window.FB.init({
        appId: String(rawAppId).trim(),
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
      setSdkReady(true);
    };

    if (window.FB) {
      initFB();
      return;
    }
    window.fbAsyncInit = function () { initFB(); };
    const scriptId = 'facebook-jssdk';
    if (!document.getElementById(scriptId)) {
      const scriptNode = document.createElement('script');
      scriptNode.id = scriptId;
      scriptNode.async = true;
      scriptNode.defer = true;
      scriptNode.crossOrigin = 'anonymous';
      scriptNode.src = 'https://connect.facebook.net/en_US/sdk.js';
      document.getElementsByTagName('head')[0].appendChild(scriptNode);
    }
  }, []);

  const handleFacebookLogin = () => {
    try {
      setLoading(true);
      if (!window.FB) {
        toast.error('Facebook SDK is still loading. Please wait.');
        setLoading(false);
        return;
      }
      window.FB.login((response) => {
        if (response.status === 'connected') {
          (async () => {
            try {
              const result = await loginWithFacebook(response.authResponse.accessToken);
              if (result.success) onSuccess(result.user);
              else toast.error(result.message || 'Facebook login failed');
            } catch (err) {
              toast.error('Facebook login failed');
            } finally {
              setLoading(false);
            }
          })();
        } else {
          toast.error('Facebook login cancelled');
          setLoading(false);
        }
      }, { scope: 'email,public_profile' });
    } catch (error) {
      toast.error('Facebook login failed');
      setLoading(false);
    }
  };

  const isReady = sdkReady || typeof window.FB !== 'undefined';
  return (
    <button
      type="button"
      onClick={handleFacebookLogin}
      disabled={loading || !isReady}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50"
    >
      <svg className="h-5 w-5 text-[#1877F2] fill-current" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
      {!isReady ? 'Loading Facebook...' : 'Continue with Facebook'}
    </button>
  );
};

const PhoneLogin = ({ onSuccess }) => {
  const { loginWithPhone, sendPhoneOTP } = useApp();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const otpInputRef = useRef(null);

  useEffect(() => {
    if (step === 'otp' && otpInputRef.current) otpInputRef.current.focus();
  }, [step]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error('Please enter phone number');
      return;
    }
    setLoading(true);
    try {
      const res = await sendPhoneOTP(phone.trim());
      if (res.success) {
        setStep('otp');
        toast.success('OTP sent successfully!');
      } else {
        toast.error(res.message || 'Failed to send OTP');
      }
    } catch (err) {
      toast.error('Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await loginWithPhone(phone.trim(), otp.trim());
      if (res.success) {
        toast.success('Login successful!');
        onSuccess(res.user);
      } else {
        toast.error(res.message || 'Invalid OTP');
      }
    } catch (err) {
      toast.error('OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {step === 'phone' ? (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-900">Phone Number</label>
            <input
              type="tel"
              required
              placeholder="Enter phone number (e.g. 9408197990)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Sending OTP...' : 'Send SMS OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <p className="text-xs text-gray-600">
            Enter the 6-digit OTP sent to <strong className="text-gray-950">{phone}</strong>
          </p>
          <input
            ref={otpInputRef}
            type="text"
            required
            maxLength="6"
            placeholder="• • • • • •"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-center text-lg font-mono tracking-[0.3em] outline-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setStep('phone'); setOtp(''); }}
              className="w-1/3 rounded-lg border border-gray-300 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-2/3 rounded-lg bg-black py-2.5 text-xs font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const WhatsAppLogin = ({ onSuccess }) => {
  const { loginWithWhatsApp, sendWhatsAppOTP } = useApp();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const otpInputRef = useRef(null);

  useEffect(() => {
    if (step === 'otp' && otpInputRef.current) otpInputRef.current.focus();
  }, [step]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error('Please enter WhatsApp number');
      return;
    }
    setLoading(true);
    try {
      const res = await sendWhatsAppOTP(phone.trim());
      if (res.success) {
        setStep('otp');
        toast.success('WhatsApp OTP sent!');
      } else {
        toast.error(res.message || 'Failed to send WhatsApp OTP');
      }
    } catch (err) {
      toast.error('Error sending WhatsApp OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await loginWithWhatsApp(phone.trim(), otp.trim());
      if (res.success) {
        toast.success('WhatsApp login successful!');
        onSuccess(res.user);
      } else {
        toast.error(res.message || 'Invalid WhatsApp OTP');
      }
    } catch (err) {
      toast.error('WhatsApp OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-green-200 bg-green-50/40 p-4">
      <div className="flex items-center gap-2">
        <FiMessageCircle className="text-green-600" size={14} />
        <span className="text-xs font-bold uppercase tracking-wider text-green-900">
          WhatsApp OTP Verification
        </span>
      </div>
      {step === 'phone' ? (
        <form onSubmit={handleSendOTP} className="space-y-3">
          <input
            type="tel"
            required
            placeholder="WhatsApp number (e.g. 9408197990)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-green-300 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-green-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-600 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Sending OTP...' : 'Send WhatsApp OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-3">
          <p className="text-xs text-green-800">
            Enter 6-digit OTP sent to WhatsApp: <strong className="text-green-950">{phone}</strong>
          </p>
          <input
            ref={otpInputRef}
            type="text"
            required
            maxLength="6"
            placeholder="• • • • • •"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            className="w-full rounded-lg border border-green-600 bg-white px-3 py-2.5 text-center text-lg font-mono tracking-[0.3em] outline-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setStep('phone'); setOtp(''); }}
              className="w-1/3 rounded-lg border border-green-300 py-2 text-xs font-semibold text-green-800 hover:bg-green-100"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-2/3 rounded-lg bg-green-600 py-2 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default function Login({ onNavigate }) {
  const { loginUser } = useApp();
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState("email");
  const [loginRole, setLoginRole] = useState("user");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

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
    if (mode !== "forgot" && !validatePassword(password)) newErrors.password = "Password must be at least 6 characters";
    if (mode === "register") {
      if (!validateName(name)) newErrors.name = "Name must be at least 2 characters";
      if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSuccess = (user, token) => {
    loginUser(user, token);
    const role = String(user?.role || '').trim().toLowerCase();

    if (role === 'admin' || role === 'superadmin' || user?.isAdmin === true) {
      toast.success("Welcome back, Administrator!");
      setTimeout(() => onNavigate("admin-dashboard"), 100);
    } else if (role === 'seller') {
      localStorage.setItem('isSellerOnboarded', 'true');
      localStorage.setItem('isLoggedIn', 'true');
      toast.success("Welcome to Seller Central!");
      setTimeout(() => onNavigate("seller-dashboard"), 100);
    } else {
      toast.success("Welcome back!");
      setTimeout(() => onNavigate("home"), 100);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (loading || !validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      if (mode === "forgot") {
        toast.success("Reset instructions sent to your email!");
        setMode("login");
        return;
      }
      if (mode === "register") {
        const data = await authAPI.register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        });

        toast.success(data.message || "Account created successfully! Please log in to your account.");

        // Reverts the user interface to the login view and clears the form fields
        setMode("login");
        resetForm();
        return;
      }
      if (mode === "login") {
        if (email.trim().toLowerCase() === 'seller@kabira.com' && password === '123456') {
          const mockSeller = {
            id: 'mock_seller_123',
            fullName: 'Arjun Rajpurohit',
            email: 'seller@kabira.com',
            role: 'seller'
          };
          const mockToken = 'mock_jwt_token_for_seller';
          handleLoginSuccess(mockSeller, mockToken);
          return;
        }

        let data;
        if (loginRole === "admin") {
          data = await authAPI.adminLogin(email.toLowerCase(), password);
        } else {
          data = await authAPI.login(email.toLowerCase(), password);
        }

        const payload = data?.data || data;
        const user = payload?.user;
        const token = payload?.token;

        if (user && token) {
          handleLoginSuccess(user, token);
        } else {
          toast.error("Failed to parse user data from response");
        }
        return;
      }
    } catch (err) {
      console.error("Auth error:", err);
      toast.error(err?.response?.data?.message || err?.message || "Authentication failed");
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

  if (mode === "register" && loginRole === "seller") {
    return <SellerRegister onNavigate={onNavigate} />;
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {showAdvancedOptions ? (
            <div className="flex border-b border-gray-200 mb-6 text-sm font-semibold">
              <button
                type="button"
                onClick={() => { setLoginRole("seller"); setAuthMethod("email"); setMode("login"); }}
                className={`flex-1 pb-3 text-center transition-all ${loginRole === 'seller' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                Seller Central
              </button>
              <button
                type="button"
                onClick={() => { setLoginRole("admin"); setAuthMethod("email"); setMode("login"); }}
                className={`flex-1 pb-3 text-center transition-all ${loginRole === 'admin' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                Admin Panel
              </button>
            </div>
          ) : (
            <div className="text-center space-y-3 mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {mode === "login" ? "Welcome Back!" : mode === "register" ? "Create Account" : "Forgot Password"}
              </h1>
              {mode === "login" && loginRole === "user" && (
                <div className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                  <FiShoppingBag className="text-orange-600" size={16} />
                  <span className="text-sm text-gray-700">Want to sell on our platform?</span>
                  <button
                    type="button"
                    onClick={() => { setLoginRole("seller"); setMode("register"); }}
                    className="text-sm font-semibold text-orange-600 hover:text-orange-700 hover:underline"
                  >
                    Become a Seller
                  </button>
                </div>
              )}
              {!showAdvancedOptions && (
                <button
                  type="button"
                  onClick={() => { setShowAdvancedOptions(true); setLoginRole("seller"); }}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  Staff Login
                </button>
              )}
            </div>
          )}

          {showAdvancedOptions && (
            <div className="space-y-1.5 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-black">
                {mode === "login"
                  ? (loginRole === "admin" ? "Admin Login" : loginRole === "seller" ? "Seller Login" : "Staff Login")
                  : mode === "register" ? "Create Account" : "Forgot Password"
                }
              </h2>
              <p className="text-sm text-gray-500">
                {mode === "forgot" ? "Enter your email to reset your credentials" : "Let's get you signed in securely."}
              </p>
            </div>
          )}

          {mode === "login" && (
            <div className="space-y-5">
              {loginRole === "user" && authMethod !== "email" && (
                <button
                  type="button"
                  onClick={() => setAuthMethod("email")}
                  className="text-xs font-semibold text-[#4F46E5] underline hover:text-[#4338CA]"
                >
                  ← Back to standard Email login
                </button>
              )}
              <div>
                {authMethod === 'email' && (
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-900">Email</label>
                      <input
                        type="email"
                        required
                        placeholder="Enter Your Email Address"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-gray-900">Password</label>
                        <button
                          type="button"
                          onClick={() => setMode("forgot")}
                          className="text-xs font-semibold text-[#4F46E5] hover:underline"
                        >
                          Forgot Your Password?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="Your Password"
                          className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 pr-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-lg bg-[#18181B] py-3 text-sm font-semibold text-white transition-all hover:bg-black disabled:opacity-50"
                    >
                      {loading ? "Logging in..." : loginRole === "admin" ? "Log in as Administrator" : loginRole === "seller" ? "Sign in to Seller Central" : "Log in with Email"}
                    </button>
                  </form>
                )}
                {loginRole === "user" && authMethod === 'phone' && <PhoneLogin onSuccess={(user) => handleLoginSuccess(user, localStorage.getItem("luxe_token"))} />}
                {loginRole === "user" && authMethod === 'whatsapp' && <WhatsAppLogin onSuccess={(user) => handleLoginSuccess(user, localStorage.getItem("luxe_token"))} />}
              </div>

              {authMethod === "email" && loginRole === "user" && (
                <div className="space-y-4 pt-1">
                  <div className="relative flex py-1 items-center font-semibold text-xs text-gray-400 uppercase">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-4">or continue with</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <GoogleLogin onSuccess={(user) => handleLoginSuccess(user, localStorage.getItem("luxe_token"))} />
                    <FacebookLogin onSuccess={(user) => handleLoginSuccess(user, localStorage.getItem("luxe_token"))} />
                  </div>
                  <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 text-center">
                    <button onClick={() => setAuthMethod("phone")} className="text-xs font-semibold text-gray-600 hover:text-indigo-600 hover:underline">
                      Sign in with Mobile OTP
                    </button>
                    <button onClick={() => setAuthMethod("whatsapp")} className="text-xs font-semibold text-gray-600 hover:text-green-600 hover:underline">
                      Sign in with WhatsApp Verification
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {mode !== "login" && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {mode === "register" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-900">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vishal Nishad"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-600"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-900">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {mode !== "forgot" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-900">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-600"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}
              {mode === "register" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-900">Confirm Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-600"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-black py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800"
              >
                {loading ? "Processing..." : mode === "register" ? "Create Account" : "Send Reset Link"}
              </button>
            </form>
          )}

          {loginRole !== "admin" && !showAdvancedOptions && (
            <div className="border-t border-gray-200 pt-5 text-center text-sm">
              {mode === "login" ? (
                <p className="text-gray-500">
                  Don't Have an Account?{' '}
                  <button onClick={() => setMode("register")} className="font-bold text-[#4F46E5] hover:underline">
                    Sign Up
                  </button>
                </p>
              ) : (
                <p className="text-gray-500">
                  Already have an account?{' '}
                  <button onClick={() => setMode("login")} className="font-bold text-[#4F46E5] hover:underline">
                    Sign In
                  </button>
                </p>
              )}
            </div>
          )}

          {showAdvancedOptions && loginRole !== "admin" && (
            <div className="border-t border-gray-200 pt-5 text-center text-sm">
              {mode === "login" ? (
                <p className="text-gray-500">
                  {loginRole === "seller" ? "New to Seller Central? " : "Don't Have an Account? "}
                  <button onClick={() => setMode("register")} className="font-bold text-[#4F46E5] hover:underline">
                    {loginRole === "seller" ? "Register as Seller" : "Sign Up"}
                  </button>
                </p>
              ) : (
                <p className="text-gray-500">
                  Already have an account?{' '}
                  <button onClick={() => setMode("login")} className="font-bold text-[#4F46E5] hover:underline">
                    Sign In
                  </button>
                </p>
              )}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => { setShowAdvancedOptions(false); setLoginRole("user"); setMode("login"); }}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  ← Back to Customer Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}