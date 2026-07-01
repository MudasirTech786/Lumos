"use client";

import { useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Bell, Menu, Camera, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import api from "@/lib/api";
import progressToast from "@/lib/progressToast";
import { useConfirm } from "@/context/ConfirmContext";
import Cropper from "react-easy-crop";
import NizaamoLogo from "@/components/NizaamoLogo";
import CommandPalette from "@/components/CommandPalette"; // ← NEW
import PageTransitionProvider from "@/components/ui/PageTransitionProvider";

// ── Live clock/date pill ──────────────────────────────────────────────────────
function DateTimePills() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dateStr = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="flex items-center gap-2">
      {/* DATE PILL */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
        <svg
          className="w-3.5 h-3.5 text-blue-500 flex-shrink-0"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="1.5" y="2.5" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
          <path d="M1.5 6h13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M5 1v3M11 1v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <span className="text-[12px] font-medium text-slate-700 whitespace-nowrap">{dateStr}</span>
      </div>

      {/* DIVIDER — desktop only */}
      <div className="hidden md:block w-px h-4 bg-slate-200" />

      {/* TIME PILL */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
        <svg
          className="w-3.5 h-3.5 text-blue-500 flex-shrink-0"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.3" />
          <path d="M8 4.5v3.75l2.25 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[12px] font-medium text-slate-700 whitespace-nowrap">{timeStr}</span>
      </div>
    </div>
  );
}

export default function Layout({ children }) {

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setOpen(false);
      return;
    }
    const saved = localStorage.getItem("sidebar-open");
    setOpen(saved === "true");
  }, []);

  const [profileOpen, setProfileOpen]     = useState(false);
  const [editOpen, setEditOpen]           = useState(false);

  // ── Command Palette state (replaces old searchOpen) ──────────────────────
  const [paletteOpen, setPaletteOpen]     = useState(false);
  const [paletteMobile, setPaletteMobile] = useState(false);
  // ─────────────────────────────────────────────────────────────────────────

  const [checkingAuth, setCheckingAuth]   = useState(false);

  const confirmDialog = useConfirm();
  const { user, ready, refreshUser } = useAuth();
  const router = useRouter();
  const dropdownRef       = useRef(null);
  const mobileDropdownRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    avatar: null,
  });

  const [preview, setPreview]       = useState(null);
  const [localAvatar, setLocalAvatar] = useState(null);

  const [cropOpen, setCropOpen]               = useState(false);
  const [imageSrc, setImageSrc]               = useState(null);
  const [crop, setCrop]                       = useState({ x: 0, y: 0 });
  const [zoom, setZoom]                       = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const avatar =
    localAvatar ||
    (user?.avatar
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${user.avatar}`
      : null);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({ ...prev, name: user.name || "", email: user.email || "" }));
      if (!preview) {
        setPreview(
          user?.avatar_url ||
          (user?.avatar ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${user.avatar}` : null)
        );
      }
      setPreview(avatar);
    }
  }, [user]);

  useEffect(() => {
    if (!ready) return;
    if (user) { setCheckingAuth(false); return; }
    const timer = setTimeout(() => {
      const token = localStorage.getItem("token");
      if (!token) router.replace("/login");
    }, 500);
    return () => clearTimeout(timer);
  }, [ready, user]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        mobileDropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !mobileDropdownRef.current.contains(e.target)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Global Ctrl/Cmd+K shortcut ────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen(true);
        setPaletteMobile(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    const ok = await confirmDialog({
      variant: "logout",
      title: "Sign Out?",
      description: "You're about to end your current session.",
      confirmText: "Sign Out",
      confirmAction: () => api.post("/logout"),
    });
    if (!ok) return;
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
        canvas.width  = cropArea.width;
        canvas.height = cropArea.height;
        ctx.drawImage(image, cropArea.x, cropArea.y, cropArea.width, cropArea.height, 0, 0, cropArea.width, cropArea.height);
        canvas.toBlob(
          (blob) => resolve(new File([blob], "avatar.jpg", { type: "image/jpeg" })),
          "image/jpeg"
        );
      };
    });
  };

  const updateProfile = async () => {
    const pToastId = progressToast.loading({ title: "Updating...", message: "Saving profile..." });
    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("email", form.email);
      if (form.password) data.append("password", form.password);
      if (form.avatar instanceof File) data.append("avatar", form.avatar);
      await api.post("/profile", data, { headers: { "Content-Type": "multipart/form-data" } });
      await refreshUser();
      progressToast.success(pToastId, { title: "Updated", message: "Profile updated successfully" });
      setEditOpen(false);
      setLocalAvatar(null);
    } catch (err) {
      progressToast.error(pToastId, { title: "Error", message: err?.response?.data?.message || "Failed" });
    }
  };

  const handleSidebarToggle = () => {
    const newState = !open;
    setOpen(newState);
    if (window.innerWidth >= 768) {
      localStorage.setItem("sidebar-open", newState.toString());
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

      {/* ===== SIDEBAR ===== */}
      <div className={`
        fixed md:static top-0 left-0 z-50 h-full transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <Sidebar open={open} setOpen={setOpen} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 relative z-0">
        <PageTransitionProvider autoDetect={false}>

        {/* ===================================================
            HEADER
            Desktop: single 72px white row
            Mobile:  dark top row
        =================================================== */}
        <header className="sticky top-0 z-[60] bg-[#0B0F19] md:bg-white border-b border-white/10 md:border-slate-200 md:shadow-sm">

          {/* ══ DESKTOP TOP ROW ══ */}
          <div className="hidden md:flex h-[72px] items-center justify-between px-4 md:px-6 gap-3">

            {/* LEFT: hamburger */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={handleSidebarToggle}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors duration-150"
                aria-label="Toggle sidebar"
              >
                <Menu size={22} strokeWidth={2} />
              </button>
            </div>

            {/* CENTER: search bar (opens Command Palette) + date/time */}
            <div className="flex flex-1 items-center justify-center gap-4 max-w-3xl mx-auto">
              {/*
                SEARCH TRIGGER — clicking this opens the desktop command palette.
                Visual appearance is unchanged from the original.
              */}
              <button
                onClick={() => { setPaletteOpen(true); setPaletteMobile(false); }}
                className="
                  flex items-center gap-2
                  w-full max-w-[420px]
                  px-4 py-2.5
                  rounded-2xl
                  bg-slate-50
                  border border-slate-200
                  shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]
                  hover:border-blue-300
                  focus-within:border-blue-400
                  focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]
                  transition-all duration-200
                  text-left
                "
                aria-label="Open search (Ctrl K)"
              >
                <Search size={15} className="text-slate-400 flex-shrink-0" strokeWidth={2.2} />
                <span className="flex-1 text-[13px] text-slate-400 truncate">
                  Search projects, productions, crew…
                </span>
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-200/80 border border-slate-300/60 flex-shrink-0">
                  <span className="text-[10px] font-medium text-slate-500 tracking-tight">Ctrl K</span>
                </div>
              </button>
              <DateTimePills />
            </div>

            {/* RIGHT: notification + profile */}
            <div className="flex items-center gap-2.5 flex-shrink-0 relative" ref={dropdownRef}>
              {/* BELL */}
              <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors duration-150">
                <Bell size={18} className="text-slate-600" strokeWidth={2} />
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 border-2 border-white">3</span>
              </button>

              {/* PROFILE CARD */}
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="group relative flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-[18px] bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(37,99,235,0.12)] hover:border-blue-200 transition-all duration-200"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-[12px] overflow-hidden border-2 border-white shadow-sm bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    {avatar ? (
                      <img src={avatar} className="w-full h-full object-cover" alt="avatar" />
                    ) : (
                      <span className="text-white text-xs font-semibold">{user?.name?.charAt(0)?.toUpperCase()}</span>
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[13px] font-semibold text-slate-800 max-w-[120px] truncate">{user?.name}</span>
                  <span className="text-[11px] text-slate-500">{user?.roles?.[0]?.name || "User"}</span>
                </div>
                <svg className="w-3 h-3 text-slate-400 group-hover:text-blue-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* DESKTOP DROPDOWN */}
              {profileOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-[290px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="overflow-hidden rounded-3xl border border-blue-100/80 bg-white/95 backdrop-blur-xl shadow-[0_25px_80px_rgba(37,99,235,0.15)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_30%)] pointer-events-none" />
                    <div className="relative p-5 border-b border-blue-50">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                            {avatar ? (
                              <img src={avatar} className="w-full h-full object-cover" alt="avatar" />
                            ) : (
                              <span className="text-white font-semibold">{user?.name?.charAt(0)?.toUpperCase()}</span>
                            )}
                          </div>
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-slate-800 truncate">{user?.name}</h3>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
                          <div className="mt-2">
                            <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                              {user?.roles?.[0]?.name || "USER"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          if (user?.name === "Super Admin") { const _t = progressToast.loading({ title: "Restricted", message: "Super Admin profile cannot be edited" }); progressToast.error(_t, { title: "Restricted", message: "Super Admin profile cannot be edited" }); return; }
                          setEditOpen(true); setProfileOpen(false);
                        }}
                        disabled={user?.name === "Super Admin"}
                        className={`group w-full flex items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-200 ${user?.name === "Super Admin" ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-50"}`}
                        title={user?.name === "Super Admin" ? "Super Admin profile cannot be edited" : "Manage your account"}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-all ${user?.name === "Super Admin" ? "bg-gray-100 text-gray-400" : "bg-blue-100 text-blue-700"}`}>
                          {user?.name === "Super Admin" ? "🔒" : "✦"}
                        </div>
                        <div className="flex flex-col items-start">
                          <span className={`text-sm font-medium ${user?.name === "Super Admin" ? "text-gray-400" : "text-slate-700"}`}>Edit Profile</span>
                          <span className="text-[11px] text-slate-400">{user?.name === "Super Admin" ? "Protected account" : "Manage your account"}</span>
                        </div>
                      </button>
                      <button onClick={handleLogout} className="group w-full flex items-center gap-3 rounded-2xl px-3 py-3 hover:bg-red-500/10 transition-all duration-200">
                        <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center group-hover:scale-105 transition-all">⎋</div>
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium text-red-400">Logout</span>
                          <span className="text-[11px] text-slate-500">End your session</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ══ MOBILE TOP ROW ══ */}
          <div className="md:hidden flex h-16 items-center px-4 gap-0">

            {/* HAMBURGER */}
            <button
              onClick={handleSidebarToggle}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu size={20} strokeWidth={2} />
            </button>

            {/* LOGO — absolutely centered */}
            <div className="flex-1 flex items-center justify-center pointer-events-none select-none">
              <img
                src="/images/LUMOS-LOGO-BLACK.jpeg"
                alt="Lumos"
                className="h-10 w-auto object-contain"
              />
            </div>

            {/* RIGHT ICONS: search · bell · avatar */}
            <div className="flex-shrink-0 flex items-center gap-1" ref={mobileDropdownRef}>

              {/* SEARCH ICON — opens mobile palette */}
              <button
                onClick={() => { setPaletteOpen(true); setPaletteMobile(true); }}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 transition-colors"
                aria-label="Search"
              >
                <Search size={19} strokeWidth={2} />
              </button>

              {/* NOTIFICATION BELL */}
              <button className="relative w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 transition-colors">
                <Bell size={19} strokeWidth={2} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-[#0B0F19]" />
              </button>

              {/* AVATAR */}
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="relative w-10 h-10 flex items-center justify-center"
                aria-label="Profile"
              >
                <div className="w-8 h-8 rounded-[10px] overflow-hidden border border-white/20 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                  {avatar ? (
                    <img src={avatar} className="w-full h-full object-cover" alt="avatar" />
                  ) : (
                    <span className="text-white text-xs font-semibold">{user?.name?.charAt(0)?.toUpperCase()}</span>
                  )}
                </div>
                <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-400 border border-[#0B0F19]" />
              </button>

              {/* MOBILE PROFILE DROPDOWN */}
              {profileOpen && (
                <div className="absolute right-3 top-[68px] w-[280px] z-[70] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#13172a]/95 backdrop-blur-xl shadow-[0_25px_80px_rgba(0,0,0,0.5)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_40%)] pointer-events-none" />
                    <div className="relative p-5 border-b border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/20 shadow-md bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                            {avatar ? (
                              <img src={avatar} className="w-full h-full object-cover" alt="avatar" />
                            ) : (
                              <span className="text-white font-semibold">{user?.name?.charAt(0)?.toUpperCase()}</span>
                            )}
                          </div>
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#13172a]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-white truncate">{user?.name}</h3>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
                          <div className="mt-2">
                            <span className="inline-flex items-center rounded-full bg-blue-500/15 border border-blue-500/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-400">
                              {user?.roles?.[0]?.name || "USER"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          if (user?.name === "Super Admin") { const _t = progressToast.loading({ title: "Restricted", message: "Super Admin profile cannot be edited" }); progressToast.error(_t, { title: "Restricted", message: "Super Admin profile cannot be edited" }); return; }
                          setEditOpen(true); setProfileOpen(false);
                        }}
                        disabled={user?.name === "Super Admin"}
                        className={`group w-full flex items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-200 ${user?.name === "Super Admin" ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10"}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-all ${user?.name === "Super Admin" ? "bg-white/5 text-slate-500" : "bg-blue-500/15 text-blue-400"}`}>
                          {user?.name === "Super Admin" ? "🔒" : "✦"}
                        </div>
                        <div className="flex flex-col items-start">
                          <span className={`text-sm font-medium ${user?.name === "Super Admin" ? "text-slate-500" : "text-slate-200"}`}>Edit Profile</span>
                          <span className="text-[11px] text-slate-500">{user?.name === "Super Admin" ? "Protected account" : "Manage your account"}</span>
                        </div>
                      </button>
                      <button onClick={handleLogout} className="group w-full flex items-center gap-3 rounded-2xl px-3 py-3 hover:bg-red-500/10 transition-all duration-200">
                        <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center group-hover:scale-105 transition-all">⎋</div>
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium text-red-400">Logout</span>
                          <span className="text-[11px] text-slate-500">End your session</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </header>

        {/* ═══════════════════════════════════════════
            COMMAND PALETTE
            Replaces the old mobile fullscreen overlay
            AND adds new desktop floating modal.
        ═══════════════════════════════════════════ */}
        <CommandPalette
          open={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          isMobile={paletteMobile}
        />

        {/* ===== CONTENT ===== */}
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
                  min={1} max={3} step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(e.target.value)}
                  className="w-full"
                />
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => { setCropOpen(false); setImageSrc(null); }}
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

        {/* ===== EDIT MODAL (UNCHANGED) ===== */}
        {editOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000] backdrop-blur-sm">
            <div className="w-[95%] max-w-md bg-white rounded-xl shadow-[0_30px_80px_rgba(0,0,0,0.2)] p-6 md:p-6 space-y-4 border border-blue-50">
              <h2 className="text-lg font-semibold text-center text-blue-700">Edit Profile</h2>

              <label className="flex flex-col items-center cursor-pointer">
                <div className="w-20 h-20 rounded-full overflow-hidden border border-blue-200 shadow-md">
                  {preview ? (
                    <img src={preview} className="w-full h-full object-cover" alt="preview" />
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
                <button onClick={() => setEditOpen(false)} className="px-3 py-1 text-sm rounded-md bg-gray-100">
                  Cancel
                </button>
                <button onClick={updateProfile} className="px-3 py-1 text-sm rounded-md bg-blue-600 text-white shadow-md">
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        </PageTransitionProvider>
      </div>
    </div>
  );
}