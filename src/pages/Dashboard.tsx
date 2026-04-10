import { Link } from "react-router-dom";
import { Building2, Users, Trophy } from "lucide-react";
import { loadClubs, loadPlayers, loadTournaments } from "@/lib/storage";

const Dashboard = () => {
  const clubs = loadClubs();
  const players = loadPlayers();
  const tournaments = loadTournaments();

  const cards = [
    { to: "/dashboard/clubs", icon: Building2, label: "Clubes", count: clubs.length, color: "bg-secondary" },
    { to: "/dashboard/players", icon: Users, label: "Jogadores", count: players.length, color: "bg-accent" },
    { to: "/dashboard/tournaments", icon: Trophy, label: "Campeonatos", count: tournaments.length, color: "bg-secondary" },
  ];

  return (
    <div>
      <h2 className="font-display text-4xl text-primary-foreground mb-8">VISÃO GERAL</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {cards.map(c => (
          <Link
            key={c.to}
            to={c.to}
            className="bg-card text-card-foreground border-4 border-border p-6 hover:border-secondary transition-colors group"
          >
            <c.icon className="w-8 h-8 mb-3 group-hover:text-secondary transition-colors" />
            <p className="font-heading text-xl uppercase tracking-wider">{c.label}</p>
            <p className="font-display text-5xl mt-2">{c.count}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 bg-card text-card-foreground border-4 border-border p-6">
        <h3 className="font-heading text-xl uppercase tracking-wider mb-4">Área Pública</h3>
        <p className="text-muted-foreground text-sm mb-3">
          Resultados e brackets são visíveis publicamente em:
        </p>
        <Link to="/public" className="text-secondary font-heading text-lg hover:underline">
          /public →
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
