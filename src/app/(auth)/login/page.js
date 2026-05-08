"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/lib/api";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { loadUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const login = async () => {
    // ✅ FRONTEND VALIDATION
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/login", {
        email,
        password,
      });

      const token = res.data.token;

      localStorage.setItem("token", token);
      document.cookie = `token=${token}; path=/`;

      await loadUser(); // sync auth instantly

      toast.success("Login successful");

      router.replace("/");
    } catch (err) {
      const status = err?.response?.status;
      const message =
        err?.response?.data?.message || "Invalid credentials";

      // 🔥 proper handling
      if (status === 401) {
        toast.error("Invalid email or password");
      } else if (status === 422) {
        toast.error(message);
      } else {
        toast.error("Something went wrong. Try again.");
      }

      console.log("LOGIN ERROR:", err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">

      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/videos/matrix.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/25 z-10"></div>

      {/* Card */}
      <div className="relative z-20 flex min-h-screen items-center justify-center px-4">

        <div className="w-full max-w-sm p-6 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30">

          {/* Logo */}
          <div className="flex justify-center mb-5">
            <Image
              src="/images/Header.png"
              alt="Logo"
              width={220}
              height={140}
              className="w-56 h-auto"
            />
          </div>

          <h1 className="text-xl mb-4 text-center text-white font-bold">
            Login
          </h1>

          {/* Email */}
          <input
            className="w-full mb-3 p-3 rounded bg-white/10 text-white outline-none"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password */}
          <div className="relative mb-3">
            <input
              className="w-full p-3 pr-10 rounded bg-white/10 text-white outline-none"
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Button */}
          <button
            onClick={login}
            disabled={loading}
            className="w-full p-3 bg-blue-500 text-white rounded flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            {loading ? "Signing in..." : "Login"}
          </button>

          {/* Register */}
          <button
            onClick={() => router.push("/register")}
            className="w-full mt-3 text-sm text-blue-300 hover:underline"
          >
            Don’t have an account? Register
          </button>

        </div>
      </div>
    </div>
  );
}