import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Edit2, Trash2, X, Save, Shield } from "lucide-react";
import { getPlayers, getClubs, addPlayer, updatePlayer, deletePlayer, type Player, type Club } from "@/lib/store";

const PlayersPage = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [clubId, setClubId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const reload = () => { setPlayers(getPlayers()); setClubs(getClubs()); };
  useEffect(reload, []);

  const clubName = (id: string) => clubs.find(c => c.id === id)?.name ?? "—";

  const handleSubmit = () => {
    const n = name.trim();
    if (!n || !clubId) return;
    if (editingId) { updatePlayer(editingId, { name: n, nickname: nickname.trim() || undefined, clubId }); }
    else { addPlayer(n, clubId, nickname.trim() || undefined); }
    resetForm();
    reload();
  };

  const resetForm = () => { setName(""); setNickname(""); setClubId(""); setEditingId(null); };

  const handleEdit = (p: Player) => {
    setName(p.name);
    setNickname(p.nickname || "");
    setClubId(p.clubId);
    setEditingId(p.id);
  };

  const handleDelete = (id: string) => {
    deletePlayer(id);
    if (editingId === id) resetForm();
    reload();
  };

  return (
    <div>
      <h1 className="text-5xl font-display mb-6 flex items-center gap-3">
        <Users className="w-10 h-10" /> JOGADORES
      </h1>

      {clubs.length === 0 ? (
        <div className="border-2 border-border bg-card text-card-foreground p-8 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="font-heading text-xl text-muted-foreground">Cadastre pelo menos um clube antes de adicionar jogadores.</p>
        </div>
      ) : (
        <div className="border-2 border-border bg-card text-card-foreground p-5 mb-8 max-w-lg">
          <h3 className="font-heading text-xl tracking-wider mb-3 uppercase">
            {editingId ? "Editar Jogador" : "Novo Jogador"}
          </h3>
          <div className="space-y-3">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nome"
              maxLength={30}
              className="w-full px-3 py-2 bg-background text-foreground border-2 border-border font-heading text-lg focus:border-secondary outline-none transition-colors"
            />
            <input
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="Apelido (opcional)"
              maxLength={20}
              className="w-full px-3 py-2 bg-background text-foreground border-2 border-border font-heading focus:border-secondary outline-none transition-colors"
            />
            <select
              value={clubId}
              onChange={e => setClubId(e.target.value)}
              className="w-full px-3 py-2 bg-background text-foreground border-2 border-border font-heading focus:border-secondary outline-none transition-colors"
            >
              <option value="">Selecione um clube</option>
              {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={!name.trim() || !clubId}
                className="flex-1 py-3 bg-secondary text-secondary-foreground font-heading text-lg uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" /> {editingId ? "Salvar" : "Adicionar"}
              </button>
              {editingId && (
                <button onClick={resetForm} className="px-4 border border-border hover:bg-card transition-colors font-heading uppercase tracking-wider">
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {players.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.02 }}
              className="border-2 border-border bg-card text-card-foreground p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-heading text-lg">{p.name}</h4>
                  {p.nickname && <p className="text-sm text-accent font-heading">"{p.nickname}"</p>}
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Shield className="w-3 h-3" /> {clubName(p.clubId)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(p)} className="p-2 hover:bg-secondary/20 transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-destructive/20 text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {players.length === 0 && clubs.length > 0 && (
        <p className="text-muted-foreground font-heading text-lg text-center py-12">
          Nenhum jogador cadastrado.
        </p>
      )}
    </div>
  );
};

export default PlayersPage;
