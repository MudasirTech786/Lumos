"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const register = async () => {

  if (form.password !== form.confirmPassword) {

    toast.error("Passwords do not match");

    return;
  }

  try {

    const res = await api.post("/register", {

      name: form.name,

      email: form.email,

      password: form.password,
    });

    // SAVE TOKEN
    localStorage.setItem(
      "token",
      res.data.token
    );

    // SET AUTH HEADER
    api.defaults.headers.common.Authorization =
      `Bearer ${res.data.token}`;

    // LOAD USER
    await refreshUser();

    toast.success(
      "Account created successfully"
    );

    // GO DASHBOARD
    window.location.href = "/";

  } catch (err) {

    console.log(err);

    toast.error(
      err?.response?.data?.message ||
      "Register failed"
    );
  }
};
  return (
    <div className="relative min-h-screen w-full overflow-hidden">

      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/videos/world.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/25 z-10"></div>

      <div className="relative z-20 flex min-h-screen items-center justify-center px-4 sm:px-6">

        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md p-6 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30">

          <div className="flex justify-center mb-5">
            <Image
              src="/images/Header.png"
              alt="Logo"
              width={220}
              height={140}
              className="w-56 h-auto"
            />
          </div>

          <h1 className="text-xl mb-5 font-bold text-center text-white">
            Create Account
          </h1>

          {/* NAME */}
          <input
            className="w-full mb-3 p-3 rounded-lg bg-white/10 text-white border border-white/20"
            placeholder="Name"
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          {/* EMAIL */}
          <input
            className="w-full mb-3 p-3 rounded-lg bg-white/10 text-white border border-white/20"
            placeholder="Email"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          {/* PASSWORD */}
          <div className="relative mb-3">

            <input
              className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/20 pr-10"
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>

          </div>

          {/* CONFIRM PASSWORD */}
          <div className="relative mb-4">

            <input
              className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/20 pr-10"
              placeholder="Confirm Password"
              type={showConfirm ? "text" : "password"}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
            />

            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-3 text-white"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>

          </div>

          {/* BUTTON */}
          <button
            onClick={register}
            className="w-full p-3 rounded-lg bg-blue-500 text-white font-semibold"
          >
            Register
          </button>

          <button
            onClick={() => router.push("/login")}
            className="mt-4 text-sm text-blue-300 w-full hover:underline"
          >
            Already have an account? Login
          </button>

        </div>
      </div>
    </div>
  );
}