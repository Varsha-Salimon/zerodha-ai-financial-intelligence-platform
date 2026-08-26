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

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Portfolio",
    path: "/portfolio",
    icon: BriefcaseBusiness,
  },
  {
    name: "AI Insights",
    path: "/insights",
    icon: Sparkles,
  },
  {
    name: "Operations",
    path: "/operations",
    icon: Activity,
  },
  {
    name: "Compliance",
    path: "/compliance",
    icon: ShieldCheck,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="min-h-screen w-64 border-r border-blue-200 bg-blue-50 p-6">

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
          const isActive =
            pathname === item.path;

          const Icon = item.icon;

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
                strokeWidth={isActive ? 2.4 : 2}
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
        })}

      </nav>

      {/* Bottom Information */}

      <div className="mt-10 rounded-xl border border-blue-100 bg-blue-50 p-4">

        <div className="flex items-center gap-2">

          <Sparkles
            size={16}
            className="text-blue-600"
          />

          <p className="text-sm font-semibold text-blue-900">
            AI Financial Intelligence
          </p>

        </div>

        <p className="mt-2 text-xs leading-5 text-blue-700">
          Analyze your portfolio and understand
          investment opportunities.
        </p>

      </div>

    </aside>
  );
}