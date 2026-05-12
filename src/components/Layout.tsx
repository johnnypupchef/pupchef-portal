import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Home, PawPrint, Truck, RefreshCw, User, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

type NavItem = {
  to: string;
  label: string;
  shortLabel: string;
  Icon: typeof Home;
};

const navItems: NavItem[] = [
  { to: "/account", label: "Home", shortLabel: "Home", Icon: Home },
  { to: "/dogs", label: "My Dogs", shortLabel: "Dogs", Icon: PawPrint },
  { to: "/deliveries", label: "Schedule", shortLabel: "Schedule", Icon: Truck },
  { to: "/subscription", label: "Plan", shortLabel: "Plan", Icon: RefreshCw },
  { to: "/settings", label: "You", shortLabel: "You", Icon: User },
];

export default function Layout() {
  const { person, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await api.post("/api/portal/logout");
    } catch {
      /* optional server hook */
    }
    await logout();
    navigate("/login");
  }

  const initials =
    [person?.first_name?.[0], person?.last_name?.[0]].filter(Boolean).join("").toUpperCase() || "?";
  const fullName =
    [person?.first_name, person?.last_name].filter(Boolean).join(" ") || person?.email || "";

  return (
    <div className="min-h-screen cream-paper flex flex-col">
      {/* Desktop layout: sidebar + content (≥sm) */}
      <div className="hidden sm:flex flex-1 max-w-5xl mx-auto w-full px-6 py-8 gap-8">
        <aside className="w-56 shrink-0 flex flex-col gap-2">
          <div className="px-3 pb-6 flex items-center gap-3">
            <img src="/logo.png" alt="PupChef" className="h-8 w-auto" />
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                end
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2.5 rounded-[14px] transition-colors ${
                    isActive
                      ? "bg-cream text-forest"
                      : "text-ink-muted hover:bg-cream-light hover:text-forest"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`flex items-center justify-center rounded-[12px] ${
                        isActive ? "bg-white/60" : "bg-transparent"
                      }`}
                      style={{ width: 32, height: 32 }}
                    >
                      <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                    </span>
                    <span
                      className="text-sm"
                      style={{ fontWeight: isActive ? 700 : 500 }}
                    >
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto px-3 pt-6 border-t border-line-soft">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="rounded-full bg-forest text-white flex items-center justify-center"
                style={{ width: 36, height: 36 }}
              >
                <span style={{ fontSize: 12, fontWeight: 700 }}>{initials}</span>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-ink truncate">{fullName}</div>
                <div className="text-xs text-ink-muted truncate">{person?.email}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs text-ink-muted hover:text-terracotta transition-colors"
            >
              <LogOut size={14} strokeWidth={1.8} />
              Sign out
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile layout: full-bleed content + bottom tab bar (<sm) */}
      <main
        className="sm:hidden flex-1"
        style={{ paddingBottom: "calc(72px + env(safe-area-inset-bottom, 0px))" }}
      >
        <Outlet />
      </main>

      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-30"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderTop: "1px solid var(--line)",
          padding: "10px 12px calc(24px + env(safe-area-inset-bottom, 0px))",
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        {navItems.map(({ to, shortLabel, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className="flex-1"
            style={{ textDecoration: "none" }}
          >
            {({ isActive }) => (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  padding: "6px 4px",
                  color: isActive ? "var(--forest)" : "var(--ink-faint)",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 26,
                    borderRadius: 12,
                    background: isActive ? "var(--cream)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.18s",
                  }}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: "0.02em",
                  }}
                >
                  {shortLabel}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
