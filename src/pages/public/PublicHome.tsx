import { Link } from "react-router-dom";
import { getTournaments, type TournamentData } from "@/lib/store";
import { Trophy, Eye } from "lucide-react";

const PublicHome = () => {
  const tournaments = getTournaments();

  return (
    <div className="min-h-screen bg-primary text-primary-foreground">
      <header className="border-b-4 border-secondary">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-display text-3xl hover:text-secondary transition-colors">BIKE POLO</Link>
          <Link to="/login" className="font-heading text-sm uppercase tracking-wider text-muted-foreground hover:text-secondary transition-colors">
            Login →
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-10">
        <h1 className="text-5xl font-display mb-8 flex items-center gap-3">
          <Trophy className="w-10 h-10" /> CAMPEONATOS
        </h1>

        {tournaments.length === 0 ? (
          <p className="text-muted-foreground font-heading text-xl text-center py-16">
            Nenhum campeonato disponível ainda.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournaments.map(t => (
              <Link
                key={t.id}
                to={`/public/tournament/${t.id}`}
                className="border-2 border-border bg-card text-card-foreground p-5 hover:border-secondary transition-colors group"
              >
                <h3 className="font-heading text-2xl mb-2 group-hover:text-secondary transition-colors">{t.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.teams.length} times · {t.status === "finished" ? "Finalizado" : t.status === "bracket" ? "Double Elimination" : t.status === "groups" ? "Fase de Grupos" : "Em montagem"}
                </p>
                <div className="mt-3 flex items-center gap-1 text-secondary font-heading text-sm uppercase tracking-wider">
                  <Eye className="w-4 h-4" /> Ver detalhes
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicHome;
