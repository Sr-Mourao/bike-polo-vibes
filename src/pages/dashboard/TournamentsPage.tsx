import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Plus, Trash2, Play, Eye, Settings } from "lucide-react";
import { getTournaments, addTournament, deleteTournament, type TournamentData } from "@/lib/store";
import { Link } from "react-router-dom";

const TournamentsPage = () => {
  const [tournaments, setTournaments] = useState<TournamentData[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [enableElim, setEnableElim] = useState(false);
  const [elimCount, setElimCount] = useState<2 | 4>(2);

  const reload = () => setTournaments(getTournaments());
  useEffect(reload, []);

  const handleCreate = () => {
    const n = name.trim();
    if (!n) return;
    addTournament(n, { enableGroupElimination: enableElim, eliminationCount: elimCount });
    setName("");
    setShowCreate(false);
    reload();
  };

  const handleDelete = (id: string) => {
    if (!confirm("Remover este campeonato?")) return;
    deleteTournament(id);
    reload();
  };

  const statusLabel: Record<string, string> = {
    draft: "MONTAGEM",
    groups: "FASE DE GRUPOS",
    bracket: "DOUBLE ELIMINATION",
    finished: "FINALIZADO",
  };

  const statusColor: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    groups: "bg-secondary/20 text-secondary",
    bracket: "bg-accent/20 text-accent",
    finished: "bg-secondary text-secondary-foreground",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-5xl font-display flex items-center gap-3">
          <Trophy className="w-10 h-10" /> CAMPEONATOS
        </h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-secondary text-secondary-foreground font-heading uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Novo
        </button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-2 border-border bg-card text-card-foreground p-5 mb-8 max-w-lg overflow-hidden"
          >
            <h3 className="font-heading text-xl tracking-wider mb-4 uppercase">Criar Campeonato</h3>
            <div className="space-y-4">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nome do campeonato"
                maxLength={50}
                className="w-full px-3 py-2 bg-background text-foreground border-2 border-border font-heading text-lg focus:border-secondary outline-none transition-colors"
              />

              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setEnableElim(!enableElim)}
                  className={`w-12 h-7 rounded-full relative transition-colors ${enableElim ? "bg-secondary" : "bg-muted"}`}
                >
                  <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-primary-foreground transition-transform ${enableElim ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
                <span className="font-heading">Eliminação na fase de grupos</span>
              </label>

              {enableElim && (
                <div className="flex gap-3">
                  {([2, 4] as const).map(n => (
                    <button
                      key={n}
                      onClick={() => setElimCount(n)}
                      className={`flex-1 py-3 border-2 font-heading uppercase tracking-wider transition-colors ${
                        elimCount === n ? "border-secondary bg-secondary text-secondary-foreground" : "border-border hover:border-secondary/50"
                      }`}
                    >
                      Eliminar {n}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={handleCreate}
                disabled={!name.trim()}
                className="w-full py-3 bg-accent text-accent-foreground font-heading text-lg uppercase tracking-wider hover:bg-secondary hover:text-secondary-foreground transition-colors disabled:opacity-40"
              >
                Criar Campeonato
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tournaments.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="border-2 border-border bg-card text-card-foreground p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-heading text-2xl">{t.name}</h3>
                <span className={`inline-block mt-1 px-2 py-1 text-xs font-heading uppercase tracking-wider ${statusColor[t.status]}`}>
                  {statusLabel[t.status]}
                </span>
              </div>
              <button onClick={() => handleDelete(t.id)} className="p-2 hover:bg-destructive/20 text-destructive transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {t.teams.length} time(s) · {new Date(t.createdAt).toLocaleDateString("pt-BR")}
            </p>
            <div className="flex gap-2">
              <Link
                to={`/dashboard/tournaments/${t.id}`}
                className="flex-1 py-2 bg-secondary text-secondary-foreground font-heading text-sm uppercase tracking-wider text-center hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center gap-1"
              >
                <Settings className="w-4 h-4" /> Gerenciar
              </Link>
              <Link
                to={`/public/tournament/${t.id}`}
                className="px-4 py-2 border border-border font-heading text-sm uppercase tracking-wider hover:border-secondary transition-colors flex items-center gap-1"
              >
                <Eye className="w-4 h-4" /> Público
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {tournaments.length === 0 && !showCreate && (
        <p className="text-muted-foreground font-heading text-lg text-center py-12">
          Nenhum campeonato. Crie o primeiro!
        </p>
      )}
    </div>
  );
};

export default TournamentsPage;
