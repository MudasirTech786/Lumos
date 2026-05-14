"use client";

import { useState, useEffect } from "react";

import Link from "next/link";

import { usePathname } from "next/navigation";

import useAuth from "@/hooks/useAuth";

import {
  LayoutDashboard,
  Users,
  Building2,
  Package,
  ShoppingCart,
  DollarSign,
  Settings,
  ChevronDown,
  Briefcase,
} from "lucide-react";

export default function Sidebar({ open, setOpen }) {

  const pathname = usePathname();

  const { can, ready, user } = useAuth();

  // =========================================
  // TOGGLE LOGIC
  // =========================================

  const [hoverOpen, setHoverOpen] = useState(false);

  const [activeMenu, setActiveMenu] = useState(null);

  const isExpanded = open || hoverOpen;

  // =========================================
  // TOGGLE MENU
  // =========================================

  const toggleMenu = (menu) => {

    setActiveMenu((prev) =>
      prev === menu ? null : menu
    );
  };

  // =========================================
  // MOBILE NAV CLOSE
  // =========================================

  const handleNavClick = () => {

    if (window.innerWidth < 768) {

      setOpen(false);

      localStorage.setItem(
        "sidebar-open",
        "false"
      );
    }
  };

  // =========================================
  // ACTIVE MENU
  // =========================================

  useEffect(() => {

    if (
      pathname.includes("/dashboard/users") ||
      pathname.includes("/dashboard/roles") ||
      pathname.includes("/dashboard/permissions")
    ) {

      setActiveMenu("users");

    } else if (
      pathname.includes("/dashboard/employees") ||
      pathname.includes("/dashboard/crew") ||
      pathname.includes("/dashboard/leaves")
    ) {

      setActiveMenu("hr");

    } else if (
      pathname.includes("/products") ||
      pathname.includes("/categories") ||
      pathname.includes("/stock")
    ) {

      setActiveMenu("inventory");

    } else if (
      pathname.includes("/shoots") ||
      pathname.includes("/shoots/create") ||
      pathname.includes("/shoots/crew")
    ) {

      setActiveMenu("productions");

    } else {

      setActiveMenu(null);
    }

  }, [pathname]);

  // =========================================
  // COLLAPSE CLOSE
  // =========================================

  useEffect(() => {

    if (!isExpanded) {

      setActiveMenu(null);
    }

  }, [isExpanded]);

  // =========================================
  // ACTIVE STATES
  // =========================================

  const isActive = (path) =>
    pathname === path;

  const usersActive =
    pathname.includes("/dashboard/users") ||
    pathname.includes("/dashboard/roles") ||
    pathname.includes("/dashboard/permissions");

  const hrActive =
    pathname.includes("/dashboard/employees") ||
    pathname.includes("/dashboard/crew") ||
    pathname.includes("/dashboard/leaves");

  const inventoryActive =
    pathname.includes("/products") ||
    pathname.includes("/categories") ||
    pathname.includes("/stock");

  const productionsActive =
    pathname.includes("/dashboard/shoots") ||
    pathname.includes("/dashboard/shoots/create") ||
    pathname.includes("/dashboard/shoots/crew");

  // =========================================
  // MENU STYLES
  // =========================================

  const menuClass = (active) => `
    group
    relative
    flex
    items-center
    justify-between
    w-full
    rounded-2xl

    ${isExpanded
      ? "px-3 py-3"
      : "px-0 py-2 justify-center"
    }

    transition-all
    duration-300
    border

    ${active
      ? `
        bg-cyan-500/10
        border-cyan-400/10
        text-cyan-300
        shadow-[0_0_25px_rgba(0,255,255,0.05)]
      `
      : `
        border-transparent
        text-white/65
        hover:bg-white/[0.04]
        hover:text-white
      `
    }
  `;

  const subMenuClass = (path) => `
    block
    rounded-xl
    px-4
    py-2.5
    text-sm
    transition-all
    duration-200

    ${isActive(path)
      ? `
        bg-cyan-500/10
        text-cyan-300
      `
      : `
        text-white/45
        hover:bg-white/[0.03]
        hover:text-white
      `
    }
  `;

  // =========================================
  // LOADING
  // =========================================

  if (!ready) {

    return (
      <div className="h-screen w-20 md:w-72 bg-[#070B14]" />
    );
  }

  return (

    <>
      {/* MOBILE OVERLAY */}

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="
            fixed
            inset-0
            bg-black/50
            backdrop-blur-sm
            z-30
            md:hidden
          "
        />
      )}

      {/* SIDEBAR */}

      <div
        onMouseEnter={() => {
          if (window.innerWidth >= 768) {
            setHoverOpen(true);
          }
        }}
        onMouseLeave={() => {
          if (window.innerWidth >= 768) {
            setHoverOpen(false);
          }
        }}
        className={`
          fixed
          md:static
          top-0
          left-0
          z-40
          h-screen
          bg-[#070B14]
          border-r
          border-white/[0.05]
          flex
          flex-col
          transition-all
          duration-300

          ${isExpanded ? "w-72" : "w-20"}

          ${open
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
          }
        `}
      >

        {/* BACKGROUND */}

        <div className="absolute inset-0 overflow-hidden pointer-events-none">

          <div
            className="
              absolute
              top-[-15%]
              left-1/2
              -translate-x-1/2
              w-[320px]
              h-[320px]
              rounded-full
              bg-cyan-500/10
              blur-[120px]
            "
          />

          <div
            className="
              absolute
              inset-0
              opacity-[0.03]
              bg-[linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.3)_1px,transparent_1px)]
              bg-[size:40px_40px]
            "
          />

        </div>

        {/* CONTENT */}

        <div className="relative z-10 flex flex-col h-full">

          {/* HEADER */}

          <div
            className="
              px-4
              pt-5
              pb-4
              min-h-[92px]
              flex
              items-center
              md:items-start
              justify-center
              md:justify-start
            "
          >

            {/* DESKTOP LOGO */}

            <div
              className={`
                hidden
                md:flex
                items-center
                w-full

                ${isExpanded
                  ? "gap-3"
                  : "justify-center"
                }
              `}
            >

              <div
                className="
                  w-12
                  h-12
                  rounded-2xl
                  bg-cyan-500/10
                  border
                  border-cyan-400/10
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >

                <img
                  src="/images/icon.png"
                  className="w-7 h-7 object-contain"
                />

              </div>

              {isExpanded && (

                <div className="min-w-0">

                  <h1
                    className="
                      text-xl
                      font-black
                      tracking-[0.18em]
                      text-white
                    "
                  >
                    NIZAAMO
                  </h1>

                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.24em]
                      text-cyan-300/40
                      mt-1
                    "
                  >
                    CONTROL SYSTEM
                  </p>

                </div>

              )}

            </div>

          </div>

          {/* DIVIDER */}

          <div className="px-4 pb-5">

            <div
              className="
                h-px
                w-full
                bg-gradient-to-r
                from-transparent
                via-white/[0.08]
                to-transparent
              "
            />

          </div>

          {/* MENU */}

          <div
            className="
              flex-1
              overflow-y-auto
              px-3
              pb-6
            "
          >

            {/* DASHBOARD */}

            <Link
              href="/"
              onClick={handleNavClick}
              className={menuClass(isActive("/"))}
            >

              <div className="flex items-center gap-4">

                <MenuIcon active={isActive("/")}>
                  <LayoutDashboard size={19} />
                </MenuIcon>

                {isExpanded && (
                  <span className="font-medium">
                    Dashboard
                  </span>
                )}

              </div>

            </Link>

            {/* USERS */}

            {can("users.view") && (

              <div className="mt-2">

                <button
                  onClick={() => toggleMenu("users")}
                  className={menuClass(usersActive)}
                >

                  <div className="flex items-center gap-4">

                    <MenuIcon active={usersActive}>
                      <Users size={19} />
                    </MenuIcon>

                    {isExpanded && (
                      <span className="font-medium">
                        Users & Roles
                      </span>
                    )}

                  </div>

                  {isExpanded && (

                    <ChevronDown
                      size={16}
                      className={`
                        transition-all
                        duration-300

                        ${activeMenu === "users"
                          ? "rotate-180 text-cyan-300"
                          : "text-white/30"
                        }
                      `}
                    />

                  )}

                </button>

                {isExpanded && activeMenu === "users" && (

                  <div className="ml-14 mt-2 border-l border-white/[0.05] pl-4 space-y-2">

                    <Link
                      href="/dashboard/users"
                      className={subMenuClass("/dashboard/users")}
                    >
                      Users
                    </Link>

                    <Link
                      href="/dashboard/roles"
                      className={subMenuClass("/dashboard/roles")}
                    >
                      Roles
                    </Link>

                    <Link
                      href="/dashboard/permissions"
                      className={subMenuClass("/dashboard/permissions")}
                    >
                      Permissions
                    </Link>

                  </div>

                )}

              </div>

            )}

            {/* HR */}

            {can("hr.view") && (

              <div className="mt-2">

                <button
                  onClick={() => toggleMenu("hr")}
                  className={menuClass(hrActive)}
                >

                  <div className="flex items-center gap-4">

                    <MenuIcon active={hrActive}>
                      <Building2 size={19} />
                    </MenuIcon>

                    {isExpanded && (
                      <span className="font-medium">
                        HR
                      </span>
                    )}

                  </div>

                  {isExpanded && (

                    <ChevronDown
                      size={16}
                      className={`
                        transition-all
                        duration-300

                        ${activeMenu === "hr"
                          ? "rotate-180 text-cyan-300"
                          : "text-white/30"
                        }
                      `}
                    />

                  )}

                </button>

                {isExpanded && activeMenu === "hr" && (

                  <div className="ml-14 mt-2 border-l border-white/[0.05] pl-4 space-y-2">

                    <Link
                      href="/dashboard/crew"
                      className={subMenuClass("/dashboard/crew")}
                    >
                      Crew
                    </Link>

                    <Link
                      href="/dashboard/employees"
                      className={subMenuClass("/dashboard/employees")}
                    >
                      Employees
                    </Link>

                    <Link
                      href="/dashboard/leaves"
                      className={subMenuClass("/dashboard/leaves")}
                    >
                      Leaves
                    </Link>

                  </div>

                )}

              </div>

            )}


            { /* PRODUCTIONS */}

            {can("shoots.view") && (

              <div className="mt-2">

                <button
                  onClick={() =>
                    toggleMenu("productions")
                  }
                  className={menuClass(
                    productionsActive
                  )}
                >

                  <div className="flex items-center gap-4">

                    <MenuIcon active={productionsActive}>
                      <Briefcase size={19} />
                    </MenuIcon>

                    {isExpanded && (

                      <span className="font-medium">
                        Productions
                      </span>

                    )}

                  </div>

                  {isExpanded && (

                    <ChevronDown
                      size={16}
                      className={`

            transition-all
            duration-300

            ${activeMenu === "productions"
                          ? "rotate-180 text-cyan-300"
                          : "text-white/30"
                        }
          `}
                    />

                  )}

                </button>

                {isExpanded &&
                  activeMenu === "productions" && (

                    <div className="
        ml-14
        mt-2
        border-l
        border-white/[0.05]
        pl-4
        space-y-2
      ">

                      {/* ALL PRODUCTIONS */}
                      <Link
                        href="/dashboard/shoots"
                        className={subMenuClass(
                          "/dashboard/shoots"
                        )}
                      >
                        All Productions
                      </Link>

                      {/* CREATE */}
                      <Link
                        href="/dashboard/shoots/create"
                        className={subMenuClass(
                          "/dashboard/shoots/create"
                        )}
                      >
                        Create Production
                      </Link>

                      {/* CREW */}
                      <Link
                        href="/dashboard/shoots/crew"
                        className={subMenuClass(
                          "/dashboard/shoots/crew"
                        )}
                      >
                        Crew Assignments
                      </Link>

                      {/* FUTURE */}
                      <button
                        disabled
                        className="
            w-full
            text-left
            rounded-xl
            px-4
            py-2.5
            text-sm
            text-white/25
            cursor-not-allowed
          "
                      >
                        Scheduling
                      </button>

                      <button
                        disabled
                        className="
            w-full
            text-left
            rounded-xl
            px-4
            py-2.5
            text-sm
            text-white/25
            cursor-not-allowed
          "
                      >
                        Logistics
                      </button>

                      <button
                        disabled
                        className="
            w-full
            text-left
            rounded-xl
            px-4
            py-2.5
            text-sm
            text-white/25
            cursor-not-allowed
          "
                      >
                        Deliverables
                      </button>

                    </div>

                  )}

              </div>

            )}


            {/* INVENTORY */}

            {can("products.view") && (

              <div className="mt-2">

                <button
                  onClick={() => toggleMenu("inventory")}
                  className={menuClass(inventoryActive)}
                >

                  <div className="flex items-center gap-4">

                    <MenuIcon active={inventoryActive}>
                      <Package size={19} />
                    </MenuIcon>

                    {isExpanded && (
                      <span className="font-medium">
                        Inventory
                      </span>
                    )}

                  </div>

                  {isExpanded && (

                    <ChevronDown
                      size={16}
                      className={`
                        transition-all
                        duration-300

                        ${activeMenu === "inventory"
                          ? "rotate-180 text-cyan-300"
                          : "text-white/30"
                        }
                      `}
                    />

                  )}

                </button>

                {isExpanded && activeMenu === "inventory" && (

                  <div className="ml-14 mt-2 border-l border-white/[0.05] pl-4 space-y-2">

                    <Link
                      href="/dashboard/inventory/products"
                      className={subMenuClass("/dashboard/products")}
                    >
                      Products
                    </Link>

                    <Link
                      href="/dashboard/inventory/categories"
                      className={subMenuClass("/dashboard/categories")}
                    >
                      Categories
                    </Link>

                    <Link
                      href="/dashboard/inventory/stock"
                      className={subMenuClass("/dashboard/stock")}
                    >
                      Stock
                    </Link>

                  </div>

                )}

              </div>

            )}

            {/* WORKSPACE */}

            {can("workspaces.view") && (

              <Link
                href="/dashboard/workspaces"
                onClick={handleNavClick}
                className={`mt-2 ${menuClass(
                  isActive("/dashboard/workspaces")
                )}`}
              >

                <div className="flex items-center gap-4">

                  <MenuIcon
                    active={isActive("/dashboard/workspaces")}
                  >
                    <ShoppingCart size={19} />
                  </MenuIcon>

                  {isExpanded && (
                    <span className="font-medium">
                      Workspace
                    </span>
                  )}

                </div>

              </Link>

            )}

            {/* PAYROLL */}

            {can("payroll.view") && (

              <Link
                href="/payrolls"
                onClick={handleNavClick}
                className={`mt-2 ${menuClass(
                  isActive("/payrolls")
                )}`}
              >

                <div className="flex items-center gap-4">

                  <MenuIcon
                    active={isActive("/payrolls")}
                  >
                    <DollarSign size={19} />
                  </MenuIcon>

                  {isExpanded && (
                    <span className="font-medium">
                      Payroll
                    </span>
                  )}

                </div>

              </Link>

            )}

            {/* SETTINGS */}

            {can("settings.view") && (

              <Link
                href="/settings"
                onClick={handleNavClick}
                className={`mt-2 ${menuClass(
                  isActive("/settings")
                )}`}
              >

                <div className="flex items-center gap-4">

                  <MenuIcon
                    active={isActive("/settings")}
                  >
                    <Settings size={19} />
                  </MenuIcon>

                  {isExpanded && (
                    <span className="font-medium">
                      Settings
                    </span>
                  )}

                </div>

              </Link>

            )}

          </div>

          {/* FOOTER */}

          <div className="p-4">

            <div
              className="
                rounded-3xl
                border
                border-white/[0.05]
                bg-white/[0.03]
                backdrop-blur-xl
                p-3
              "
            >

              <div
                className={`
                  flex
                  items-center

                  ${isExpanded
                    ? "gap-3"
                    : "justify-center"
                  }
                `}
              >

                <div
                  className="
                    relative
                    w-12
                    h-12
                    rounded-2xl
                    overflow-hidden
                    bg-cyan-500/10
                    border
                    border-cyan-400/10
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >

                  {user?.avatar ? (

                    <img
                      src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${user.avatar}`}
                      className="w-full h-full object-cover"
                    />

                  ) : (

                    <span className="text-cyan-300 font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>

                  )}

                </div>

                {isExpanded && (

                  <div className="min-w-0">

                    <p className="text-sm font-medium text-white truncate">
                      {user?.name}
                    </p>

                    <p className="text-xs text-white/40 truncate">
                      {user?.email}
                    </p>

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

      </div>
    </>
  );
}

// =========================================
// MENU ICON
// =========================================

function MenuIcon({ children, active }) {

  return (

    <div
      className={`
        relative
        w-11
        h-11
        rounded-2xl
        flex
        items-center
        justify-center
        transition-all
        duration-300
        shrink-0
        border

        ${active
          ? `
            bg-cyan-500/12
            border-cyan-400/20
            text-cyan-300
            shadow-[0_0_18px_rgba(0,255,255,0.08)]
          `
          : `
            bg-white/[0.03]
            border-white/[0.05]
            text-white/70
            group-hover:bg-white/[0.05]
          `
        }
      `}
    >

      {active && (
        <div
          className="
            absolute
            inset-0
            rounded-2xl
            bg-cyan-400/5
            blur-xl
          "
        />
      )}

      <div className="relative z-10">
        {children}
      </div>

    </div>
  );
}