import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import DoubleEliminationPage from "./pages/DoubleElimination";
import DashboardHome from "./pages/dashboard/DashboardHome";
import ClubsPage from "./pages/dashboard/ClubsPage";
import PlayersPage from "./pages/dashboard/PlayersPage";
import TournamentsPage from "./pages/dashboard/TournamentsPage";
import TournamentDetail from "./pages/dashboard/TournamentDetail";
import PublicHome from "./pages/public/PublicHome";
import PublicTournament from "./pages/public/PublicTournament";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/double_elimination" element={<DoubleEliminationPage />} />

            {/* Public area */}
            <Route path="/public" element={<PublicHome />} />
            <Route path="/public/tournament/:id" element={<PublicTournament />} />

            {/* Private area */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<DashboardHome />} />
              <Route path="clubs" element={<ClubsPage />} />
              <Route path="players" element={<PlayersPage />} />
              <Route path="tournaments" element={<TournamentsPage />} />
              <Route path="tournaments/:id" element={<TournamentDetail />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
