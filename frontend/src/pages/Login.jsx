import React, { useState } from 'react';
import {
  FiMail,
  FiLock,
  FiUser,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';
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

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password) =>
    password.length >= 6;

  const validateName = (name) =>
    name.trim().length >= 2;

  const validateForm = () => {
    const newErrors = {};

    if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (mode !== "forgot") {
      if (!validatePassword(password)) {
        newErrors.password = "Password must be at least 6 characters";
      }
    }

    if (mode === "register") {
      if (!validateName(name)) {
        newErrors.name = "Name must be at least 2 characters";
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = (password) => {
    if (password.length < 6) {
      return { strength: "weak", color: "bg-red-500" };
    }

    if (password.length < 8) {
      return { strength: "medium", color: "bg-[#D4AF37]" };
    }

    if (
      password.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/
      )
    ) {
      return { strength: "strong", color: "bg-[#007A8A]" };
    }

    return { strength: "medium", color: "bg-[#D4AF37]" };
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
        const data = await authAPI.login(
          email.toLowerCase(),
          password
        );

        loginUser(data.user, data.token);
        toast.success(data.message || "Welcome back!");

        setTimeout(() => onNavigate("home"), 100);
        return;
      }
    } catch (err) {
      console.error("Auth error:", err);

      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Authentication failed";

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

  const handleModeSwitch = (newMode) => {
    console.log("🔄 Switching to mode:", newMode);
    setMode(newMode);
    resetForm();
  };

  const inputClass = (error) =>
    `w-full rounded-xl border bg-[#F8F8F8] px-3.5 py-3 text-xs text-[#1A1A3A] outline-none transition-all placeholder:text-[#666666] sm:text-sm ${
      error
        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
        : "border-[#E0E0E0] focus:border-[#007A8A] focus:bg-white focus:ring-2 focus:ring-[#007A8A]/10"
    }`;

  return (
    <main className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#F8F8F8] via-white to-[#007A8A]/5 px-4 py-8 sm:px-6 sm:py-12">
      <div className="relative w-full max-w-md">

        {/* Decorative Background Elements */}
        <div className="pointer-events-none absolute -left-16 -top-16 h-32 w-32 rounded-full bg-[#D4AF37]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-32 w-32 rounded-full bg-[#007A8A]/10 blur-3xl" />

        <div className="relative space-y-6 rounded-2xl border border-[#E0E0E0] bg-white p-5 shadow-[0_18px_55px_rgba(26,26,58,0.12)] animate-scale-in sm:rounded-3xl sm:p-8 md:p-10">

          {/* Header */}
          <div className="space-y-3 text-center">
            <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#8A6D16]">
                Atelier Access
              </span>
            </div>

            <h2 className="font-display text-2xl font-black uppercase tracking-tight text-[#1A1A3A] sm:text-3xl">
              {mode === "login"
                ? "Sign In"
                : mode === "register"
                ? "Join Atelier"
                : "Reset Password"}
            </h2>

            <p className="text-xs leading-relaxed text-[#666666]">
              {mode === "login"
                ? "Welcome back to elite design"
                : mode === "register"
                ? "Create your design portfolio"
                : "Recover your account access"}
            </p>

            <div className="mx-auto h-1 w-12 rounded-full bg-gradient-to-r from-[#007A8A] via-[#D4AF37] to-[#2E3192]" />
          </div>

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">

            {/* Name */}
            {mode === "register" && (
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#1A1A3A]">
                  <FiUser size={13} className="text-[#007A8A]" />
                  <span>Full Name</span>
                </label>

                <input
                  type="text"
                  required
                  placeholder="e.g. Vishal Nishad"
                  className={inputClass(errors.name)}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                {errors.name && (
                  <p className="text-[10px] text-red-500">
                    {errors.name}
                  </p>
                )}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#1A1A3A]">
                <FiMail size={13} className="text-[#007A8A]" />
                <span>Email Address</span>
              </label>

              <input
                type="email"
                required
                placeholder="your.email@example.com"
                className={inputClass(errors.email)}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {errors.email && (
                <p className="text-[10px] text-red-500">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#1A1A3A]">
                  <FiLock size={13} className="text-[#D4AF37]" />
                  <span>Security Code</span>
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className={`${inputClass(errors.password)} pr-11`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[#666666] transition-colors hover:bg-[#007A8A]/10 hover:text-[#007A8A]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <FiEyeOff size={15} />
                    ) : (
                      <FiEye size={15} />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-[10px] text-red-500">
                    {errors.password}
                  </p>
                )}

                {/* Password Strength */}
                {mode === "register" && password && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((i) => {
                        const { strength } =
                          getPasswordStrength(password);

                        return (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full ${
                              strength === "weak" && i === 1
                                ? "bg-red-500"
                                : strength === "medium" && i <= 2
                                ? "bg-[#D4AF37]"
                                : strength === "strong"
                                ? "bg-[#007A8A]"
                                : "bg-[#E0E0E0]"
                            }`}
                          />
                        );
                      })}
                    </div>

                    <p className="text-[9px] text-[#666666]">
                      Use uppercase, lowercase, number and special character for a stronger password.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Confirm Password */}
            {mode === "register" && (
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#1A1A3A]">
                  <FiLock size={13} className="text-[#D4AF37]" />
                  <span>Confirm Password</span>
                </label>

                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className={inputClass(errors.confirmPassword)}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {errors.confirmPassword && (
                  <p className="text-[10px] text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-[#D4AF37] py-3.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#1A1A3A] shadow-sm transition-all hover:bg-[#B8941F] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:text-[11px]"
            >
              {loading
                ? "Processing..."
                : mode === "login"
                ? "Authorize Access"
                : mode === "register"
                ? "Create Account"
                : "Send Reset Link"}
            </button>
          </form>

          {/* Mode Switchers */}
          <div className="space-y-3 border-t border-[#E0E0E0] pt-5 text-center text-xs">

            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <span className="text-[#666666]">
                {mode === "login"
                  ? "New to Atelier?"
                  : "Already have an account?"}
              </span>

              <button
                type="button"
                onClick={() =>
                  handleModeSwitch(
                    mode === "login" ? "register" : "login"
                  )
                }
                className="rounded px-1 font-bold text-[#007A8A] underline decoration-dotted underline-offset-2 transition-colors hover:text-[#2E3192] focus:outline-none focus:ring-2 focus:ring-[#007A8A]/30"
              >
                {mode === "login" ? "Create Account" : "Sign In"}
              </button>
            </div>

            {mode === "login" && (
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <span className="text-[#666666]">
                  Forgot your password?
                </span>

                <button
                  type="button"
                  onClick={() => handleModeSwitch("forgot")}
                  className="rounded px-1 font-bold text-[#007A8A] underline decoration-dotted underline-offset-2 transition-colors hover:text-[#2E3192] focus:outline-none focus:ring-2 focus:ring-[#007A8A]/30"
                >
                  Reset here
                </button>
              </div>
            )}

            {mode === "forgot" && (
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <span className="text-[#666666]">
                  Remember your password?
                </span>

                <button
                  type="button"
                  onClick={() => handleModeSwitch("login")}
                  className="rounded px-1 font-bold text-[#007A8A] underline decoration-dotted underline-offset-2 transition-colors hover:text-[#2E3192] focus:outline-none focus:ring-2 focus:ring-[#007A8A]/30"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 rounded-xl border border-[#007A8A]/20 bg-[#007A8A]/5 px-3 py-2.5">
            <FiLock size={13} className="shrink-0 text-[#007A8A]" />
            <span className="text-[9px] font-semibold uppercase tracking-wider text-[#666666]">
              Your information is securely protected
            </span>
          </div>

          {/* Existing Debug Display Kept */}
          <div className="text-center">
            <small className="font-mono text-[10px] text-[#666666]">
              Current Mode: {mode}
            </small>
          </div>
        </div>
      </div>
    </main>
  );
}