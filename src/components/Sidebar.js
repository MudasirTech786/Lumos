"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Users,
  Building2,
  Package,
  ShoppingCart,
  Settings,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Landmark,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// NESTED SUB-SECTION (Asset Tracking, Usage, Damages)
// ─────────────────────────────────────────────────────────────────────────────
function NestedSection({ label, children, isActive }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isActive) setOpen(true);
  }, [isActive]);

  return (
    <div>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between rounded-xl px-3 py-[8px] text-[12px] font-semibold transition-all duration-200 hover:bg-white/[0.05] hover:text-white"
        style={{
          color: open
            ? "rgba(255,255,255,0.88)"
            : "rgba(255,255,255,0.65)",
          letterSpacing: "0.02em"
        }}
      >
        <span>{label}</span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""
            }`}
          style={{
            color: open
              ? "#8B7FFF"
              : "rgba(255,255,255,0.45)"
          }}
        />
      </button>
      <div
        className={`ml-3 pl-3 space-y-0.5 overflow-hidden transition-all duration-300 sidebar-submenu-track ${open ? "max-h-96 mt-0.5 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION GROUP LABEL
// ─────────────────────────────────────────────────────────────────────────────
function SectionLabel({ label }) {
  return (
    <div className="flex items-center gap-3 px-1 pt-5 pb-2">
      <span
        className="text-[10px] font-semibold uppercase whitespace-nowrap"
        style={{ color: "rgba(139,127,255,0.65)", letterSpacing: "0.15em" }}
      >
        {label}
      </span>
      <div
        className="flex-1 h-px"
        style={{ background: "linear-gradient(to right, rgba(139,127,255,0.18), transparent)" }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COLLAPSED TOOLTIP
// ─────────────────────────────────────────────────────────────────────────────
function CollapsedTooltip({ label, subtitle }) {
  return (
    <div
      className="absolute left-full ml-4 top-1/2 -translate-y-1/2 z-50 pointer-events-none min-w-[170px]
        rounded-2xl border border-white/[0.07] px-4 py-3 shadow-2xl shadow-black/60
        opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0
        transition-all duration-200"
      style={{ background: "#161A2E" }}
    >
      <p className="text-[13px] font-semibold text-white leading-tight">{label}</p>
      {subtitle && (
        <p className="text-[11px] mt-0.5 leading-tight" style={{ color: "rgba(255,255,255,0.40)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MENU ICON BOX
// ─────────────────────────────────────────────────────────────────────────────
function MenuIcon({ children, active }) {
  return (
    <div
      className="relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0"
      style={
        active
          ? {
            background: "rgba(255,255,255,0.18)",
            color: "#FFFFFF",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.20), 0 1px 3px rgba(0,0,0,0.3)",
          }
          : {
            background: "rgba(22,26,46,0.8)",
            color: "rgba(255,255,255,0.65)",
            border: "1px solid rgba(255,255,255,0.04)",
          }
      }
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPANDED CHEVRON — for parent menu rows (smooth rotation)
// ─────────────────────────────────────────────────────────────────────────────
function ExpandChevron({ isOpen, active }) {
  return (
    <div
      className="shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200"
      style={{
        background: isOpen
          ? "rgba(139,127,255,0.15)"
          : "rgba(255,255,255,0.04)",
        border: isOpen
          ? "1px solid rgba(139,127,255,0.25)"
          : "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <ChevronDown
        size={11}
        className="transition-transform duration-250"
        style={{
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          color: isOpen
            ? "#8B7FFF"
            : active
              ? "rgba(255,255,255,0.60)"
              : "rgba(255,255,255,0.28)",
          transition: "transform 250ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms ease",
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COLLAPSED SUBMENU BADGE — small stacked-layers indicator bottom-right of icon
// Shows on items that contain submenus, so users know before clicking
// ─────────────────────────────────────────────────────────────────────────────
function SubmenuBadge({ active }) {
  return (
    <span
      className="absolute -bottom-[3px] -right-[3px] flex items-center justify-center"
      style={{ width: 14, height: 14 }}
    >
      {/* Outer ring */}
      <span
        className="absolute inset-0 rounded-full transition-all duration-200"
        style={{
          background: active ? "#0D0F1F" : "#0D0F1F",
          border: active
            ? "1.5px solid rgba(139,127,255,0.55)"
            : "1.5px solid rgba(255,255,255,0.14)",
        }}
      />
      {/* Three stacked lines — universal "has more" metaphor */}
      <span className="relative z-10 flex flex-col items-center justify-center gap-[2px]">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              display: "block",
              width: i === 0 ? 5 : i === 1 ? 4 : 3,
              height: 1,
              borderRadius: 1,
              background: active
                ? "#8B7FFF"
                : "rgba(255,255,255,0.38)",
              transition: "all 150ms ease",
            }}
          />
        ))}
      </span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
export default function Sidebar({ open, setOpen }) {
  const pathname = usePathname();
  const { can, ready, user } = useAuth();

  const [hoverOpen, setHoverOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const hoverTimer = useRef(null);

  const isExpanded = open || hoverOpen;

  const toggleMenu = (menu) =>
    setActiveMenu((prev) => (prev === menu ? null : menu));

  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setOpen(false);
      localStorage.setItem("sidebar-open", "false");
    }
  };

  useEffect(() => {
    if (
      pathname.includes("/dashboard/users") ||
      pathname.includes("/dashboard/roles") ||
      pathname.includes("/dashboard/permissions")
    )
      setActiveMenu("users");
    else if (
      pathname.includes("/dashboard/employees") ||
      pathname.includes("/dashboard/crew") ||
      pathname.includes("/dashboard/leaves")
    )
      setActiveMenu("hr");
    else if (pathname.includes("/dashboard/inventory"))
      setActiveMenu("inventory");
    else if (pathname.includes("/dashboard/shoots"))
      setActiveMenu("productions");
    else if (
      pathname.includes("/dashboard/finance") ||
      pathname.includes("/dashboard/invoices")
    )
      setActiveMenu("finance");
    else setActiveMenu(null);
  }, [pathname]);

  useEffect(() => {
    if (!isExpanded) setActiveMenu(null);
  }, [isExpanded]);

  const handleMouseEnter = () => {
    if (window.innerWidth < 768) return;
    clearTimeout(hoverTimer.current);
    setHoverOpen(true);
  };
  const handleMouseLeave = () => {
    if (window.innerWidth < 768) return;
    hoverTimer.current = setTimeout(() => setHoverOpen(false), 150);
  };

  // ── Active state helpers ──
  const isActive = (path) => pathname === path;

  const usersActive =
    pathname.includes("/dashboard/users") ||
    pathname.includes("/dashboard/roles") ||
    pathname.includes("/dashboard/permissions");

  const hrActive =
    pathname.includes("/dashboard/employees") ||
    pathname.includes("/dashboard/crew") ||
    pathname.includes("/dashboard/leaves");

  const inventoryActive = pathname.includes("/dashboard/inventory");
  const productionsActive = pathname.includes("/dashboard/shoots");
  const financeActive =
    pathname.includes("/dashboard/finance") ||
    pathname.includes("/dashboard/invoices");

  // ── Style helpers ──
  const activeStyle = {
    background: "linear-gradient(160deg, #5C53F1 0%, #4A42D8 50%, #3E37C4 100%)",
    boxShadow: "0 6px 20px rgba(74,66,216,0.40), inset 0 1px 0 rgba(255,255,255,0.11)",
    border: "1px solid rgba(139,127,255,0.18)",
  };
  const inactiveStyle = { border: "1px solid transparent" };

  const menuClass = (active) =>
    [
      "group relative flex items-center justify-between w-full rounded-2xl",
      "transition-all duration-200",
      isExpanded ? "px-3 py-[10px]" : "px-0 py-2 justify-center",
      !active && "hover:bg-white/[0.05] hover:border-white/[0.06]",
    ]
      .filter(Boolean)
      .join(" ");

  const subMenuClass = (path) =>
    [
      "relative flex items-center rounded-xl px-3 py-[8px]",
      "text-[12.5px] font-medium transition-all duration-150",
      isActive(path)
        ? "submenu-active text-white"
        : "hover:text-white",
    ].join(" ");

  const subMenuStyle = (path) =>
    isActive(path)
      ? {
        color: "#FFFFFF",
        background: "linear-gradient(135deg, rgba(91,82,240,0.22) 0%, rgba(74,66,216,0.12) 100%)",
        boxShadow: "inset 0 0 0 1px rgba(139,127,255,0.20)",
      }
      : {
        color: "rgba(255,255,255,0.62)",
      };

  if (!ready) {
    return (
      <div
        className="h-screen shrink-0"
        style={{ width: isExpanded ? 290 : 88, background: "#0D0F1F" }}
      />
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // COLLAPSED NAV — icons vertically centered, submenu badge on parents
  // ─────────────────────────────────────────────────────────────────────────
  const collapsedNav = (
    <div className="flex flex-col items-center gap-1 w-full">
      {/* Dashboard — leaf link, no badge */}
      <Link
        href="/"
        onClick={handleNavClick}
        className={menuClass(isActive("/"))}
        style={isActive("/") ? activeStyle : inactiveStyle}
      >
        <MenuIcon active={isActive("/")}><LayoutDashboard size={18} /></MenuIcon>
        <CollapsedTooltip label="Dashboard" subtitle="Overview & KPIs" />
      </Link>

      <div className="h-1" />

      {/* Access Control — has submenus → badge */}
      {can("users.view") && (
        <button
          onClick={() => toggleMenu("users")}
          className={menuClass(usersActive)}
          style={usersActive ? activeStyle : inactiveStyle}
        >
          <div className="relative">
            <MenuIcon active={usersActive}><Users size={18} /></MenuIcon>
            <SubmenuBadge active={usersActive} />
          </div>
          <CollapsedTooltip label="Access Control" subtitle="Users • Roles • Permissions" />
        </button>
      )}

      {/* Workforce — has submenus → badge */}
      {can("hr.view") && (
        <button
          onClick={() => toggleMenu("hr")}
          className={menuClass(hrActive)}
          style={hrActive ? activeStyle : inactiveStyle}
        >
          <div className="relative">
            <MenuIcon active={hrActive}><Building2 size={18} /></MenuIcon>
            <SubmenuBadge active={hrActive} />
          </div>
          <CollapsedTooltip label="Workforce" subtitle="Crew • Employees • Leaves" />
        </button>
      )}

      <div className="h-1" />

      {/* Productions — has submenus → badge */}
      {can("shoots.view") && (
        <button
          onClick={() => toggleMenu("productions")}
          className={menuClass(productionsActive)}
          style={productionsActive ? activeStyle : inactiveStyle}
        >
          <div className="relative">
            <MenuIcon active={productionsActive}><Briefcase size={18} /></MenuIcon>
            <SubmenuBadge active={productionsActive} />
          </div>
          <CollapsedTooltip label="Productions" subtitle="Shoots • Scheduling" />
        </button>
      )}

      {/* Inventory — has submenus → badge */}
      {can("products.view") && (
        <button
          onClick={() => toggleMenu("inventory")}
          className={menuClass(inventoryActive)}
          style={inventoryActive ? activeStyle : inactiveStyle}
        >
          <div className="relative">
            <MenuIcon active={inventoryActive}><Package size={18} /></MenuIcon>
            <SubmenuBadge active={inventoryActive} />
          </div>
          <CollapsedTooltip label="Inventory" subtitle="Assets • Tracking • QR" />
        </button>
      )}

      <div className="h-1" />

      {/* Finance — has submenus → badge */}
      {can("finance.view") && (
        <button
          onClick={() => toggleMenu("finance")}
          className={menuClass(financeActive)}
          style={financeActive ? activeStyle : inactiveStyle}
        >
          <div className="relative">
            <MenuIcon active={financeActive}><Landmark size={18} /></MenuIcon>
            <SubmenuBadge active={financeActive} />
          </div>
          <CollapsedTooltip label="Finance" subtitle="Payroll • Expenses • Invoices" />
        </button>
      )}

      <div className="h-1" />

      {/* Workspace — leaf link, no badge */}
      {can("workspaces.view") && (
        <Link
          href="/dashboard/workspaces"
          onClick={handleNavClick}
          className={menuClass(isActive("/dashboard/workspaces"))}
          style={isActive("/dashboard/workspaces") ? activeStyle : inactiveStyle}
        >
          <MenuIcon active={isActive("/dashboard/workspaces")}><ShoppingCart size={18} /></MenuIcon>
          <CollapsedTooltip label="Workspace" subtitle="Projects • Teams • Notes" />
        </Link>
      )}

      {/* Settings — leaf link, no badge */}
      {can("settings.view") && (
        <Link
          href="/settings"
          onClick={handleNavClick}
          className={menuClass(isActive("/settings"))}
          style={isActive("/settings") ? activeStyle : inactiveStyle}
        >
          <MenuIcon active={isActive("/settings")}><Settings size={18} /></MenuIcon>
          <CollapsedTooltip label="Settings" subtitle="App preferences" />
        </Link>
      )}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={[
          "fixed md:static top-0 left-0 z-40 h-screen",
          "flex flex-col transition-all duration-250",
          isExpanded ? "w-[290px]" : "w-[88px]",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
        style={{
          background: "#0D0F1F",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          overflow: "hidden",
        }}
      >
        {/* BG glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full blur-[120px]"
            style={{ background: "rgba(79,70,229,0.08)" }}
          />
        </div>

        {/* ── ZONE 1: LOGO ── */}
        <div
          className="relative z-10 shrink-0 flex items-center justify-center px-4"
          style={{ height: "80px" }}
        >
          {!isExpanded ? (
            <div className="w-18 h-18 rounded-2xl flex items-center justify-center">
              <img src="/images/Lumos.png" className="w-18 h-18 object-contain" alt="Lumos" />
            </div>
          ) : (
            <img src="/images/LUMOS-LOGO.png" alt="Lumos" className="h-72 mt-6 w-auto object-contain" />
          )}
        </div>

        {/* ── ZONE 2: NAVIGATION ── */}
        {isExpanded ? (
          /* EXPANDED — full labels + chevron indicators */
          <div
            className="sidebar-scroll-zone relative z-10 flex-1 min-h-0 px-3 py-2 space-y-0.5"
            style={{
              overflowY: "auto",
              overflowX: "hidden",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <SectionLabel label="Overview" />

            {/* Dashboard — leaf */}
            <Link
              href="/"
              onClick={handleNavClick}
              className={menuClass(isActive("/"))}
              style={isActive("/") ? activeStyle : inactiveStyle}
            >
              <div className="flex items-center gap-3">
                <MenuIcon active={isActive("/")}><LayoutDashboard size={18} /></MenuIcon>
                <div>
                  <p className="text-[13.5px] font-semibold text-white leading-tight">Dashboard</p>
                  <p className="text-[11px] mt-0.5 leading-tight" style={{ color: isActive("/") ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.38)" }}>Overview & KPIs</p>
                </div>
              </div>
            </Link>

            <SectionLabel label="Management" />

            {/* Access Control — parent with submenus */}
            {can("users.view") && (
              <div>
                <button
                  onClick={() => toggleMenu("users")}
                  className={menuClass(usersActive)}
                  style={usersActive ? activeStyle : inactiveStyle}
                >
                  <div className="flex items-center gap-3">
                    <MenuIcon active={usersActive}><Users size={18} /></MenuIcon>
                    <div className="text-left">
                      <p className="text-[13.5px] font-semibold text-white leading-tight">Access Control</p>
                      <p className="text-[11px] mt-0.5 leading-tight" style={{ color: usersActive ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.38)" }}>Users • Roles • Permissions</p>
                    </div>
                  </div>
                  <ExpandChevron isOpen={activeMenu === "users"} active={usersActive} />
                </button>
                <div
                  className="overflow-hidden transition-all duration-250"
                  style={{
                    maxHeight: activeMenu === "users" ? "200px" : "0px",
                    opacity: activeMenu === "users" ? 1 : 0,
                    transition: "max-height 250ms cubic-bezier(0.4,0,0.2,1), opacity 200ms ease",
                  }}
                >
                  <div className="ml-[52px] mt-1.5 pl-3.5 space-y-0.5 pb-1 sidebar-submenu-track">
                    <Link href="/dashboard/users" className={subMenuClass("/dashboard/users")} style={subMenuStyle("/dashboard/users")}>Users</Link>
                    <Link href="/dashboard/roles" className={subMenuClass("/dashboard/roles")} style={subMenuStyle("/dashboard/roles")}>Roles</Link>
                    <Link href="/dashboard/permissions" className={subMenuClass("/dashboard/permissions")} style={subMenuStyle("/dashboard/permissions")}>Permissions</Link>
                  </div>
                </div>
              </div>
            )}

            {/* Workforce — parent with submenus */}
            {can("hr.view") && (
              <div>
                <button
                  onClick={() => toggleMenu("hr")}
                  className={menuClass(hrActive)}
                  style={hrActive ? activeStyle : inactiveStyle}
                >
                  <div className="flex items-center gap-3">
                    <MenuIcon active={hrActive}><Building2 size={18} /></MenuIcon>
                    <div className="text-left">
                      <p className="text-[13.5px] font-semibold text-white leading-tight">Workforce</p>
                      <p className="text-[11px] mt-0.5 leading-tight" style={{ color: hrActive ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.38)" }}>Crew • Employees • Leaves</p>
                    </div>
                  </div>
                  <ExpandChevron isOpen={activeMenu === "hr"} active={hrActive} />
                </button>
                <div
                  className="overflow-hidden"
                  style={{
                    maxHeight: activeMenu === "hr" ? "200px" : "0px",
                    opacity: activeMenu === "hr" ? 1 : 0,
                    transition: "max-height 250ms cubic-bezier(0.4,0,0.2,1), opacity 200ms ease",
                  }}
                >
                  <div className="ml-[52px] mt-1.5 pl-3.5 space-y-0.5 pb-1 sidebar-submenu-track">
                    <Link href="/dashboard/crew" className={subMenuClass("/dashboard/crew")} style={subMenuStyle("/dashboard/crew")}>Crew</Link>
                    <Link href="/dashboard/employees" className={subMenuClass("/dashboard/employees")} style={subMenuStyle("/dashboard/employees")}>Employees</Link>
                    <Link href="/dashboard/leaves" className={subMenuClass("/dashboard/leaves")} style={subMenuStyle("/dashboard/leaves")}>Leaves</Link>
                  </div>
                </div>
              </div>
            )}

            <SectionLabel label="Operations" />

            {/* Productions — parent with submenus */}
            {can("shoots.view") && (
              <div>
                <button
                  onClick={() => toggleMenu("productions")}
                  className={menuClass(productionsActive)}
                  style={productionsActive ? activeStyle : inactiveStyle}
                >
                  <div className="flex items-center gap-3">
                    <MenuIcon active={productionsActive}><Briefcase size={18} /></MenuIcon>
                    <div className="text-left">
                      <p className="text-[13.5px] font-semibold text-white leading-tight">Productions</p>
                      <p className="text-[11px] mt-0.5 leading-tight" style={{ color: productionsActive ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.38)" }}>Shoots • Scheduling</p>
                    </div>
                  </div>
                  <ExpandChevron isOpen={activeMenu === "productions"} active={productionsActive} />
                </button>
                <div
                  className="overflow-hidden"
                  style={{
                    maxHeight: activeMenu === "productions" ? "200px" : "0px",
                    opacity: activeMenu === "productions" ? 1 : 0,
                    transition: "max-height 250ms cubic-bezier(0.4,0,0.2,1), opacity 200ms ease",
                  }}
                >
                  <div className="ml-[52px] mt-1.5 pl-3.5 space-y-0.5 pb-1 sidebar-submenu-track">
                    <Link href="/dashboard/shoots" className={subMenuClass("/dashboard/shoots")} style={subMenuStyle("/dashboard/shoots")}>All Productions</Link>
                    <Link href="/dashboard/shoots/calendar" className={subMenuClass("/dashboard/shoots/calendar")} style={subMenuStyle("/dashboard/shoots/calendar")}>Calendar View</Link>
                    <Link href="/dashboard/shoots/scheduling" className={subMenuClass("/dashboard/shoots/scheduling")} style={subMenuStyle("/dashboard/shoots/scheduling")}>Scheduling</Link>
                  </div>
                </div>
              </div>
            )}

            {/* Inventory — parent with submenus */}
            {can("products.view") && (
              <div>
                <button
                  onClick={() => toggleMenu("inventory")}
                  className={menuClass(inventoryActive)}
                  style={inventoryActive ? activeStyle : inactiveStyle}
                >
                  <div className="flex items-center gap-3">
                    <MenuIcon active={inventoryActive}><Package size={18} /></MenuIcon>
                    <div className="text-left">
                      <p className="text-[13.5px] font-semibold text-white leading-tight">Inventory</p>
                      <p className="text-[11px] mt-0.5 leading-tight" style={{ color: inventoryActive ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.38)" }}>Assets • Tracking • QR</p>
                    </div>
                  </div>
                  <ExpandChevron isOpen={activeMenu === "inventory"} active={inventoryActive} />
                </button>
                <div
                  className="overflow-hidden"
                  style={{
                    maxHeight: activeMenu === "inventory" ? "600px" : "0px",
                    opacity: activeMenu === "inventory" ? 1 : 0,
                    transition: "max-height 350ms cubic-bezier(0.4,0,0.2,1), opacity 200ms ease",
                  }}
                >
                  <div className="ml-[52px] mt-1.5 pl-3.5 space-y-0.5 pb-1 sidebar-submenu-track">
                    <Link href="/dashboard/inventory/items" className={subMenuClass("/dashboard/inventory/items")} style={subMenuStyle("/dashboard/inventory/items")}>Items</Link>
                    <Link href="/dashboard/inventory/categories" className={subMenuClass("/dashboard/inventory/categories")} style={subMenuStyle("/dashboard/inventory/categories")}>Categories</Link>
                    <Link href="/dashboard/inventory/stock" className={subMenuClass("/dashboard/inventory/stock")} style={subMenuStyle("/dashboard/inventory/stock")}>Stock</Link>
                    <Link href="/dashboard/inventory/movements" className={subMenuClass("/dashboard/inventory/movements")} style={subMenuStyle("/dashboard/inventory/movements")}>Movements</Link>
                    <NestedSection label="Asset Tracking" isActive={pathname.includes("/dashboard/inventory/assets") || pathname.includes("/dashboard/inventory/scanner")}>
                      <Link href="/dashboard/inventory/assets" className={subMenuClass("/dashboard/inventory/assets")} style={subMenuStyle("/dashboard/inventory/assets")}>Assets</Link>
                      <Link href="/dashboard/inventory/scanner" className={subMenuClass("/dashboard/inventory/scanner")} style={subMenuStyle("/dashboard/inventory/scanner")}>QR Scanner</Link>
                      <Link href="/dashboard/inventory/assets/labels" className={subMenuClass("/dashboard/inventory/assets/labels")} style={subMenuStyle("/dashboard/inventory/assets/labels")}>Print Labels</Link>
                    </NestedSection>
                    <NestedSection label="Usage" isActive={pathname.includes("/dashboard/inventory/usage")}>
                      <Link href="/dashboard/inventory/usage/active" className={subMenuClass("/dashboard/inventory/usage/active")} style={subMenuStyle("/dashboard/inventory/usage/active")}>Active Usage</Link>
                      <Link href="/dashboard/inventory/usage/allocations" className={subMenuClass("/dashboard/inventory/usage/allocations")} style={subMenuStyle("/dashboard/inventory/usage/allocations")}>Shoot Allocations</Link>
                      <Link href="/dashboard/inventory/usage/checkouts" className={subMenuClass("/dashboard/inventory/usage/checkouts")} style={subMenuStyle("/dashboard/inventory/usage/checkouts")}>Check-Outs</Link>
                      <Link href="/dashboard/inventory/usage/returns" className={subMenuClass("/dashboard/inventory/usage/returns")} style={subMenuStyle("/dashboard/inventory/usage/returns")}>Returns</Link>
                    </NestedSection>
                    <NestedSection label="Damages" isActive={pathname.includes("/dashboard/inventory/damages")}>
                      <Link href="/dashboard/inventory/damages/damage-reports" className={subMenuClass("/dashboard/inventory/damages/reports")} style={subMenuStyle("/dashboard/inventory/damages/reports")}>Damage Reports</Link>
                      <Link href="/dashboard/inventory/damages/inspections" className={subMenuClass("/dashboard/inventory/damages/inspections")} style={subMenuStyle("/dashboard/inventory/damages/inspections")}>Inspections</Link>
                      <Link href="/dashboard/inventory/damages/repairs" className={subMenuClass("/dashboard/inventory/damages/repairs")} style={subMenuStyle("/dashboard/inventory/damages/repairs")}>Repairs</Link>
                      <Link href="/dashboard/inventory/damages/write-offs" className={subMenuClass("/dashboard/inventory/damages/writeoffs")} style={subMenuStyle("/dashboard/inventory/damages/writeoffs")}>Write-Offs</Link>
                    </NestedSection>
                  </div>
                </div>
              </div>
            )}

            <SectionLabel label="Finance" />

            {/* Finance — parent with submenus */}
            {can("finance.view") && (
              <div>
                <button
                  onClick={() => toggleMenu("finance")}
                  className={menuClass(financeActive)}
                  style={financeActive ? activeStyle : inactiveStyle}
                >
                  <div className="flex items-center gap-3">
                    <MenuIcon active={financeActive}><Landmark size={18} /></MenuIcon>
                    <div className="text-left">
                      <p className="text-[13.5px] font-semibold text-white leading-tight">Finance</p>
                      <p className="text-[11px] mt-0.5 leading-tight" style={{ color: financeActive ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.38)" }}>Payroll • Expenses • Invoices</p>
                    </div>
                  </div>
                  <ExpandChevron isOpen={activeMenu === "finance"} active={financeActive} />
                </button>
                <div
                  className="overflow-hidden"
                  style={{
                    maxHeight: activeMenu === "finance" ? "400px" : "0px",
                    opacity: activeMenu === "finance" ? 1 : 0,
                    transition: "max-height 300ms cubic-bezier(0.4,0,0.2,1), opacity 200ms ease",
                  }}
                >
                  <div className="ml-[52px] mt-1.5 pl-3.5 space-y-0.5 pb-1 sidebar-submenu-track">
                    <Link href="/dashboard/finance" className={subMenuClass("/dashboard/finance")} style={subMenuStyle("/dashboard/finance")}>Production Finance</Link>
                    <Link href="/dashboard/finance/expenses" className={subMenuClass("/dashboard/finance/expenses")} style={subMenuStyle("/dashboard/finance/expenses")}>Shoot Expenses</Link>
                    <Link href="/dashboard/finance/crew-payroll" className={subMenuClass("/dashboard/finance/crew-payroll")} style={subMenuStyle("/dashboard/finance/crew-payroll")}>Crew Payroll</Link>
                    <Link href="/dashboard/finance/employee-payroll" className={subMenuClass("/dashboard/finance/employee-payroll")} style={subMenuStyle("/dashboard/finance/employee-payroll")}>Employee Payroll</Link>
                    <Link href="/dashboard/finance/payrolls" className={subMenuClass("/dashboard/finance/payrolls")} style={subMenuStyle("/dashboard/finance/payrolls")}>Payroll Runs</Link>
                    <Link href="/dashboard/finance/reports" className={subMenuClass("/dashboard/finance/reports")} style={subMenuStyle("/dashboard/finance/reports")}>Reports</Link>
                    {can("production_invoices.view") && (
                      <Link href="/dashboard/invoices/production-invoices" className={subMenuClass("/dashboard/invoices/production-invoices")} style={subMenuStyle("/dashboard/invoices/production-invoices")}>Production Invoices</Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            <SectionLabel label="Collaboration" />

            {/* Workspace — leaf link */}
            {can("workspaces.view") && (
              <Link
                href="/dashboard/workspaces"
                onClick={handleNavClick}
                className={menuClass(isActive("/dashboard/workspaces"))}
                style={isActive("/dashboard/workspaces") ? activeStyle : inactiveStyle}
              >
                <div className="flex items-center gap-3">
                  <MenuIcon active={isActive("/dashboard/workspaces")}><ShoppingCart size={18} /></MenuIcon>
                  <div>
                    <p className="text-[13.5px] font-semibold text-white leading-tight">Workspace</p>
                    <p className="text-[11px] mt-0.5 leading-tight" style={{ color: isActive("/dashboard/workspaces") ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.38)" }}>Projects • Teams • Notes</p>
                  </div>
                </div>
                {/* No chevron — leaf link */}
              </Link>
            )}

            {/* Settings — leaf link */}
            {can("settings.view") && (
              <Link
                href="/settings"
                onClick={handleNavClick}
                className={menuClass(isActive("/settings"))}
                style={isActive("/settings") ? activeStyle : inactiveStyle}
              >
                <div className="flex items-center gap-3">
                  <MenuIcon active={isActive("/settings")}><Settings size={18} /></MenuIcon>
                  <div>
                    <p className="text-[13.5px] font-semibold text-white leading-tight">Settings</p>
                    <p className="text-[11px] mt-0.5 leading-tight" style={{ color: isActive("/settings") ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.38)" }}>App preferences</p>
                  </div>
                </div>
                {/* No chevron — leaf link */}
              </Link>
            )}

            <div className="h-4" />
          </div>
        ) : (
          /* COLLAPSED — icons vertically centered */
          <div className="relative z-10 flex-1 min-h-0 flex items-center justify-center px-3">
            {collapsedNav}
          </div>
        )}

        {/* ── ZONE 3: USER CARD ── */}
        <div className="relative z-10 shrink-0 p-3 pt-0">
          <div
            className="h-px mb-3"
            style={{ background: "linear-gradient(to right, transparent, rgba(139,127,255,0.20), transparent)" }}
          />
          <div
            className="rounded-2xl p-[1px] transition-all duration-200 hover:brightness-110"
            style={{ background: "linear-gradient(145deg, rgba(91,82,240,0.35) 0%, rgba(67,56,202,0.18) 60%, rgba(255,255,255,0.04) 100%)" }}
          >
            <div
              className="rounded-[15px] p-3 flex items-center transition-all duration-200"
              style={{
                background: "rgba(14,17,32,0.97)",
                gap: isExpanded ? "10px" : undefined,
                justifyContent: !isExpanded ? "center" : undefined,
              }}
            >
              <div className="relative shrink-0">
                <div
                  className="w-[42px] h-[42px] rounded-full p-[2px] shrink-0"
                  style={{ background: "linear-gradient(135deg, #5B52F0 0%, #7C6FF7 50%, #9B8FF9 100%)" }}
                >
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center" style={{ background: "#0D0F1F" }}>
                    {user?.avatar ? (
                      <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${user.avatar}`} className="w-full h-full object-cover" alt={user?.name} />
                    ) : (
                      <span className="text-white font-bold text-[14px]">{user?.name?.charAt(0)?.toUpperCase()}</span>
                    )}
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-[9px] h-[9px] rounded-full" style={{ background: "#22C55E", border: "2px solid #0E1120", boxShadow: "0 0 0 1px rgba(34,197,94,0.3)" }} />
              </div>

              {isExpanded && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-white truncate leading-tight">{user?.name}</p>
                    <p className="text-[11px] truncate leading-tight mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>{user?.email}</p>
                  </div>
                  <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.25)" }} className="shrink-0" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}