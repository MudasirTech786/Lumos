"use client";

import { useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Bell, Menu, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Cropper from "react-easy-crop";
import NizaamoLogo from "@/components/NizaamoLogo";

export default function Layout({ children }) {

  const [open, setOpen] = useState(false);

  useEffect(() => {

    // MOBILE
    if (window.innerWidth < 768) {

      setOpen(false);

      return;
    }

    // DESKTOP
    const saved =
      localStorage.getItem("sidebar-open");

    setOpen(saved === "true");

  }, []);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);

  const { user, ready, refreshUser } = useAuth();

  const router = useRouter();
  const dropdownRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    avatar: null,
  });

  const [preview, setPreview] = useState(null);
  const [localAvatar, setLocalAvatar] = useState(null);

  const [cropOpen, setCropOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL;

const avatar =
  localAvatar ||
  user?.avatar_url ||
  (user?.avatar
    ? `${BACKEND_URL}/storage/${user.avatar}`
    : null);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));

      if (!preview) {
        setPreview(
          user?.avatar_url ||
          (user?.avatar
            ? `http://localhost:8000/storage/${user.avatar}`
            : null)
        );
      }

      setPreview(avatar);
    }
  }, [user]);

  useEffect(() => {

    if (!ready) return;

    // USER EXISTS
    if (user) {

      setCheckingAuth(false);

      return;
    }

    // WAIT SLIGHTLY BEFORE REDIRECT
    const timer = setTimeout(() => {

      const token =
        localStorage.getItem("token");

      // STILL NO TOKEN
      if (!token) {

        router.replace("/login");
      }

    }, 500);

    return () => clearTimeout(timer);

  }, [ready, user]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try { await api.post("/logout"); } catch { }
    localStorage.removeItem("token");
    document.cookie = "token=; Max-Age=0; path=/";
    window.location.href = "/login";
  };

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageSrc(URL.createObjectURL(file));
    setCropOpen(true);
  };

  const getCroppedImg = (imageSrc, cropArea) => {
    return new Promise((resolve) => {
      const image = new Image();
      image.src = imageSrc;

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = cropArea.width;
        canvas.height = cropArea.height;

        ctx.drawImage(
          image,
          cropArea.x,
          cropArea.y,
          cropArea.width,
          cropArea.height,
          0,
          0,
          cropArea.width,
          cropArea.height
        );

        canvas.toBlob((blob) => {
          resolve(new File([blob], "avatar.jpg", { type: "image/jpeg" }));
        }, "image/jpeg");
      };
    });
  };

  useEffect(() => {

    const handleResize = () => {

      if (window.innerWidth < 768) {

        setOpen(false);
      }
    };

    handleResize();

    window.addEventListener(
      "resize",
      handleResize
    );

    return () =>
      window.removeEventListener(
        "resize",
        handleResize
      );

  }, []);

  const updateProfile = async () => {
    try {
      const data = new FormData();

      data.append("name", form.name);
      data.append("email", form.email);

      if (form.password) data.append("password", form.password);
      if (form.avatar instanceof File) {
        data.append("avatar", form.avatar);
      }

      await api.post("/profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await refreshUser();

      toast.success("Profile updated successfully");
      setEditOpen(false);
      setLocalAvatar(null);

    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed");
    }
  };

  if (!ready || checkingAuth) {
    return (
      <div className="h-screen flex items-center justify-center text-blue-600 text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100">

      <div className={`
  fixed md:static top-0 left-0 z-50 h-full transition-transform duration-300
  ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
`}>
        <Sidebar open={open} setOpen={setOpen} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">

        {/* ===== HEADER ===== */}
        <header className="h-14 flex items-center justify-between px-4 md:px-6 bg-white border-b border-blue-100 shadow-sm sticky top-0 z-[60] relative">

          {/* LEFT SIDE (MENU + MOBILE BRAND) */}
          <div className="flex items-center gap-2">

            {/* MENU BUTTON */}
            <button
              onClick={() => {

                const newState = !open;

                setOpen(newState);

                // SAVE ONLY DESKTOP STATE
                if (window.innerWidth >= 768) {

                  localStorage.setItem(
                    "sidebar-open",
                    newState.toString()
                  );
                }
              }}
              className="p-2 rounded-md hover:bg-blue-50 transition"
            >
              <Menu className="text-blue-600" size={18} />
            </button>

            {/* MOBILE BRAND TEXT */}

            <div className="md:hidden select-none">

              <h1
                className="
      text-[25px]
      font-extrabold
      tracking-[0.22em]
      leading-none
    "
              >

                <span className="text-slate-900">
                  NIZA
                </span>

                <span
                  className="
        text-cyan-500
        [text-shadow:0_0_12px_rgba(6,182,212,0.25)]
      "
                >
                  AMO
                </span>

              </h1>

            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3 relative" ref={dropdownRef}>

            {/* BELL */}
            <button className="relative p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all duration-200">

              <Bell
                size={20}
                className="text-blue-700"
                strokeWidth={2}
              />

              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600"></span>

            </button>

            {/* AVATAR */}
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="
    group
    relative
    flex
    items-center
    gap-2.5
    pl-1.5
    pr-3
    py-0.5
    rounded-2xl
    bg-white
    border
    border-blue-100
    shadow-[0_6px_20px_rgba(37,99,235,0.08)]
    hover:shadow-[0_10px_28px_rgba(37,99,235,0.14)]
    hover:border-blue-200
    transition-all
    duration-300
  "
            >

              {/* AVATAR */}
              <div className="relative">

                <div
                  className="
        w-10
        h-10
        rounded-xl
        overflow-hidden
        border-2
        border-white
        shadow-sm
        bg-gradient-to-br
        from-blue-600
        to-blue-700
        flex
        items-center
        justify-center
      "
                >
                  {avatar ? (
                    <img
                      src={avatar}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-white text-xs font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>

                {/* ONLINE DOT */}
                <span
                  className="
        absolute
        -bottom-0.5
        -right-0.5
        w-3
        h-3
        rounded-full
        bg-emerald-500
        border-2
        border-white
      "
                />
              </div>

              {/* USER INFO */}
              <div className="hidden md:flex flex-col items-start leading-tight">

                <span className="text-[13px] font-semibold text-slate-800 max-w-[110px] truncate">
                  {user?.name}
                </span>

                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                  {user?.roles?.[0]?.name || "USER"}
                </span>
              </div>

              {/* CHEVRON */}
              <svg
                className="
      hidden
      md:block
      w-3.5
      h-3.5
      text-slate-400
      group-hover:text-blue-600
      transition-colors
    "
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>

            </button>

            {/* DROPDOWN (FIXED LAYER + DP) */}
            {profileOpen && (
              <div className="absolute right-0 top-14 w-[290px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">

                <div className="
      overflow-hidden
      rounded-3xl
      border
      border-blue-100/80
      bg-white/95
      backdrop-blur-xl
      shadow-[0_25px_80px_rgba(37,99,235,0.15)]
    ">

                  {/* TOP GLOW */}
                  <div className="
        absolute
        inset-0
        bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_30%)]
        pointer-events-none
      " />

                  {/* PROFILE SECTION */}
                  <div className="relative p-5 border-b border-blue-50">

                    <div className="flex items-center gap-4">

                      {/* AVATAR */}
                      <div className="relative">

                        <div className="
              w-14
              h-14
              rounded-2xl
              overflow-hidden
              border-2
              border-white
              shadow-md
              bg-gradient-to-br
              from-blue-600
              to-blue-700
              flex
              items-center
              justify-center
            ">
                          {avatar ? (
                            <img
                              src={avatar}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-white font-semibold">
                              {user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* ONLINE STATUS */}
                        <span className="
              absolute
              -bottom-1
              -right-1
              w-4
              h-4
              rounded-full
              bg-emerald-500
              border-2
              border-white
            " />
                      </div>

                      {/* USER INFO */}
                      <div className="min-w-0 flex-1">

                        <h3 className="
              text-sm
              font-semibold
              text-slate-800
              truncate
            ">
                          {user?.name}
                        </h3>

                        <p className="
              text-xs
              text-slate-500
              truncate
              mt-0.5
            ">
                          {user?.email}
                        </p>

                        {/* ROLE BADGE */}
                        <div className="mt-2">
                          <span className="
                inline-flex
                items-center
                rounded-full
                bg-blue-50
                border
                border-blue-100
                px-2.5
                py-1
                text-[10px]
                font-semibold
                uppercase
                tracking-wide
                text-blue-700
              ">
                            {user?.roles?.[0]?.name || "USER"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MENU ITEMS */}
                  <div className="p-2">

                    {/* EDIT PROFILE */}
                    <button
                      onClick={() => {
                        // ✅ CHECK IF SUPER ADMIN
                        if (user?.name === "Super Admin") {
                          toast.error("Super Admin profile cannot be edited");
                          return;
                        }
                        setEditOpen(true);
                        setProfileOpen(false);
                      }}
                      disabled={user?.name === "Super Admin"}
                      className={`
      group
      w-full
      flex
      items-center
      gap-3
      rounded-2xl
      px-3
      py-3
      transition-all
      duration-200
      ${user?.name === "Super Admin"
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-blue-50"
                        }
    `}
                      title={
                        user?.name === "Super Admin"
                          ? "Super Admin profile cannot be edited"
                          : "Manage your account"
                      }
                    >
                      <div className={`
      w-10
      h-10
      rounded-xl
      flex
      items-center
      justify-center
      group-hover:scale-105
      transition-all
      ${user?.name === "Super Admin"
                          ? "bg-gray-100 text-gray-400"
                          : "bg-blue-100 text-blue-700"
                        }
    `}>
                        {user?.name === "Super Admin" ? "🔒" : "✦"}
                      </div>

                      <div className="flex flex-col items-start">
                        <span className={`text-sm font-medium ${user?.name === "Super Admin"
                            ? "text-gray-400"
                            : "text-slate-700"
                          }`}>
                          Edit Profile
                        </span>

                        <span className="text-[11px] text-slate-400">
                          {user?.name === "Super Admin"
                            ? "Protected account"
                            : "Manage your account"}
                        </span>
                      </div>
                    </button>

                    {/* LOGOUT */}
                    <button
                      onClick={handleLogout}
                      className="
      group
      w-full
      flex
      items-center
      gap-3
      rounded-2xl
      px-3
      py-3
      hover:bg-red-50
      transition-all
      duration-200
    "
                    >
                      <div className="
      w-10
      h-10
      rounded-xl
      bg-red-100
      text-red-500
      flex
      items-center
      justify-center
      group-hover:scale-105
      transition-all
    ">
                        ⎋
                      </div>

                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium text-red-500">
                          Logout
                        </span>

                        <span className="text-[11px] text-slate-400">
                          End your session
                        </span>
                      </div>
                    </button>

                  </div>
                </div>
              </div>
            )}

          </div>
        </header>

        {/* CONTENT */}
        <main className="p-4 md:p-6 flex-1 overflow-y-auto">
          {children}
        </main>

        {/* ===== CROPPER (UNCHANGED) ===== */}
        {cropOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
            <div className="bg-white w-[95%] max-w-md md:max-w-lg rounded-lg overflow-hidden shadow-xl">

              <div className="h-[220px] md:h-[300px] bg-black relative">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(a, b) => setCroppedAreaPixels(b)}
                />
              </div>

              <div className="p-4">
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(e.target.value)}
                  className="w-full"
                />

                <div className="flex justify-end gap-2 mt-3">

                  <button
                    onClick={() => {
                      setCropOpen(false);
                      setImageSrc(null);
                    }}
                    className="px-3 py-1 text-sm rounded-md bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={async () => {
                      const file = await getCroppedImg(imageSrc, croppedAreaPixels);
                      setForm((prev) => ({ ...prev, avatar: file }));

                      const url = URL.createObjectURL(file);
                      setPreview(url);
                      setLocalAvatar(url);

                      setCropOpen(false);
                    }}
                    className="px-3 py-1 text-sm rounded-md bg-blue-600 text-white"
                  >
                    Apply
                  </button>

                </div>
              </div>

            </div>
          </div>
        )}

        {/* ===== EDIT MODAL (FIXED DEPTH + WORKING) ===== */}
        {editOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000] backdrop-blur-sm">

            <div className="w-[95%] max-w-md bg-white rounded-xl shadow-[0_30px_80px_rgba(0,0,0,0.2)] p-6 md:p-6 space-y-4 border border-blue-50">

              <h2 className="text-lg font-semibold text-center text-blue-700">
                Edit Profile
              </h2>

              <label className="flex flex-col items-center cursor-pointer">

                <div className="w-20 h-20 rounded-full overflow-hidden border border-blue-200 shadow-md">
                  {preview ? (
                    <img src={preview} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white">
                      {form.name?.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                  <Camera size={14} />
                  Change photo
                </div>

                <input type="file" className="hidden" onChange={handleAvatar} />
              </label>

              <input
                className="w-full p-2 border rounded-md text-sm border-blue-100 focus:ring-2 focus:ring-blue-200 outline-none"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Name"
              />

              <input
                className="w-full p-2 border rounded-md text-sm border-blue-100 focus:ring-2 focus:ring-blue-200 outline-none"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email"
              />

              <input
                type="password"
                className="w-full p-2 border rounded-md text-sm border-blue-100 focus:ring-2 focus:ring-blue-200 outline-none"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="New Password"
              />

              <div className="flex justify-end gap-2 pt-2">

                <button
                  onClick={() => setEditOpen(false)}
                  className="px-3 py-1 text-sm rounded-md bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  onClick={updateProfile}
                  className="px-3 py-1 text-sm rounded-md bg-blue-600 text-white shadow-md"
                >
                  Save
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}