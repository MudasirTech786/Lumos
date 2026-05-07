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
} from "lucide-react";

export default function Sidebar({ open, setOpen }) {
  const pathname = usePathname();
  const { can, ready, user } = useAuth();

  const [hoverOpen, setHoverOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const isExpanded = open || hoverOpen;

  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setOpen(false);
      localStorage.setItem("sidebar-open", "false");
    }
  };

  // AUTO OPEN BASED ON ROUTE
  useEffect(() => {
    if (pathname.includes("/users")) setActiveMenu("users");
    else if (
      pathname.includes("/employees") ||
      pathname.includes("/crew") ||
      pathname.includes("/attendance") ||
      pathname.includes("/leaves") ||
      pathname.includes("/performance")
    ) {
      setActiveMenu("hr");
    }
    else if (pathname.includes("/products")) setActiveMenu("inventory");
    else setActiveMenu(null);
  }, [pathname]);

  const isActive = (path) => pathname === path;

  const menuClass = (path) =>
    `flex items-center gap-4 px-4 py-3 rounded-lg transition cursor-pointer
    ${isActive(path)
      ? "bg-blue-600 text-white"
      : "text-white/90 hover:bg-blue-600/80 hover:text-white"
    }`;

  const subMenuClass = (path) =>
    `block px-3 py-2 rounded-md text-sm transition
    ${isActive(path)
      ? "bg-blue-600 text-white"
      : "text-white/80 hover:bg-blue-600/60 hover:text-white"
    }`;

  if (!ready) {
    return <div className="h-screen w-20 md:w-64 bg-[#1f2230]" />;
  }

  return (
    <div
      onMouseEnter={() => setHoverOpen(true)}
      onMouseLeave={() => setHoverOpen(false)}
      className={`
        fixed md:static z-40 h-screen bg-[#1f2230]
        flex flex-col transition-all duration-300
        ${isExpanded ? "w-64" : "w-20"}
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
    >

      {/* HEADER */}
      <div className="flex flex-col items-center px-4 py-6">
        <img
          src={isExpanded ? "/images/Header.png" : "/images/icon.png"}
        />
        <div className="w-full h-px bg-white/10 mt-5" />
      </div>

      {/* MENU */}
      <div className="flex-1 px-3 space-y-2 overflow-y-auto">

        {/* DASHBOARD */}
        <Link href="/dashboard" className={menuClass("/dashboard")} onClick={handleNavClick}>
          <LayoutDashboard size={20} />
          {isExpanded && <span>Dashboard</span>}
        </Link>

        {/* USERS */}
        {can("users.view") && (
          <div
            onMouseEnter={() => setActiveMenu("users")}
          >
            <div className={menuClass("/users")}>
              <div className="flex items-center gap-4">
                <Users size={20} />
                {isExpanded && <span>Users & Roles</span>}
              </div>

              {isExpanded && (
                <ChevronDown
                  size={16}
                  className={`transition ${activeMenu === "users" ? "rotate-180" : ""
                    }`}
                />
              )}
            </div>

            {isExpanded && activeMenu === "users" && (
              <div className="ml-12 border-l border-white/10 pl-4 space-y-2 text-sm mt-2">
                <Link href="/dashboard/users" className={subMenuClass("/users")}>
                  Users
                </Link>
                <Link href="/dashboard/roles" className={subMenuClass("/roles")}>
                  Roles
                </Link>
                <Link href="/dashboard/permissions" className={subMenuClass("/permissions")}>
                  Permissions
                </Link>
              </div>
            )}
          </div>
        )}

        {/* HR */}
        {can("hr.view") && (
          <div onMouseEnter={() => setActiveMenu("hr")}>
            <div className={menuClass("/employees")}>
              <div className="flex items-center gap-4">
                <Building2 size={20} />
                {isExpanded && <span>HR</span>}
              </div>

              {isExpanded && (
                <ChevronDown
                  size={16}
                  className={`transition ${activeMenu === "hr" ? "rotate-180" : ""
                    }`}
                />
              )}
            </div>

            {isExpanded && activeMenu === "hr" && (
              <div className="ml-12 border-l border-white/10 pl-4 space-y-2 text-sm mt-2">

                <Link href="/dashboard/crew" className={subMenuClass("/crew")}>
                  Crew
                </Link>

                <Link href="/dashboard/employees" className={subMenuClass("/employees")}>
                  Employees
                </Link>

                {/* <Link href="/attendance" className={subMenuClass("/attendance")}>
                  Attendance
                </Link> */}
{can("hr.view") && (
                <Link href="/dashboard/leaves" className={subMenuClass("/leaves")}>
                  Leaves
                </Link>
                )}

                {/* <Link href="/performance" className={subMenuClass("/performance")}>
                  Performance
                </Link> */}

              </div>
            )}
          </div>
        )}

        {/* INVENTORY */}
        {can("products.view") && (
          <div onMouseEnter={() => setActiveMenu("inventory")}>
            <div className={menuClass("/products")}>
              <div className="flex items-center gap-4">
                <Package size={20} />
                {isExpanded && <span>Inventory</span>}
              </div>

              {isExpanded && (
                <ChevronDown
                  size={16}
                  className={`transition ${activeMenu === "inventory" ? "rotate-180" : ""
                    }`}
                />
              )}
            </div>

            {isExpanded && activeMenu === "inventory" && (
              <div className="ml-12 border-l border-white/10 pl-4 space-y-2 text-sm mt-2">
                <Link href="/products" className={subMenuClass("/products")}>
                  Products
                </Link>
                <Link href="/categories" className={subMenuClass("/categories")}>
                  Categories
                </Link>
                <Link href="/stock" className={subMenuClass("/stock")}>
                  Stock
                </Link>
              </div>
            )}
          </div>
        )}

        {/* WORKSPACES */}
        {can("workspaces.view") && (
          <Link href="/dashboard/workspaces" className={menuClass("/workspaces")} onClick={handleNavClick}>
            <ShoppingCart size={20} />
            {isExpanded && <span>Workspace</span>}
          </Link>
        )}

        {/* PAYROLL */}
        {can("payroll.view") && (
          <Link href="/payrolls" className={menuClass("/payrolls")} onClick={handleNavClick}>
            <DollarSign size={20} />
            {isExpanded && <span>Payroll</span>}
          </Link>
        )}

        {/* SETTINGS */}
        {can("settings.view") && (
          <Link href="/settings" className={menuClass("/settings")} onClick={handleNavClick}>
            <Settings size={20} />
            {isExpanded && <span>Settings</span>}
          </Link>
        )}

      </div>

      {/* FOOTER */}
      <div className="mt-auto p-4">
        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white font-semibold">
            {user?.avatar ? (
              <img
                src={`http://localhost:8000/storage/${user.avatar}`}
                className="w-full h-full object-cover"
              />
            ) : (
              user?.name?.charAt(0)?.toUpperCase() || "U"
            )}
          </div>

          {isExpanded && (
            <div>
              <p className="text-sm text-white">{user?.name}</p>
              <p className="text-xs text-white/60">{user?.email}</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}