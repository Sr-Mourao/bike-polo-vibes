import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { NavLink } from "@/components/NavLink";
import { SidebarProvider, SidebarTrigger, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { Home, Shield, Users, Trophy, LogOut, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Clubes", url: "/dashboard/clubs", icon: Shield },
  { title: "Jogadores", url: "/dashboard/players", icon: Users },
  { title: "Campeonatos", url: "/dashboard/tournaments", icon: Trophy },
];

function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r-2 border-border">
      <SidebarContent className="bg-card text-card-foreground">
        <div className="p-4 border-b border-border">
          {!collapsed && (
            <Link to="/dashboard" className="font-display text-2xl text-secondary">BIKE POLO</Link>
          )}
        </div>

        <SidebarGroup defaultOpen>
          <SidebarGroupLabel className="font-heading text-muted-foreground tracking-wider uppercase text-xs">
            {!collapsed && "Menu"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="hover:bg-secondary/10 px-3 py-2 flex items-center gap-3 font-heading tracking-wider"
                      activeClassName="bg-secondary/20 text-secondary font-bold"
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/public"
                    className="hover:bg-secondary/10 px-3 py-2 flex items-center gap-3 font-heading tracking-wider text-muted-foreground"
                  >
                    <Eye className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>Área Pública</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <div className="mt-auto p-4 border-t border-border">
            <p className="text-sm font-heading text-muted-foreground truncate mb-2">{user?.email}</p>
            <button
              onClick={logout}
              className="w-full py-2 border border-border font-heading text-sm uppercase tracking-wider hover:bg-destructive/20 hover:text-destructive transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-primary text-primary-foreground">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b-2 border-border px-4">
            <SidebarTrigger className="mr-4" />
            <span className="font-heading text-lg tracking-wider text-muted-foreground uppercase">
              Gerenciamento
            </span>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
