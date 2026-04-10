import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  method: "email" | "google" | "facebook";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  loginWithProvider: (provider: "google" | "facebook") => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_KEY = "bp_auth_user";

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveUser(user: User | null) {
  if (user) localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  else localStorage.removeItem(AUTH_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser);

  const login = useCallback((email: string, _password: string) => {
    const u: User = {
      id: crypto.randomUUID(),
      name: email.split("@")[0],
      email,
      method: "email",
    };
    setUser(u);
    saveUser(u);
    return true;
  }, []);

  const loginWithProvider = useCallback((provider: "google" | "facebook") => {
    const u: User = {
      id: crypto.randomUUID(),
      name: provider === "google" ? "Usuário Google" : "Usuário Facebook",
      email: `user@${provider}.com`,
      method: provider,
    };
    setUser(u);
    saveUser(u);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    saveUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, loginWithProvider, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
