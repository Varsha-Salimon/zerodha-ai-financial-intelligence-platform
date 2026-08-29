"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Activity,
  BriefcaseBusiness,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";


/* =========================================================
   MENU TYPES
   ========================================================= */

type MenuItem = {
  name: string;
  path: string;
  icon: typeof LayoutDashboard;
  roles: Array<"USER" | "ADMIN">;
};


/* =========================================================
   NAVIGATION
   ========================================================= */

const menuItems: MenuItem[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: ["USER", "ADMIN"],
  },
  {
    name: "Portfolio",
    path: "/portfolio",
    icon: BriefcaseBusiness,
    roles: ["USER"],
  },
  {
    name: "AI Insights",
    path: "/insights",
    icon: Sparkles,
    roles: ["USER"],
  },
  {
    name: "Operations",
    path: "/operations",
    icon: Activity,
    roles: ["ADMIN"],
  },
  {
    name: "Compliance",
    path: "/compliance",
    icon: ShieldCheck,
    roles: ["ADMIN"],
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
    roles: ["USER", "ADMIN"],
  },
];


/* =========================================================
   SIDEBAR
   ========================================================= */

export default function Sidebar() {
  const pathname = usePathname();

  const { user, isAuthenticated } =
    useAuth();

  /*
   * Only authenticated users should see the
   * application navigation.
   */
  if (!isAuthenticated) {
    return null;
  }

  const role =
    user?.role ?? "USER";


  /*
   * Filter navigation based on the authenticated
   * user's role.
   */
  const visibleMenuItems =
    menuItems.filter((item) =>
      item.roles.includes(role)
    );


  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-blue-200 bg-blue-50 p-6">

      {/* =================================================
          LOGO / BRAND
          ================================================= */}

      <div className="mb-10">

        <div className="text-2xl font-bold text-slate-900">
          Zerodha AI
        </div>

        <div className="mt-1 text-sm text-slate-500">
          Financial Intelligence
        </div>

      </div>


      {/* =================================================
          USER INFORMATION
          ================================================= */}

      <div className="mb-6 rounded-xl border border-blue-100 bg-white p-3">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
            {user?.name
              ?.charAt(0)
              .toUpperCase() ?? "U"}
          </div>

          <div className="min-w-0">

            <p className="truncate text-sm font-semibold text-slate-800">
              {user?.name ?? "User"}
            </p>

            <p className="truncate text-xs text-slate-500">
              {role}
            </p>

          </div>

        </div>

      </div>


      {/* =================================================
          NAVIGATION
          ================================================= */}

      <nav className="space-y-2">

        {visibleMenuItems.map(
          (item) => {

            const isActive =
              pathname === item.path ||
              pathname.startsWith(
                `${item.path}/`
              );

            const Icon =
              item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-600 hover:bg-white hover:text-blue-700 hover:shadow-sm"
                }`}
              >

                <Icon
                  size={19}
                  strokeWidth={
                    isActive
                      ? 2.4
                      : 2
                  }
                  className={`shrink-0 transition ${
                    isActive
                      ? "text-white"
                      : "text-slate-500 group-hover:text-blue-600"
                  }`}
                />

                <span
                  className={`font-medium ${
                    isActive
                      ? "text-white"
                      : "text-slate-700"
                  }`}
                >
                  {item.name}
                </span>

              </Link>
            );
          }
        )}

      </nav>


      {/* =================================================
          ROLE INFORMATION
          ================================================= */}

      <div className="mt-auto pt-8">

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

          <div className="flex items-center gap-2">

            <Sparkles
              size={16}
              className="text-blue-600"
            />

            <p className="text-sm font-semibold text-blue-900">
              {role === "ADMIN"
                ? "Admin Workspace"
                : "AI Financial Intelligence"}
            </p>

          </div>

          <p className="mt-2 text-xs leading-5 text-blue-700">

            {role === "ADMIN"
              ? "Monitor AI executions, compliance, and platform operations."
              : "Analyze your portfolio and understand investment opportunities."}

          </p>

        </div>

      </div>

    </aside>
  );
}