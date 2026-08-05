import Link from "next/link";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: "🏠" },
  { name: "Portfolio", path: "/portfolio", icon: "📊" },
  { name: "AI Insights", path: "/insights", icon: "🤖" },
  { name: "Operations", path: "/operations", icon: "⚙️" },
  { name: "Compliance", path: "/compliance", icon: "🛡️" },
  { name: "Settings", path: "/settings", icon: "⚙️" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-8">
        Zerodha AI
      </h1>

      <nav className="space-y-3">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-700 transition"
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}