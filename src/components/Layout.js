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

  const [open, setOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar-open") === "false" ? false : true;
    }
    return true;
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

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

  const avatar =
    localAvatar ||
    user?.avatar_url ||
    (user?.avatar ? `http://localhost:8000/storage/${user.avatar}` : null);

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
    if (ready && !user) router.replace("/login");
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

  if (!ready) {
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
              onClick={() => setOpen(!open)}
              className="p-2 rounded-md hover:bg-blue-50 transition"
            >
              <Menu className="text-blue-600" size={18} />
            </button>

            {/* MOBILE BRAND TEXT */}
            <div className="md:hidden">
              <NizaamoLogo />
            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3 relative" ref={dropdownRef}>

            {/* BELL */}
            <button className="relative p-2 rounded-md hover:bg-blue-50 transition">
              <Bell size={18} className="text-blue-700" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
            </button>

            {/* AVATAR */}
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-200 shadow-[0_8px_25px_rgba(0,0,0,0.12)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.2)] hover:scale-[1.03] transition"
            >
              {avatar ? (
                <img src={avatar} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </button>

            {/* DROPDOWN (FIXED LAYER + DP) */}
            {profileOpen && (
              <div className="absolute right-0 top-12 w-48 md:w-56 z-50">

                <div className="bg-white rounded-lg border border-blue-100 shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden">

                  <div className="p-3 border-b border-blue-50 bg-blue-50/40">
                    <p className="text-sm font-medium text-blue-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setEditOpen(true);
                      setProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition"
                  >
                    Edit Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                  >
                    Logout
                  </button>

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