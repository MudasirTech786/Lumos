"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/lib/api";
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

    if (!email || !password) {

      toast.error(
        "Email and password are required"
      );

      return;
    }

    setLoading(true);

    try {

      const res = await api.post(
        "/login",
        {
          email,
          password,
        }
      );

      const token = res.data.token;

      localStorage.setItem(
        "token",
        token
      );

      document.cookie =
        `token=${token}; path=/`;

      await loadUser();

      toast.success(
        "Access initialized"
      );

      router.replace("/");

    } catch (err) {

      const status =
        err?.response?.status;

      if (status === 401) {

        toast.error(
          "Invalid credentials"
        );

      } else {

        toast.error(
          "System connection failed"
        );
      }

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="relative min-h-screen overflow-hidden bg-[#030712] text-white">

      {/* ================================= */}
      {/* BACKGROUND */}
      {/* ================================= */}

      <div className="absolute inset-0 overflow-hidden">

        {/* BASE */}
        <div className="absolute inset-0 bg-[#020617]" />

        {/* CENTER GLOW */}
        <div
          className="
            absolute
            top-1/2
            left-1/2
            -translate-x-1/2
            -translate-y-1/2
            w-[900px]
            h-[900px]
            rounded-full
            bg-cyan-500/10
            blur-[180px]
          "
        />

        {/* RADIAL LIGHT */}
        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.08),transparent_65%)]
          "
        />

        {/* LEFT GLOW */}
        <div
          className="
            absolute
            left-[-10%]
            top-[10%]
            w-[500px]
            h-[500px]
            rounded-full
            bg-cyan-500/10
            blur-[140px]
          "
        />

        {/* RIGHT GLOW */}
        <div
          className="
            absolute
            right-[-10%]
            bottom-[5%]
            w-[500px]
            h-[500px]
            rounded-full
            bg-blue-500/10
            blur-[140px]
          "
        />

        {/* GRID */}
        <div
          className="
            absolute
            inset-0
            opacity-[0.07]
            bg-[linear-gradient(rgba(0,255,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.4)_1px,transparent_1px)]
            bg-[size:70px_70px]
          "
        />

        {/* FLOOR GRID */}
        <div
          className="
            absolute
            bottom-[-10%]
            left-1/2
            -translate-x-1/2
            w-[180%]
            h-[55%]
            opacity-20
            perspective-[1200px]
            rotate-x-[75deg]
          "
        >

          <div
            className="
              w-full
              h-full
              bg-[linear-gradient(rgba(0,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.18)_1px,transparent_1px)]
              bg-[size:70px_70px]
            "
          />

        </div>

        {/* LIGHT BEAMS */}
        <div
          className="
            absolute
            top-0
            left-[20%]
            w-px
            h-full
            bg-gradient-to-b
            from-transparent
            via-cyan-400/20
            to-transparent
          "
        />

        <div
          className="
            absolute
            top-0
            right-[22%]
            w-px
            h-full
            bg-gradient-to-b
            from-transparent
            via-blue-400/20
            to-transparent
          "
        />

        {/* FLOATING LIGHTS */}
        <div className="absolute top-[12%] left-[30%] w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_30px_#00d9ff]" />
        <div className="absolute top-[22%] right-[26%] w-2 h-2 rounded-full bg-blue-300 shadow-[0_0_35px_#2563eb]" />
        <div className="absolute bottom-[18%] left-[15%] w-2 h-2 rounded-full bg-cyan-200 shadow-[0_0_25px_#67e8f9]" />
        <div className="absolute bottom-[15%] right-[32%] w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_35px_#00d9ff]" />

      </div>

      {/* ================================= */}
      {/* CONTENT */}
      {/* ================================= */}

      <div className="relative z-20 flex items-center justify-center min-h-screen px-4">

        <div className="relative w-full max-w-md">

          {/* ================================= */}
          {/* CAMERA CORE */}
          {/* ================================= */}

          <div className="relative flex justify-center z-30 mb-[-70px]">

            {/* MASSIVE GLOW */}
            <div
              className="
                absolute
                top-1/2
                left-1/2
                -translate-x-1/2
                -translate-y-1/2
                w-[260px]
                h-[260px]
                rounded-full
                bg-cyan-400/20
                blur-[120px]
                animate-pulse
              "
            />

            {/* OUTER RING */}
            <div
              className="
                absolute
                w-44
                h-44
                rounded-full
                border
                border-cyan-400/20
                animate-spin
                [animation-duration:16s]
              "
            />

            {/* SECOND RING */}
            <div
              className="
                absolute
                w-56
                h-56
                rounded-full
                border
                border-blue-400/10
                animate-spin
                [animation-duration:26s]
              "
            />

            {/* CORE */}
            <div
              className="
                relative
                w-40
                h-40
                rounded-[32px]
                p-[2px]
                bg-gradient-to-br
                from-cyan-300
                via-blue-500
                to-cyan-200
                shadow-[0_0_90px_rgba(0,183,255,0.45)]
              "
            >

              <div
                className="
                  relative
                  w-full
                  h-full
                  rounded-[30px]
                  overflow-hidden
                  bg-[#050816]
                  border
                  border-white/10
                  flex
                  items-center
                  justify-center
                "
              >

                {/* GRID */}
                <div
                  className="
                    absolute
                    inset-0
                    opacity-20
                    bg-[linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)]
                    bg-[size:16px_16px]
                  "
                />

                {/* CAMERA IMAGE */}
                <img
                  src="/images/icon.png"
                  alt="Camera"
                  className="
                    relative
                    z-10
                    w-[85%]
                    object-contain
                    drop-shadow-[0_0_35px_rgba(0,255,255,0.45)]
                  "
                />

                {/* SCAN LINE */}
                <div
                  className="
                    absolute
                    inset-x-0
                    top-0
                    h-10
                    bg-cyan-400/10
                    blur-xl
                    animate-pulse
                  "
                />

              </div>

            </div>

          </div>

          {/* ================================= */}
          {/* LOGIN CARD */}
          {/* ================================= */}

          <div
            className="
              relative
              overflow-hidden
              rounded-[36px]
              border
              border-cyan-400/20
              bg-white/[0.04]
              backdrop-blur-2xl
              shadow-[0_0_90px_rgba(0,183,255,0.12)]
              px-7
              pt-24
              pb-8
            "
          >

            {/* CARD GLOW */}
            <div
              className="
                absolute
                inset-0
                bg-gradient-to-br
                from-cyan-500/10
                via-transparent
                to-blue-500/10
                pointer-events-none
              "
            />

            {/* HEADER */}
            <div className="text-center mb-8">

              <h1
                className="
                  text-4xl
                  font-black
                  tracking-[0.25em]
                  text-white
                  uppercase
                "
              >
                NIZAAMO
              </h1>

              <p
                className="
                  mt-3
                  text-cyan-300/70
                  text-sm
                  tracking-[0.18em]
                  uppercase
                "
              >
                Production Control System
              </p>

            </div>

            {/* EMAIL */}
            <div className="mb-4">

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                className="
                  w-full
                  h-14
                  rounded-2xl
                  border
                  border-cyan-400/10
                  bg-white/[0.03]
                  px-5
                  text-white
                  placeholder:text-gray-500
                  outline-none
                  focus:border-cyan-400/40
                  focus:ring-4
                  focus:ring-cyan-500/10
                  transition-all
                "
              />

            </div>

            {/* PASSWORD */}
            <div className="relative mb-6">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                className="
                  w-full
                  h-14
                  rounded-2xl
                  border
                  border-cyan-400/10
                  bg-white/[0.03]
                  px-5
                  pr-14
                  text-white
                  placeholder:text-gray-500
                  outline-none
                  focus:border-cyan-400/40
                  focus:ring-4
                  focus:ring-cyan-500/10
                  transition-all
                "
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="
                  absolute
                  right-5
                  top-1/2
                  -translate-y-1/2
                  text-cyan-300
                "
              >
                {showPassword
                  ? <EyeOff size={18} />
                  : <Eye size={18} />}
              </button>

            </div>

            {/* LOGIN BUTTON */}
            <button
              onClick={login}
              disabled={loading}
              className="
                relative
                overflow-hidden
                w-full
                h-14
                rounded-2xl
                bg-gradient-to-r
                from-cyan-500
                via-blue-500
                to-cyan-400
                text-white
                font-semibold
                tracking-wide
                shadow-[0_0_45px_rgba(0,183,255,0.45)]
                hover:scale-[1.01]
                transition-all
                disabled:opacity-60
              "
            >

              <div
                className="
                  absolute
                  inset-0
                  bg-white/10
                  opacity-0
                  hover:opacity-100
                  transition
                "
              />

              <span className="relative z-10 flex items-center justify-center gap-2">

                {loading && (

                  <span
                    className="
                      w-4
                      h-4
                      border-2
                      border-white
                      border-t-transparent
                      rounded-full
                      animate-spin
                    "
                  />

                )}

                {loading
                  ? "Initializing..."
                  : "Access Control"}

              </span>

            </button>

            {/* REGISTER */}
            <button
              onClick={() =>
                router.push(
                  "/register"
                )
              }
              className="
                mt-5
                text-sm
                text-cyan-300/80
                hover:text-cyan-200
                transition
                w-full
                text-center
              "
            >
              Create New Account
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}