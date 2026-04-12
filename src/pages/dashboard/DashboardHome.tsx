import { Link } from "react-router-dom";
import { Shield, Users, Trophy } from "lucide-react";
import { getClubs, getPlayers, getTournaments } from "@/lib/store";

const DashboardHome = () => {
  const clubs = getClubs();
  const players = getPlayers();
  const tournaments = getTournaments();

  const cards = [
    { title: "Clubes", count: clubs.length, icon: Shield, url: "/dashboard/clubs", color: "text-secondary" },
    { title: "Jogadores", count: players.length, icon: Users, url: "/dashboard/players", color: "text-accent" },
    { title: "Campeonatos", count: tournaments.length, icon: Trophy, url: "/dashboard/tournaments", color: "text-secondary" },
  ];

  return (
    <div>
      <h1 className="text-5xl font-display mb-8">DASHBOARD</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map(c => (
          <Link
            key={c.title}
            to={c.url}
            className="border-2 border-border bg-card text-card-foreground p-6 hover:border-secondary transition-colors group"
          >
            <c.icon className={`w-10 h-10 ${c.color} mb-4`} />
            <p className="font-heading text-4xl text-secondary">{c.count}</p>
            <p className="font-heading text-xl tracking-wider uppercase text-muted-foreground group-hover:text-card-foreground transition-colors">
              {c.title}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DashboardHome;
