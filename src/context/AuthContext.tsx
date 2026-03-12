import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getToken, clearToken, setToken } from "../lib/api";

interface AuthPerson {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
}

interface AuthContextType {
  person: AuthPerson | null;
  token: string | null;
  login: (token: string, person: AuthPerson) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [person, setPerson] = useState<AuthPerson | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = getToken();
    if (!t) { setLoading(false); return; }

    fetch(`${import.meta.env.VITE_API_URL ?? "https://pup-ops.vercel.app"}/api/portal/me`, {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { person: AuthPerson }) => { setPerson(d.person); setTokenState(t); })
      .catch(() => { clearToken(); setTokenState(null); })
      .finally(() => setLoading(false));
  }, []);

  function login(t: string, p: AuthPerson) {
    setToken(t);
    setTokenState(t);
    setPerson(p);
  }

  function logout() {
    clearToken();
    setTokenState(null);
    setPerson(null);
  }

  return (
    <AuthContext.Provider value={{ person, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
