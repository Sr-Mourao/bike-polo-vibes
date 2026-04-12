import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { type AuthUser, getAuthUser, setAuthUser } from "@/lib/store";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => boolean;
  loginWithGoogle: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getAuthUser());
    setLoading(false);
  }, []);

  const login = (email: string, _password: string): boolean => {
    if (!email) return false;
    const u: AuthUser = {
      id: crypto.randomUUID(),
      email,
      name: email.split("@")[0],
      provider: "email",
    };
    setAuthUser(u);
    setUser(u);
    return true;
  };

  const loginWithGoogle = () => {
    const u: AuthUser = {
      id: crypto.randomUUID(),
      email: "usuario@gmail.com",
      name: "Usuário Google",
      provider: "google",
    };
    setAuthUser(u);
    setUser(u);
  };

  const logout = () => {
    setAuthUser(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
