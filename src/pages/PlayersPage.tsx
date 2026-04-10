import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { loadPlayers, addPlayer, updatePlayer, deletePlayer, loadClubs } from "@/lib/storage";
import type { Player, Club } from "@/lib/types";

const PlayersPage = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [clubId, setClubId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: "", nickname: "", clubId: "" });

  useEffect(() => {
    setPlayers(loadPlayers());
    setClubs(loadClubs());
  }, []);

  const refresh = () => { setPlayers(loadPlayers()); setClubs(loadClubs()); };

  const handleAdd = () => {
    if (!name.trim() || !clubId) return;
    addPlayer(name.trim(), clubId, nickname.trim() || undefined);
    setName(""); setNickname(""); setClubId("");
    refresh();
  };

  const handleUpdate = (id: string) => {
    if (!editData.name.trim() || !editData.clubId) return;
    updatePlayer(id, { name: editData.name.trim(), nickname: editData.nickname.trim() || undefined, clubId: editData.clubId });
    setEditingId(null);
    refresh();
  };

  const handleDelete = (id: string) => {
    if (!confirm("Remover jogador?")) return;
    deletePlayer(id);
    refresh();
  };

  const clubName = (cid: string) => clubs.find(c => c.id === cid)?.name ?? "—";

  return (
    <div>
      <h2 className="font-display text-4xl text-primary-foreground mb-8">JOGADORES</h2>

      {clubs.length === 0 ? (
        <p className="text-muted-foreground font-heading text-center py-12">
          Cadastre clubes primeiro antes de adicionar jogadores
        </p>
      ) : (
        <>
          {/* Add form */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-8">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nome"
              className="h-12 px-4 bg-card text-card-foreground border-2 border-border font-heading focus:border-secondary outline-none"
            />
            <input
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="Apelido (opcional)"
              className="h-12 px-4 bg-card text-card-foreground border-2 border-border font-heading focus:border-secondary outline-none"
            />
            <select
              value={clubId}
              onChange={e => setClubId(e.target.value)}
              className="h-12 px-4 bg-card text-card-foreground border-2 border-border font-heading focus:border-secondary outline-none"
            >
              <option value="">Selecione o clube</option>
              {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button
              onClick={handleAdd}
              className="h-12 bg-secondary text-secondary-foreground font-heading text-lg uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Adicionar
            </button>
          </div>

          {players.length === 0 ? (
            <p className="text-muted-foreground font-heading text-center py-12">Nenhum jogador cadastrado</p>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {players.map(p => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-card text-card-foreground border-2 border-border p-4 flex items-center justify-between"
                  >
                    {editingId === p.id ? (
                      <div className="flex items-center gap-2 flex-1 flex-wrap">
                        <input
                          value={editData.name}
                          onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
                          className="h-10 px-3 bg-background text-foreground border-2 border-border font-heading focus:border-secondary outline-none flex-1 min-w-[120px]"
                          autoFocus
                        />
                        <input
                          value={editData.nickname}
                          onChange={e => setEditData(d => ({ ...d, nickname: e.target.value }))}
                          placeholder="Apelido"
                          className="h-10 px-3 bg-background text-foreground border-2 border-border font-heading focus:border-secondary outline-none flex-1 min-w-[120px]"
                        />
                        <select
                          value={editData.clubId}
                          onChange={e => setEditData(d => ({ ...d, clubId: e.target.value }))}
                          className="h-10 px-3 bg-background text-foreground border-2 border-border font-heading focus:border-secondary outline-none"
                        >
                          {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <button onClick={() => handleUpdate(p.id)} className="p-2 text-secondary"><Check className="w-5 h-5" /></button>
                        <button onClick={() => setEditingId(null)} className="p-2 text-muted-foreground"><X className="w-5 h-5" /></button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <span className="font-heading text-lg">{p.name}</span>
                          {p.nickname && <span className="ml-2 text-sm text-muted-foreground">"{p.nickname}"</span>}
                          <span className="ml-3 text-xs text-secondary font-heading">{clubName(p.clubId)}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setEditingId(p.id); setEditData({ name: p.name, nickname: p.nickname || "", clubId: p.clubId }); }}
                            className="p-2 text-muted-foreground hover:text-secondary"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-2 text-muted-foreground hover:text-destructive">
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
        </>
      )}
    </div>
  );
};

export default PlayersPage;
