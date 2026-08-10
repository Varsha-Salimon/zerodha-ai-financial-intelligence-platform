export default function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-blue-100 bg-white px-8 shadow-sm">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Dashboard
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
