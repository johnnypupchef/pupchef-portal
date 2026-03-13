import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const navItems = [
  { to: "/account", label: "Overview", icon: "🏠" },
  { to: "/dogs", label: "My Dogs", icon: "🐾" },
  { to: "/deliveries", label: "Deliveries", icon: "📦" },
  { to: "/subscription", label: "Plan", icon: "🔄" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Layout() {
  const { person, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try { await api.post("/api/portal/logout"); } catch {}
    logout();
    navigate("/login");
  }

  const initials = [person?.first_name?.[0], person?.last_name?.[0]].filter(Boolean).join("").toUpperCase() || "?";
  const fullName = [person?.first_name, person?.last_name].filter(Boolean).join(" ") || person?.email || "";

  return (
    <div className="min-h-screen bg-cream flex flex-col pb-16 sm:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-cream-dark sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <img src="/logo.png" alt="PupChef" className="h-7 w-auto" />

          {/* Right: user + signout */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-brand/60 font-body">{fullName}</span>
            <div className="w-8 h-8 bg-forest rounded-full flex items-center justify-center">
              <span className="text-xs font-heading font-bold text-white">{initials}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-brand/50 hover:text-brand font-body transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Content + sidebar */}
      <div className="flex flex-1 max-w-4xl mx-auto w-full px-4 py-6 gap-8">
        {/* Sidebar — desktop */}
        <nav className="hidden sm:flex flex-col gap-1 w-48 shrink-0 pt-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-body font-medium transition-colors ${
                  isActive
                    ? "bg-forest text-white"
                    : "text-brand/70 hover:bg-cream-dark hover:text-brand"
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav — mobile */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-cream-dark flex z-10">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2.5 text-xs font-body font-medium transition-colors ${
                isActive ? "text-coral" : "text-brand/40"
              }`
            }
          >
            <span className="text-lg mb-0.5">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
