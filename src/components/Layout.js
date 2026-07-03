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

  const [profileOpen, setProfileOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  // ── Command Palette state (replaces old searchOpen) ──────────────────────
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteMobile, setPaletteMobile] = useState(false);
  // ─────────────────────────────────────────────────────────────────────────

  const [checkingAuth, setCheckingAuth] = useState(false);

  const confirmDialog = useConfirm();
  const { user, ready, refreshUser } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

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
        canvas.width = cropArea.width;
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

                {/* ─────────────────────────────────────────────────────────────────
    DESKTOP PROFILE TRIGGER BUTTON
───────────────────────────────────────────────────────────────── */}
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  aria-haspopup="true"
                  aria-expanded={profileOpen}
                  aria-label="Profile menu"
                  className={`
    group relative flex items-center gap-2.5 pl-1 pr-3 py-1
    rounded-[18px] bg-white border transition-all duration-200
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#50a2ff]/40
    ${profileOpen
                      ? "border-[#bfdbfe] shadow-[0_4px_14px_rgba(37,99,235,0.10)]"
                      : "border-slate-200 shadow-[0_2px_6px_rgba(0,0,0,0.05)] hover:border-[#bfdbfe] hover:shadow-[0_4px_14px_rgba(37,99,235,0.10)]"
                    }
  `}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-[11px] overflow-hidden border-2 border-white shadow-sm bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                      {avatar ? (
                        <img src={avatar} className="w-full h-full object-cover" alt="avatar" />
                      ) : (
                        <span className="text-white text-[13px] font-bold">
                          {user?.name?.charAt(0)?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-[9px] h-[9px] rounded-full bg-emerald-400 border-2 border-white" />
                  </div>

                  {/* Name + role */}
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-[13px] font-semibold text-slate-900 max-w-[120px] truncate tracking-[-0.01em]">
                      {user?.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {user?.roles?.[0]?.name || "User"}
                    </span>
                  </div>

                  {/* Chevron */}
                  <svg
                    className={`w-3 h-3 flex-shrink-0 transition-all duration-200 ${profileOpen ? "text-[#50a2ff] rotate-180" : "text-slate-400 group-hover:text-[#50a2ff]"
                      }`}
                    fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>


                {/* ─────────────────────────────────────────────────────────────────
    DESKTOP PROFILE DROPDOWN
───────────────────────────────────────────────────────────────── */}
                {profileOpen && (
                  <>
                    {/* ── Full-page blur backdrop: everything behind the menu goes soft, only the menu stays sharp ── */}
                    <div
                      onClick={() => setProfileOpen(false)}
                      className="fixed inset-0 z-40 bg-slate-900/20"
                      style={{
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        animation: "bdFade 0.18s ease-out forwards",
                      }}
                      aria-hidden="true"
                    >
                      <style>{`
        @keyframes bdFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
                    </div>

                    <div
                      className="absolute right-0 top-[calc(100%+10px)] w-[300px] z-50"
                      style={{ animation: "ddOpen 0.18s cubic-bezier(0.16,1,0.3,1) forwards" }}
                    >
                      <style>{`
      @keyframes ddOpen {
        from { opacity: 0; transform: scale(0.94) translateY(-6px); }
        to   { opacity: 1; transform: scale(1)    translateY(0);    }
      }
    `}</style>

                      <div
                        className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white"
                        style={{
                          boxShadow:
                            "0 24px 60px rgba(37,99,235,0.16), 0 2px 8px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(80,162,255,0.08)",
                        }}
                      >

                        {/* ── Brand accent bar ── */}
                        <div className="h-[3px] w-full" style={{ background: "#50a2ff" }} />

                        {/* ── User header ── */}
                        <div className="relative px-[18px] pt-[18px] pb-[16px] border-b border-slate-100 overflow-hidden">
                          {/* Subtle blue glow */}
                          <div
                            className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
                            style={{
                              background:
                                "radial-gradient(circle, rgba(80,162,255,0.08), transparent 70%)",
                            }}
                          />

                          <div className="relative flex items-center gap-3.5">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                              <div
                                className="w-[52px] h-[52px] rounded-[15px] overflow-hidden border-2 border-white bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center"
                                style={{ boxShadow: "0 4px 14px rgba(37,99,235,0.25)" }}
                              >
                                {avatar ? (
                                  <img src={avatar} className="w-full h-full object-cover" alt="avatar" />
                                ) : (
                                  <span className="text-white text-[18px] font-bold">
                                    {user?.name?.charAt(0)?.toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <span className="absolute -bottom-[2px] -right-[2px] w-[14px] h-[14px] rounded-full bg-emerald-400 border-[2.5px] border-white" />
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex-1">
                              <p className="text-[14.5px] font-bold text-slate-900 truncate tracking-[-0.02em]">
                                {user?.name}
                              </p>
                              <p className="text-[11.5px] text-slate-500 truncate mt-0.5">
                                {user?.email}
                              </p>
                              <span
                                className="inline-flex items-center mt-1.5 px-2 py-[3px] rounded-full text-[9.5px] font-bold uppercase tracking-[0.08em]"
                                style={{
                                  background: "rgba(80,162,255,0.10)",
                                  border: "1px solid rgba(80,162,255,0.22)",
                                  color: "#2563eb",
                                }}
                              >
                                {user?.roles?.[0]?.name || "User"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* ── Menu items ── */}
                        <div className="p-[7px] space-y-0.5">

                          {/* Edit profile */}
                          <button
                            onClick={() => {
                              if (user?.name === "Super Admin") {
                                toast.error("Super Admin profile cannot be edited");
                                return;
                              }
                              setEditOpen(true);
                              setProfileOpen(false);
                            }}
                            disabled={user?.name === "Super Admin"}
                            className={`
            w-full flex items-center gap-3 px-2.5 py-[9px] rounded-[13px]
            transition-all duration-150 group text-left
            ${user?.name === "Super Admin"
                                ? "opacity-40 cursor-not-allowed"
                                : "hover:bg-slate-50 active:bg-slate-100"
                              }
          `}
                          >
                            <div
                              className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 transition-transform duration-150 group-hover:scale-[1.08]"
                              style={
                                user?.name === "Super Admin"
                                  ? { background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#475569" }
                                  : { background: "rgba(80,162,255,0.10)", border: "1px solid rgba(80,162,255,0.18)", color: "#2563eb" }
                              }
                            >
                              {user?.name === "Super Admin" ? (
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                              ) : (
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-[13.5px] font-[500] leading-none ${user?.name === "Super Admin" ? "text-slate-400" : "text-slate-800"}`}>
                                {user?.name === "Super Admin" ? "Profile locked" : "Edit profile"}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {user?.name === "Super Admin" ? "Protected account" : "Manage your account"}
                              </p>
                            </div>
                            {user?.name !== "Super Admin" && (
                              <svg className="ml-auto text-slate-300 flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M9 18l6-6-6-6" />
                              </svg>
                            )}
                          </button>

                          {/* Notifications */}
                          <button className="w-full flex items-center gap-3 px-2.5 py-[9px] rounded-[13px] hover:bg-slate-50 active:bg-slate-100 transition-all duration-150 group text-left">
                            <div
                              className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 transition-transform duration-150 group-hover:scale-[1.08]"
                              style={{ background: "rgba(80,162,255,0.10)", border: "1px solid rgba(80,162,255,0.18)", color: "#2563eb" }}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13.5px] font-[500] text-slate-800 leading-none">Notifications</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">3 unread alerts</p>
                            </div>
                            <svg className="ml-auto text-slate-300 flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M9 18l6-6-6-6" />
                            </svg>
                          </button>

                          {/* Divider */}
                          <div className="my-1 mx-1.5 h-px bg-slate-100" />

                          {/* Sign out */}
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-2.5 py-[9px] rounded-[13px] hover:bg-red-50 active:bg-red-100 transition-all duration-150 group text-left"
                          >
                            <div
                              className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 transition-transform duration-150 group-hover:scale-[1.08]"
                              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "#dc2626" }}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13.5px] font-[500] text-red-600 leading-none">Sign out</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">End your session</p>
                            </div>
                          </button>
                        </div>

                      </div>
                    </div>
                  </>
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

                {/* ─────────────────────────────────────────────────────────────────
    AVATAR BUTTON — mobile header, right side
───────────────────────────────────────────────────────────────── */}
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="relative w-10 h-10 flex items-center justify-center"
                  aria-label="Profile menu"
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                >
                  <div className="w-[30px] h-[30px] rounded-[9px] overflow-hidden border border-white/15 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                    {avatar ? (
                      <img src={avatar} className="w-full h-full object-cover" alt="avatar" />
                    ) : (
                      <span className="text-white text-[11px] font-bold">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  {/* Online indicator */}
                  <span className="absolute bottom-[4px] right-[4px] w-[7px] h-[7px] rounded-full bg-emerald-400 border-[1.5px] border-[#0B0F19]" />
                </button>


                {/* ─────────────────────────────────────────────────────────────────
    MOBILE PROFILE DROPDOWN
    Position: absolute, anchored below the top bar (top-[68px])
    Width: 272px, right-aligned to the header edge
───────────────────────────────────────────────────────────────── */}
                {profileOpen && (
                  <div
                    className="absolute right-3 top-[68px] w-[272px] z-[70]"
                    style={{ animation: "ddOpen 0.18s cubic-bezier(0.16,1,0.3,1) forwards" }}
                  >
                    <style>{`
      @keyframes ddOpen {
        from { opacity: 0; transform: scale(0.94) translateY(-6px); }
        to   { opacity: 1; transform: scale(1)    translateY(0);    }
      }
    `}</style>

                    <div
                      className="overflow-hidden rounded-[22px] border border-white/[0.08]"
                      style={{
                        background: "rgba(13,17,35,0.97)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        boxShadow:
                          "0 20px 60px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(80,162,255,0.12)",
                      }}
                    >

                      {/* ── Blue accent bar (matches brand colour) ── */}
                      <div className="h-[3px] w-full" style={{ background: "#50a2ff" }} />

                      {/* ── User header ── */}
                      <div className="relative p-4 border-b border-white/[0.07] overflow-hidden">
                        {/* Subtle blue glow in top-right corner */}
                        <div
                          className="absolute -top-5 -right-5 w-24 h-24 rounded-full pointer-events-none"
                          style={{
                            background:
                              "radial-gradient(circle, rgba(80,162,255,0.12), transparent 70%)",
                          }}
                        />

                        <div className="relative flex items-center gap-3">
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-[14px] overflow-hidden border border-white/12 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
                              {avatar ? (
                                <img
                                  src={avatar}
                                  className="w-full h-full object-cover"
                                  alt="avatar"
                                />
                              ) : (
                                <span className="text-white text-[17px] font-bold">
                                  {user?.name?.charAt(0)?.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <span className="absolute -bottom-[2px] -right-[2px] w-[13px] h-[13px] rounded-full bg-emerald-400 border-2 border-[rgba(13,17,35,0.97)]" />
                          </div>

                          {/* Name / email / role */}
                          <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-semibold text-slate-100 truncate tracking-[-0.01em]">
                              {user?.name}
                            </p>
                            <p className="text-[11.5px] text-slate-400/70 truncate mt-0.5">
                              {user?.email}
                            </p>
                            <span
                              className="inline-flex items-center mt-1.5 px-2 py-[2px] rounded-full text-[9.5px] font-bold uppercase tracking-[0.08em]"
                              style={{
                                background: "rgba(80,162,255,0.12)",
                                border: "1px solid rgba(80,162,255,0.25)",
                                color: "#50a2ff",
                              }}
                            >
                              {user?.roles?.[0]?.name || "User"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ── Menu items ── */}
                      <div className="p-1.5 space-y-0.5">

                        {/* Edit profile */}
                        <button
                          onClick={() => {
                            if (user?.name === "Super Admin") {
                              toast.error("Super Admin profile cannot be edited");
                              return;
                            }
                            setEditOpen(true);
                            setProfileOpen(false);
                          }}
                          disabled={user?.name === "Super Admin"}
                          className={`
            w-full flex items-center gap-3 px-2.5 py-2.5 rounded-[14px]
            transition-all duration-150 group text-left
            ${user?.name === "Super Admin"
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-white/[0.05] active:bg-white/[0.08]"
                            }
          `}
                        >
                          <div
                            className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0 transition-transform duration-150 group-hover:scale-105"
                            style={{
                              background: user?.name === "Super Admin"
                                ? "rgba(255,255,255,0.05)"
                                : "rgba(80,162,255,0.13)",
                              border: `1px solid ${user?.name === "Super Admin"
                                ? "rgba(255,255,255,0.06)"
                                : "rgba(80,162,255,0.20)"}`,
                              color: user?.name === "Super Admin" ? "rgba(148,163,184,0.4)" : "#50a2ff",
                              fontSize: 16,
                            }}
                          >
                            {user?.name === "Super Admin" ? (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </svg>
                            ) : (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            )}
                          </div>
                          <div className="flex flex-col items-start min-w-0">
                            <span
                              className={`text-[13.5px] font-[500] leading-none ${user?.name === "Super Admin" ? "text-slate-500" : "text-slate-200"
                                }`}
                            >
                              Edit profile
                            </span>
                            <span className="text-[11px] text-slate-500 mt-[3px]">
                              {user?.name === "Super Admin" ? "Protected account" : "Manage your account"}
                            </span>
                          </div>
                          {user?.name !== "Super Admin" && (
                            <svg className="ml-auto text-slate-600 flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M9 18l6-6-6-6" />
                            </svg>
                          )}
                        </button>

                        {/* Notifications */}
                        <button
                          className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-[14px] hover:bg-white/[0.05] active:bg-white/[0.08] transition-all duration-150 group text-left"
                        >
                          <div
                            className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0 transition-transform duration-150 group-hover:scale-105"
                            style={{
                              background: "rgba(80,162,255,0.13)",
                              border: "1px solid rgba(80,162,255,0.20)",
                              color: "#50a2ff",
                              fontSize: 16,
                            }}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                          </div>
                          <div className="flex flex-col items-start min-w-0">
                            <span className="text-[13.5px] font-[500] text-slate-200 leading-none">Notifications</span>
                            <span className="text-[11px] text-slate-500 mt-[3px]">3 unread alerts</span>
                          </div>
                          <svg className="ml-auto text-slate-600 flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </button>

                        {/* Divider */}
                        <div className="my-1 mx-1.5 h-px bg-white/[0.06]" />

                        {/* Sign out */}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-[14px] hover:bg-red-500/[0.08] active:bg-red-500/[0.12] transition-all duration-150 group text-left"
                        >
                          <div
                            className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0 transition-transform duration-150 group-hover:scale-105"
                            style={{
                              background: "rgba(239,68,68,0.13)",
                              border: "1px solid rgba(239,68,68,0.20)",
                              color: "#f87171",
                              fontSize: 16,
                            }}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                          </div>
                          <div className="flex flex-col items-start min-w-0">
                            <span className="text-[13.5px] font-[500] text-red-400 leading-none">Sign out</span>
                            <span className="text-[11px] text-slate-500 mt-[3px]">End your session</span>
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