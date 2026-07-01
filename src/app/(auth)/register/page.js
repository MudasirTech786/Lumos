"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import progressToast from "@/lib/progressToast";
import useAuth from "@/hooks/useAuth";

export default function RegisterPage() {

  const router = useRouter();

  const { refreshUser } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") register();
  };

  const register = async () => {

    if (
      !form.name ||
      !form.email ||
      !form.password
    ) {

      const id = progressToast.loading({ title: "Validation", message: "" });
      progressToast.error(id, { title: "Validation", message: "All fields are required" });

      return;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {

      const id = progressToast.loading({ title: "Validation", message: "" });
      progressToast.error(id, { title: "Validation", message: "Passwords do not match" });

      return;
    }

    setLoading(true);

    const pToastId = progressToast.loading({
      title: "Creating Account",
      message: "Setting up your workspace...",
    });

    try {

      progressToast.update(pToastId, {
        progress: 35,
        message: "Creating your account...",
      });

      const res = await api.post(
        "/register",
        {
          name: form.name,
          email: form.email,
          password: form.password,
        }
      );

      localStorage.setItem(
        "token",
        res.data.token
      );

      api.defaults.headers.common.Authorization =
        `Bearer ${res.data.token}`;

      progressToast.update(pToastId, {
        progress: 70,
        message: "Preparing your profile...",
      });

      await refreshUser();

      progressToast.success(pToastId, {
        title: "Welcome to LUMOS",
        message: "Your account has been created successfully.",
      });

      window.location.href = "/";

    } catch (err) {

      progressToast.error(pToastId, {
        title: "Registration Failed",
        message: err?.response?.data?.message || "Registration failed",
      });

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="relative z-0 min-h-screen overflow-hidden bg-[#0a0a0a] text-slate-900">
      {/* ================================= */}
      {/* BACKGROUND */}
      {/* ================================= */}
      <div className="fixed inset-0 -z-10">
        <img
          src="/images/bg3.png"
          alt=""
          className="block md:hidden absolute inset-0 w-full h-full object-cover object-center"
        />
        <img
          src="/images/bg2.png"
          alt=""
          className="hidden md:block lg:hidden absolute inset-0 w-full h-full object-cover object-center"
        />
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
          {/* REGISTER CARD */}
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
                Create Account
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Register to get started
              </p>
            </div>

            {/* NAME */}
            <div className="relative mb-3.5">
              <User
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
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

            {/* EMAIL */}
            <div className="relative mb-3.5">
              <Mail
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
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
            <div className="relative mb-3.5">
              <Lock
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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

            {/* CONFIRM PASSWORD */}
            <div className="relative mb-6">
              <Lock
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
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
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* REGISTER BUTTON */}
            <button
              onClick={register}
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
              <span>{loading ? "Initializing..." : "Create Account"}</span>
              {!loading && (
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              )}
            </button>

            {/* LOGIN LINK */}
            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/login")}
                className="font-semibold text-sky-700 hover:text-sky-800 transition"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}