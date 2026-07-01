"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/lib/api";
import { Eye, EyeOff, Mail, Lock, Check, ArrowRight } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import progressToast from "@/lib/progressToast";

export default function LoginPage() {
  const router = useRouter();
  const { loadUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const login = async () => {
    if (!email || !password) {
      const id = progressToast.loading({ title: "Validation", message: "" });
      progressToast.error(id, { title: "Validation", message: "Email and password are required" });
      return;
    }

    setLoading(true);

    const pToastId = progressToast.loading({
      title: "Signing In",
      message: "Authenticating your account...",
    });

    try {
      progressToast.update(pToastId, {
        progress: 40,
        message: "Verifying credentials...",
      });

      const res = await api.post("/login", { email, password });

      const token = res.data.token;

      localStorage.setItem("token", token);
      document.cookie = `token=${token}; path=/`;

      progressToast.update(pToastId, {
        progress: 80,
        message: "Loading your workspace...",
      });

      await loadUser();

      progressToast.success(pToastId, {
        title: "Welcome back!",
        message: "Redirecting to Dashboard...",
      });

      router.replace("/");
    } catch (err) {
      console.log("🔥 LOGIN ERROR FULL DEBUG:", err);
      console.log("🔥 RESPONSE:", err?.response);
      console.log("🔥 STATUS:", err?.response?.status);
      console.log("🔥 DATA:", err?.response?.data);
      console.log("🔥 MESSAGE:", err?.message);

      let errorMsg = err?.response?.data?.message;
      if (!errorMsg) {
        if (!err?.response) {
          errorMsg = "Network error (API not reachable)";
        } else if (err?.response?.status === 401) {
          errorMsg = "Invalid email or password.";
        } else if (err?.response?.status === 419) {
          errorMsg = "CSRF token mismatch (Sanctum issue)";
        } else if (err?.response?.status >= 500) {
          errorMsg = "Server error (Laravel crashed)";
        } else {
          errorMsg = "System connection failed";
        }
      }

      progressToast.error(pToastId, {
        title: "Sign In Failed",
        message: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") login();
  };

  return (
    <div className="relative z-0 min-h-screen overflow-hidden bg-[#0a0a0a] text-slate-900">
      {/* ================================= */}
      {/* BACKGROUND */}
      {/* ================================= */}
      <div className="fixed inset-0 -z-10">
        {/* Mobile: below 768px */}
        <img
          src="/images/bg3.png"
          alt=""
          className="block md:hidden absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Tablet: 768px – 1023px */}
        <img
          src="/images/bg2.png"
          alt=""
          className="hidden md:block lg:hidden absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Desktop: 1024px and up */}
        <img
          src="/images/bg1.png"
          alt=""
          className="hidden lg:block absolute inset-0 w-full h-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-black/10" />
      </div>


      {/* ================================= */}
      {/* CONTENT */}
      {/* ================================= */}
      <div className="relative z-20 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-[420px] sm:max-w-[440px]">
          {/* ================================= */}
          {/* LOGIN CARD */}
          {/* ================================= */}
          <div
            className="
              relative
              overflow-hidden
              rounded-[28px]
              sm:rounded-[36px]
              border
              border-white/60
              bg-white/70
              backdrop-blur-2xl
              shadow-[0_20px_70px_rgba(15,23,42,0.18)]
              px-6
              py-8
              sm:px-9
              sm:py-10
            "
          >
            {/* CARD GLOW */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-slate-100/30" />


            {/* LOGO */}
            <div className="relative mb-7 flex flex-col items-center">
              <img
                src="/images/white-transparent.png"
                alt="LUMOS"
                className="h-20 w-auto object-contain drop-shadow-[0_4px_20px_rgba(255,255,255,0.15)] sm:h-24"
              />
            </div>

            {/* HEADER TEXT */}
            <div className="relative mb-6 text-left">
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Welcome Back
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Sign in to continue to your account
              </p>
            </div>

            {/* EMAIL */}
            <div className="relative mb-3.5">
              <Mail
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                className="
                  h-13
                  w-full
                  rounded-2xl
                  border
                  border-sky-100
                  bg-white/85
                  py-3.5
                  pl-11
                  pr-4
                  text-sm
                  text-slate-900
                  placeholder:text-slate-400
                  outline-none
                  transition-all
                  focus:border-sky-300
                  focus:ring-4
                  focus:ring-sky-500/10
                "
              />
            </div>

            {/* PASSWORD */}
            <div className="relative mb-4">
              <Lock
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="
                  h-13
                  w-full
                  rounded-2xl
                  border
                  border-sky-100
                  bg-white/85
                  py-3.5
                  pl-11
                  pr-11
                  text-sm
                  text-slate-900
                  placeholder:text-slate-400
                  outline-none
                  transition-all
                  focus:border-sky-300
                  focus:ring-4
                  focus:ring-sky-500/10
                "
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* REMEMBER ME / FORGOT */}
            <div className="mb-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center gap-2 text-sm text-slate-600"
              >
                <span
                  className={`
                    flex h-4.5 w-4.5 items-center justify-center rounded-md border transition-colors
                    ${rememberMe ? "border-slate-800 bg-slate-800" : "border-slate-300 bg-white"}
                  `}
                >
                  {rememberMe && <Check size={12} className="text-white" strokeWidth={3} />}
                </span>
                Remember me
              </button>

              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-sm text-slate-500 hover:text-sky-700 transition"
              >
                Forgot Password?
              </button>
            </div>

            {/* LOGIN BUTTON */}
            <button
              onClick={login}
              disabled={loading}
              className="
                group
                relative
                flex
                h-13
                w-full
                items-center
                justify-center
                gap-2
                overflow-hidden
                rounded-2xl
                bg-gradient-to-r
                from-slate-900
                to-sky-900
                text-sm
                font-semibold
                tracking-wide
                text-white
                shadow-[0_10px_30px_rgba(15,64,102,0.35)]
                transition-all
                hover:from-slate-800
                hover:to-sky-800
                disabled:opacity-60
              "
            >
              {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              <span>{loading ? "Initializing..." : "Access Control"}</span>
              {!loading && (
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              )}
            </button>

            {/* REGISTER */}
            <p className="mt-6 text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <button
                onClick={() => router.push("/register")}
                className="font-semibold text-sky-700 hover:text-sky-800 transition"
              >
                Create New Account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}