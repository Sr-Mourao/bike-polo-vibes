import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, ArrowLeft } from "lucide-react";
import type { StoredTeam, TournamentConfig as TConfig } from "@/lib/tournament";

interface TournamentConfigProps {
  teams: StoredTeam[];
  onStart: (config: TConfig) => void;
  onBack: () => void;
}

const TournamentConfig = ({ teams, onStart, onBack }: TournamentConfigProps) => {
  const [enableElimination, setEnableElimination] = useState(false);
  const [eliminationCount, setEliminationCount] = useState<2 | 4>(2);

  const qualifiedCount = enableElimination ? teams.length - eliminationCount : teams.length;
  const canEliminate4 = teams.length > 8; // need at least 5 qualified

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 font-heading text-lg text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Voltar
      </button>

      <h2 className="text-4xl font-display flex items-center gap-3">
        <Settings className="w-10 h-10" /> CONFIGURAÇÃO
      </h2>

      <div className="border-2 border-border bg-card text-card-foreground p-6 space-y-6">
        <div>
          <p className="font-heading text-xl mb-1">Times cadastrados: <span className="text-secondary font-display text-2xl">{teams.length}</span></p>
          <p className="text-sm text-muted-foreground">
            Todos os {teams.length} times jogarão a fase de grupos (todos contra todos).
          </p>
        </div>

        {/* Group elimination toggle */}
        <div className="border-t border-border pt-4">
          <label className="flex items-center gap-4 cursor-pointer">
            <div
              onClick={() => setEnableElimination(!enableElimination)}
              className={`w-14 h-8 rounded-full relative transition-colors ${
                enableElimination ? "bg-secondary" : "bg-muted"
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 rounded-full bg-primary-foreground transition-transform ${
                  enableElimination ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </div>
            <div>
              <span className="font-heading text-lg">Eliminação na Fase de Grupos</span>
              <p className="text-sm text-muted-foreground">
                Eliminar os últimos colocados antes do Double Elimination.
              </p>
            </div>
          </label>
        </div>

        {/* Elimination count */}
        {enableElimination && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="border-t border-border pt-4"
          >
            <p className="font-heading text-lg mb-3">Quantos times eliminar?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setEliminationCount(2)}
                className={`flex-1 py-4 border-2 font-heading text-xl uppercase tracking-wider transition-colors ${
                  eliminationCount === 2
                    ? "border-secondary bg-secondary text-secondary-foreground"
                    : "border-border hover:border-secondary/50"
                }`}
              >
                2 últimos
              </button>
              <button
                onClick={() => canEliminate4 && setEliminationCount(4)}
                disabled={!canEliminate4}
                className={`flex-1 py-4 border-2 font-heading text-xl uppercase tracking-wider transition-colors ${
                  eliminationCount === 4
                    ? "border-secondary bg-secondary text-secondary-foreground"
                    : "border-border hover:border-secondary/50"
                } ${!canEliminate4 ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                4 últimos
              </button>
            </div>
            {!canEliminate4 && (
              <p className="text-xs text-muted-foreground mt-2">
                Precisa de mais de 8 times para eliminar 4.
              </p>
            )}
          </motion.div>
        )}

        <div className="border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            📊 <strong>{teams.length}</strong> times na fase de grupos →{" "}
            <strong>{qualifiedCount}</strong> classificados para Double Elimination
            {enableElimination && <> · <span className="text-destructive">{eliminationCount} eliminados</span></>}
          </p>
        </div>
      </div>

      <motion.div className="text-center" whileHover={{ scale: 1.02 }}>
        <button
          onClick={() => onStart({ enableGroupElimination: enableElimination, eliminationCount })}
          className="px-10 py-6 bg-accent text-accent-foreground font-heading text-2xl md:text-4xl uppercase tracking-wider border-4 border-accent-foreground/20 hover:bg-secondary hover:text-secondary-foreground transition-colors"
        >
          Iniciar Campeonato 🏆
        </button>
      </motion.div>
    </div>
  );
};

export default TournamentConfig;
