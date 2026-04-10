import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, Trophy, Play } from "lucide-react";
import { loadTournaments, addTournament, deleteTournament } from "@/lib/storage";
import type { TournamentMeta } from "@/lib/types";

const statusLabels: Record<TournamentMeta["status"], string> = {
  draft: "RASCUNHO",
  groups: "FASE DE GRUPOS",
  bracket: "DOUBLE ELIMINATION",
  finished: "FINALIZADO",
};

const statusColors: Record<TournamentMeta["status"], string> = {
  draft: "text-muted-foreground",
  groups: "text-secondary",
  bracket: "text-accent",
  finished: "text-secondary",
};

const TournamentsPage = () => {
  const [tournaments, setTournaments] = useState<TournamentMeta[]>([]);
  const [name, setName] = useState("");
  const [enableElim, setEnableElim] = useState(false);
  const [elimCount, setElimCount] = useState<2 | 4>(2);

  useEffect(() => { setTournaments(loadTournaments()); }, []);
  const refresh = () => setTournaments(loadTournaments());

  const handleAdd = () => {
    if (!name.trim()) return;
    addTournament({
      name: name.trim(),
      enableGroupElimination: enableElim,
      eliminationCount: elimCount,
    });
    setName("");
    refresh();
  };

  const handleDelete = (id: string) => {
    if (!confirm("Remover campeonato e todos os times?")) return;
    deleteTournament(id);
    refresh();
  };

  return (
    <div>
      <h2 className="font-display text-4xl text-primary-foreground mb-8">CAMPEONATOS</h2>

      {/* Create form */}
      <div className="bg-card text-card-foreground border-2 border-border p-6 mb-8">
        <h3 className="font-heading text-xl uppercase tracking-wider mb-4">Novo Campeonato</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nome do campeonato"
            className="h-12 px-4 bg-background text-foreground border-2 border-border font-heading focus:border-secondary outline-none"
          />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 font-heading text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={enableElim}
                onChange={e => setEnableElim(e.target.checked)}
                className="w-5 h-5"
              />
              Eliminação nos grupos
            </label>
            {enableElim && (
              <select
                value={elimCount}
                onChange={e => setElimCount(Number(e.target.value) as 2 | 4)}
                className="h-10 px-3 bg-background text-foreground border-2 border-border font-heading"
              >
                <option value={2}>Eliminar 2</option>
                <option value={4}>Eliminar 4</option>
              </select>
            )}
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="px-6 py-3 bg-secondary text-secondary-foreground font-heading text-lg uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Criar Campeonato
        </button>
      </div>

      {tournaments.length === 0 ? (
        <p className="text-muted-foreground font-heading text-center py-12">Nenhum campeonato criado</p>
      ) : (
        <div className="space-y-3">
          {tournaments.map(t => (
            <div key={t.id} className="bg-card text-card-foreground border-2 border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Trophy className="w-6 h-6" />
                <div>
                  <p className="font-heading text-lg">{t.name}</p>
                  <p className={`text-xs font-heading uppercase tracking-wider ${statusColors[t.status]}`}>
                    {statusLabels[t.status]}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/dashboard/tournaments/${t.id}`}
                  className="px-4 py-2 bg-secondary text-secondary-foreground font-heading text-sm uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
                >
                  <Play className="w-4 h-4" /> Gerenciar
                </Link>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TournamentsPage;
