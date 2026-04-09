import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Edit2, Plus, Users, Save, X } from "lucide-react";
import {
  type StoredTeam,
  loadTeamsFromStorage,
  saveTeamsToStorage,
} from "@/lib/tournament";

interface TeamRegistrationProps {
  onStartTournament: (teams: StoredTeam[]) => void;
}

const TeamRegistration = ({ onStartTournament }: TeamRegistrationProps) => {
  const [teams, setTeams] = useState<StoredTeam[]>([]);
  const [teamName, setTeamName] = useState("");
  const [players, setPlayers] = useState(["", "", ""]);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    setTeams(loadTeamsFromStorage());
  }, []);

  const save = (updated: StoredTeam[]) => {
    setTeams(updated);
    saveTeamsToStorage(updated);
  };

  const resetForm = () => {
    setTeamName("");
    setPlayers(["", "", ""]);
    setEditingId(null);
  };

  const handleAddPlayer = () => {
    if (players.length < 4) setPlayers([...players, ""]);
  };

  const handleRemovePlayer = (i: number) => {
    if (players.length > 3) setPlayers(players.filter((_, idx) => idx !== i));
  };

  const handlePlayerChange = (i: number, val: string) => {
    const p = [...players];
    p[i] = val;
    setPlayers(p);
  };

  const handleSubmit = () => {
    const name = teamName.trim();
    const validPlayers = players.map(p => p.trim()).filter(Boolean);
    if (!name || validPlayers.length < 3) return;

    if (editingId !== null) {
      save(teams.map(t => t.id === editingId ? { ...t, name, players: validPlayers } : t));
    } else {
      if (teams.length >= 20) return;
      const newId = teams.length > 0 ? Math.max(...teams.map(t => t.id)) + 1 : 1;
      save([...teams, { id: newId, name, players: validPlayers }]);
    }
    resetForm();
  };

  const handleEdit = (team: StoredTeam) => {
    setTeamName(team.name);
    setPlayers([...team.players, ...Array(4 - team.players.length).fill("")].slice(0, Math.max(team.players.length, 3)));
    setEditingId(team.id);
  };

  const handleDelete = (id: number) => {
    save(teams.filter(t => t.id !== id));
    if (editingId === id) resetForm();
  };

  const canStart = teams.length >= 8 && teams.length <= 20;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-3xl font-display mb-4 flex items-center gap-3">
          <Users className="w-8 h-8" /> CADASTRO DE TIMES
        </h2>
        <p className="text-muted-foreground font-heading mb-6">
          Cadastre entre 8 e 20 times. Cada time precisa de 3 a 4 jogadores. ({teams.length}/20)
        </p>

        {/* Form */}
        <div className="border-2 border-border bg-card text-card-foreground p-5 mb-6">
          <h3 className="font-heading text-xl tracking-wider mb-4 uppercase">
            {editingId ? "Editar Time" : "Novo Time"}
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-heading text-muted-foreground uppercase tracking-wider">Nome do Time</label>
              <input
                type="text"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                placeholder="Ex: Pedal Fury"
                className="w-full mt-1 px-3 py-2 bg-background text-foreground border-2 border-border font-heading text-lg focus:border-secondary outline-none transition-colors"
                maxLength={30}
              />
            </div>
            <div>
              <label className="text-sm font-heading text-muted-foreground uppercase tracking-wider">
                Jogadores ({players.filter(p => p.trim()).length}/4)
              </label>
              <div className="space-y-2 mt-1">
                {players.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={p}
                      onChange={e => handlePlayerChange(i, e.target.value)}
                      placeholder={`Jogador ${i + 1}`}
                      className="flex-1 px-3 py-2 bg-background text-foreground border-2 border-border font-heading focus:border-secondary outline-none transition-colors"
                      maxLength={25}
                    />
                    {players.length > 3 && (
                      <button
                        onClick={() => handleRemovePlayer(i)}
                        className="px-3 text-destructive hover:bg-destructive/10 border-2 border-border transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {players.length < 4 && (
                <button
                  onClick={handleAddPlayer}
                  className="mt-2 text-sm font-heading text-secondary hover:text-accent transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Adicionar Jogador
                </button>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSubmit}
                disabled={!teamName.trim() || players.filter(p => p.trim()).length < 3}
                className="flex-1 py-3 bg-secondary text-secondary-foreground font-heading text-lg uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {editingId ? "Salvar" : "Adicionar"}
              </button>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="px-6 py-3 border-2 border-border font-heading text-lg uppercase tracking-wider hover:bg-card transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Team List */}
        <AnimatePresence>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {teams.map((team, i) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.02 }}
                className="border-2 border-border bg-card text-card-foreground p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-display text-lg text-secondary">#{i + 1}</span>
                    <h4 className="font-heading text-xl">{team.name}</h4>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(team)}
                      className="p-2 hover:bg-secondary/20 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(team.id)}
                      className="p-2 hover:bg-destructive/20 text-destructive transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{team.players.join(", ")}</p>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {teams.length > 0 && teams.length < 8 && (
          <p className="text-sm text-destructive font-heading mt-4">
            ⚠ Cadastre pelo menos {8 - teams.length} time(s) a mais para iniciar.
          </p>
        )}
      </section>

      {/* Start button */}
      {canStart && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <button
            onClick={() => onStartTournament(teams)}
            className="px-10 py-6 bg-secondary text-secondary-foreground font-heading text-2xl md:text-4xl uppercase tracking-wider border-4 border-secondary-foreground/20 hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Configurar Campeonato →
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default TeamRegistration;
