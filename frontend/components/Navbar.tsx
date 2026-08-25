"use client";

import { usePathname } from "next/navigation";

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

  const pageTitle = pageTitles[pathname] ?? "Dashboard";

  return (
    <header className="flex h-16 items-center justify-between border-b border-blue-100 bg-white px-8 shadow-sm">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          {pageTitle}
        </h2>
      </div>

      {/* User Greeting */}
      <div className="flex items-center gap-3">
        <div className="hidden text-sm text-slate-500 sm:block">
          Welcome, User 👋
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
          U
        </div>
      </div>
    </header>
  );
}