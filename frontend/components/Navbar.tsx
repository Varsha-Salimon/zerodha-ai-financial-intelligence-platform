"use client";

import { usePathname } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/dashboard": "Dashboard",
  "/portfolio": "Portfolio",
  "/insights": "AI Insights",
  "/operations": "Operations",
  "/compliance": "Compliance",
  "/settings": "Settings",
};

export default function Navbar() {
  const pathname = usePathname();

  const { user, isAuthenticated, logout } =
    useAuth();

  const pageTitle =
    pageTitles[pathname] ?? "Dashboard";

  /*
   * Display the authenticated user's information.
   *
   * During the initial render, the context may not
   * have loaded the user yet, so safe fallback values
   * are used.
   */
  const displayName =
    user?.name ?? "User";

  const role =
    user?.role ?? "USER";

  const initial =
    displayName.charAt(0).toUpperCase() || "U";

  function handleLogout() {
    logout();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-blue-100 bg-white px-8 shadow-sm">

      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          {pageTitle}
        </h2>
      </div>

      {/* User Information */}
      <div className="flex items-center gap-4">

        <div className="text-right">
          <div className="text-sm font-medium text-slate-700">
            Welcome, {displayName} 👋
          </div>

          <div className="text-xs font-semibold text-blue-600">
            {role}
          </div>
        </div>

        {/* Avatar */}
        <div
          title={
            user
              ? `${user.name} (${user.role})`
              : "User"
          }
          className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700"
        >
          {initial}
        </div>

        {/* Logout */}
        {isAuthenticated && (
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            Logout
          </button>
        )}

      </div>
    </header>
  );
}