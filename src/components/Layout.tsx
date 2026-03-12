import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const navItems = [
  { to: "/account", label: "Account", icon: "👤" },
  { to: "/dogs", label: "My Dogs", icon: "🐾" },
  { to: "/deliveries", label: "Deliveries", icon: "📦" },
  { to: "/subscription", label: "Subscription", icon: "🔄" },
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

  const fullName = [person?.first_name, person?.last_name].filter(Boolean).join(" ") || person?.email || "My Account";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐾</span>
            <span className="font-bold text-gray-900 text-lg">PupChef</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">{fullName}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-800 font-medium"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Bottom nav (mobile) / Side nav (desktop) */}
      <div className="flex flex-1 max-w-3xl mx-auto w-full px-4 py-6 gap-6">
        {/* Sidebar — desktop */}
        <nav className="hidden sm:flex flex-col gap-1 w-44 shrink-0">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <span>{item.icon}</span>
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
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-xs font-medium transition ${
                isActive ? "text-orange-600" : "text-gray-500"
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
