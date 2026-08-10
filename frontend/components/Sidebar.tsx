"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: "🏠",
  },
  {
    name: "Portfolio",
    path: "/portfolio",
    icon: "📊",
  },
  {
    name: "AI Insights",
    path: "/insights",
    icon: "🤖",
  },
  {
    name: "Operations",
    path: "/operations",
    icon: "⚙️",
  },
  {
    name: "Compliance",
    path: "/compliance",
    icon: "🛡️",
  },
  {
    name: "Settings",
    path: "/settings",
    icon: "⚙️",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen border-r border-blue-200 bg-blue-50 p-6">
      {/* Logo / Brand */}
      <div className="mb-10">
        <div className="text-2xl font-bold text-slate-900">
          Zerodha AI
        </div>

        <div className="mt-1 text-sm text-slate-500">
          Financial Intelligence
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className="text-lg">
                {item.icon}
              </span>

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
        })}
      </nav>

      {/* Bottom Information */}
      <div className="mt-10 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm font-semibold text-blue-900">
          AI Financial Intelligence
        </p>

        <p className="mt-1 text-xs leading-5 text-blue-700">
          Analyze your portfolio and understand
          investment opportunities.
        </p>
      </div>
    </aside>
  );
}
