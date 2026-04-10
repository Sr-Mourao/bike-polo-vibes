import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Users, Trophy, LayoutDashboard, LogOut, Menu, X } from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/dashboard/clubs", icon: Building2, label: "Clubes" },
  { to: "/dashboard/players", icon: Users, label: "Jogadores" },
  { to: "/dashboard/tournaments", icon: Trophy, label: "Campeonatos" },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string, end?: boolean) =>
    end ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-primary flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-card text-card-foreground border-r-4 border-border
        transform transition-transform lg:transform-none
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="p-6 border-b-2 border-border">
          <Link to="/" className="font-display text-2xl hover:text-secondary transition-colors">
            🚲 BIKE POLO
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 font-heading text-lg uppercase tracking-wider transition-colors
                ${isActive(item.to, item.end)
                  ? "bg-secondary text-secondary-foreground"
                  : "text-card-foreground hover:bg-secondary/20"
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t-2 border-border">
          <div className="text-xs text-muted-foreground font-heading mb-2 truncate">
            {user?.email}
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 font-heading text-sm uppercase tracking-wider text-destructive hover:bg-destructive/10 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b-4 border-border bg-card text-card-foreground flex items-center px-4 gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-card-foreground"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h1 className="font-display text-xl">PAINEL DE CONTROLE</h1>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
