import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Plus, Edit2, Trash2, X, Save, Users } from "lucide-react";
import { getClubs, addClub, updateClub, deleteClub, getPlayers, type Club } from "@/lib/store";

const ClubsPage = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const reload = () => setClubs(getClubs());
  useEffect(reload, []);

  const players = getPlayers();
  const playerCount = (clubId: string) => players.filter(p => p.clubId === clubId).length;

  const handleSubmit = () => {
    const n = name.trim();
    if (!n) return;
    if (editingId) { updateClub(editingId, n); }
    else { addClub(n); }
    setName("");
    setEditingId(null);
    reload();
  };

  const handleEdit = (club: Club) => {
    setName(club.name);
    setEditingId(club.id);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Remover clube e todos os seus jogadores?")) return;
    deleteClub(id);
    if (editingId === id) { setName(""); setEditingId(null); }
    reload();
  };

  return (
    <div>
      <h1 className="text-5xl font-display mb-6 flex items-center gap-3">
        <Shield className="w-10 h-10" /> CLUBES
      </h1>

      <div className="border-2 border-border bg-card text-card-foreground p-5 mb-8 max-w-lg">
        <h3 className="font-heading text-xl tracking-wider mb-3 uppercase">
          {editingId ? "Editar Clube" : "Novo Clube"}
        </h3>
        <div className="flex gap-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nome do clube"
            maxLength={40}
            className="flex-1 px-3 py-2 bg-background text-foreground border-2 border-border font-heading text-lg focus:border-secondary outline-none transition-colors"
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="px-4 py-2 bg-secondary text-secondary-foreground font-heading uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-40"
          >
            <Save className="w-5 h-5" />
          </button>
          {editingId && (
            <button onClick={() => { setName(""); setEditingId(null); }} className="px-3 border border-border hover:bg-card transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map((club, i) => (
            <motion.div
              key={club.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.03 }}
              className="border-2 border-border bg-card text-card-foreground p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-heading text-xl">{club.name}</h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" /> {playerCount(club.id)} jogador(es)
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(club)} className="p-2 hover:bg-secondary/20 transition-colors" title="Editar">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(club.id)} className="p-2 hover:bg-destructive/20 text-destructive transition-colors" title="Remover">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {clubs.length === 0 && (
        <p className="text-muted-foreground font-heading text-lg text-center py-12">
          Nenhum clube cadastrado. Crie o primeiro acima.
        </p>
      )}
    </div>
  );
};

export default ClubsPage;
