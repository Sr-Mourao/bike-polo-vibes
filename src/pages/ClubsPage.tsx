import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { loadClubs, addClub, updateClub, deleteClub, loadPlayers } from "@/lib/storage";
import type { Club } from "@/lib/types";

const ClubsPage = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => { setClubs(loadClubs()); }, []);

  const refresh = () => setClubs(loadClubs());

  const handleAdd = () => {
    if (!newName.trim()) return;
    addClub(newName.trim());
    setNewName("");
    refresh();
  };

  const handleUpdate = (id: string) => {
    if (!editName.trim()) return;
    updateClub(id, editName.trim());
    setEditingId(null);
    refresh();
  };

  const handleDelete = (id: string) => {
    if (!confirm("Remover clube e todos os jogadores associados?")) return;
    deleteClub(id);
    refresh();
  };

  const players = loadPlayers();
  const playerCount = (clubId: string) => players.filter(p => p.clubId === clubId).length;

  return (
    <div>
      <h2 className="font-display text-4xl text-primary-foreground mb-8">CLUBES</h2>

      {/* Add form */}
      <div className="flex gap-3 mb-8">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder="Nome do clube..."
          className="flex-1 h-12 px-4 bg-card text-card-foreground border-2 border-border font-heading focus:border-secondary outline-none transition-colors"
        />
        <button
          onClick={handleAdd}
          className="px-6 h-12 bg-secondary text-secondary-foreground font-heading text-lg uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Adicionar
        </button>
      </div>

      {clubs.length === 0 ? (
        <p className="text-muted-foreground font-heading text-center py-12">Nenhum clube cadastrado</p>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {clubs.map(club => (
              <motion.div
                key={club.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-card text-card-foreground border-2 border-border p-4 flex items-center justify-between"
              >
                {editingId === club.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleUpdate(club.id)}
                      className="flex-1 h-10 px-3 bg-background text-foreground border-2 border-border font-heading focus:border-secondary outline-none"
                      autoFocus
                    />
                    <button onClick={() => handleUpdate(club.id)} className="p-2 text-secondary hover:text-accent">
                      <Check className="w-5 h-5" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-2 text-muted-foreground hover:text-card-foreground">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <span className="font-heading text-lg">{club.name}</span>
                      <span className="ml-3 text-xs text-muted-foreground font-heading">
                        {playerCount(club.id)} jogador(es)
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingId(club.id); setEditName(club.name); }}
                        className="p-2 text-muted-foreground hover:text-secondary transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(club.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ClubsPage;
