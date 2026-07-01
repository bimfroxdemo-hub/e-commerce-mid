import { useState } from "react";
import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  FaUser,
  FaEnvelope,
  FaLock,
} from "react-icons/fa";

function Login({ type = "user" }) {

  const navigate = useNavigate();
  const location = useLocation();

  // 👇 where user came from (product page etc.)
  const from = location.state?.from || "/";

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const endpoint = isLogin ? "login" : "register";

      const payload = isLogin
        ? {
            email: formData.email,
            password: formData.password,
          }
        : formData;

      const res = await fetch(
        `http://localhost:5000/api/auth/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      console.log("FULL RESPONSE:", data);

      if (!data.success) {
        alert(data.message);
        return;
      }

      // =========================
      // SAVE AUTH DATA
      // =========================
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      alert("Login Successful");

      // =========================
      // ROLE BASED REDIRECT
      // =========================
      const role = data.user?.role;

      if (role === "admin") {
        navigate("/admin");
      } else {
        // 👇 return to previous page (product page)
        navigate(from, { replace: true });
      }

    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">

      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl">

        <h1 className="text-4xl font-bold text-center mb-8">
          {isLogin ? "Login" : "Register"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          {!isLogin && (
            <input
              type="text"
              name="username"
              placeholder="Username"
              onChange={handleChange}
              className="w-full border p-3 rounded-xl"
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full border p-3 rounded-xl"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full border p-3 rounded-xl"
            required
          />

          <button
            disabled={loading}
            className="w-full bg-black text-white p-3 rounded-xl"
          >
            {loading
              ? "Loading..."
              : isLogin
              ? "Login"
              : "Register"}
          </button>

        </form>

        {type !== "admin" && (
          <p
            onClick={() => setIsLogin(!isLogin)}
            className="text-center mt-5 text-blue-500 cursor-pointer"
          >
            {isLogin
              ? "Create account"
              : "Already have account?"}
          </p>
        )}

      </div>

    </section>
  );
}

export default Login;