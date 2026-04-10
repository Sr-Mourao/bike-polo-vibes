import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Zap, ArrowLeft } from "lucide-react";
import {
  loadTournaments, updateTournament,
  loadPlayers, loadClubs,
  getTeamsForTournament, addTournamentTeam, deleteTournamentTeam,
  saveTournamentState, loadTournamentState,
} from "@/lib/storage";
import type { TournamentMeta, TournamentTeam, Player, Club } from "@/lib/types";
import {
  type Team, type Tournament,
  initTournament, submitGroupResult, startDoubleElimination, selectWinnerWithScore,
  type TournamentConfig as TConfig, type GroupMatch, type Match,
} from "@/lib/tournament";
import DEMatchCard from "@/components/DEMatchCard";

type Phase = "teams" | "groups" | "bracket";

const TournamentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [meta, setMeta] = useState<TournamentMeta | null>(null);
  const [tournamentTeams, setTournamentTeams] = useState<TournamentTeam[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [allClubs, setAllClubs] = useState<Club[]>([]);
  const [phase, setPhase] = useState<Phase>("teams");

  // Team creation
  const [teamName, setTeamName] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  // Tournament state
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [scores, setScores] = useState<Record<string, { a: string; b: string; gg: "a" | "b" | null }>>({});

  const refresh = useCallback(() => {
    if (!id) return;
    const t = loadTournaments().find(t => t.id === id);
    setMeta(t || null);
    setTournamentTeams(getTeamsForTournament(id));
    setAllPlayers(loadPlayers());
    setAllClubs(loadClubs());

    if (t) {
      if (t.status === "groups" || t.status === "bracket" || t.status === "finished") {
        const saved = loadTournamentState(id) as Tournament | null;
        if (saved) {
          setTournament(saved);
          setPhase(saved.upperBracket.length > 0 ? "bracket" : "groups");
        }
      }
    }
  }, [id]);

  useEffect(() => { refresh(); }, [refresh]);

  // Save tournament state when it changes
  useEffect(() => {
    if (tournament && id) saveTournamentState(id, tournament);
  }, [tournament, id]);

  if (!meta) return <p className="text-center py-12 font-heading text-muted-foreground">Campeonato não encontrado</p>;

  const handleAddTeam = () => {
    if (!id || !teamName.trim() || selectedPlayers.length < 3 || selectedPlayers.length > 4) return;
    addTournamentTeam(id, teamName.trim(), selectedPlayers);
    setTeamName("");
    setSelectedPlayers([]);
    refresh();
  };

  const handleDeleteTeam = (teamId: string) => {
    deleteTournamentTeam(teamId);
    refresh();
  };

  const togglePlayer = (playerId: string) => {
    setSelectedPlayers(prev =>
      prev.includes(playerId) ? prev.filter(p => p !== playerId) : prev.length < 4 ? [...prev, playerId] : prev
    );
  };

  const handleStartGroups = () => {
    if (!id || tournamentTeams.length < 8 || tournamentTeams.length > 20) return;
    const teams: Team[] = tournamentTeams.map((tt, i) => ({
      id: i + 1,
      name: tt.name,
      players: tt.playerIds.map(pid => {
        const p = allPlayers.find(pl => pl.id === pid);
        return { name: p ? (p.nickname || p.name) : "?" };
      }),
      losses: 0,
      eliminated: false,
      seed: i + 1,
    }));

    const config: TConfig = {
      enableGroupElimination: meta.enableGroupElimination,
      eliminationCount: meta.eliminationCount,
    };

    const t = initTournament(teams, config);
    setTournament(t);
    setPhase("groups");
    updateTournament(id, { status: "groups" });
    refresh();
  };

  const handleScoreChange = (matchId: string, side: "a" | "b", value: string) => {
    setScores(prev => ({ ...prev, [matchId]: { ...prev[matchId], gg: prev[matchId]?.gg ?? null, [side]: value } }));
  };

  const handleGoldenGoalChange = (matchId: string, side: "a" | "b" | null) => {
    setScores(prev => ({ ...prev, [matchId]: { ...prev[matchId], a: prev[matchId]?.a ?? "", b: prev[matchId]?.b ?? "", gg: side } }));
  };

  const handleSubmitGroup = (matchId: string) => {
    if (!tournament) return;
    const s = scores[matchId];
    if (!s || s.a === "" || s.b === "") return;
    const a = parseInt(s.a), b = parseInt(s.b);
    if (isNaN(a) || isNaN(b) || a < 0 || b < 0) return;
    setTournament(submitGroupResult(tournament, matchId, a, b, s.gg));
  };

  const handleStartDE = () => {
    if (!tournament || !id) return;
    const t = startDoubleElimination(tournament);
    setTournament(t);
    setPhase("bracket");
    updateTournament(id, { status: "bracket" });
  };

  const handleSubmitDEResult = (matchId: string, winnerId: number, scoreA: number, scoreB: number, goldenGoal?: "a" | "b" | null) => {
    if (!tournament) return;
    const t = selectWinnerWithScore(tournament, matchId, winnerId, scoreA, scoreB, goldenGoal);
    setTournament(t);
    if (t.champion && id) updateTournament(id, { status: "finished" });
  };

  const clubName = (playerId: string) => {
    const p = allPlayers.find(pl => pl.id === playerId);
    if (!p) return "";
    return allClubs.find(c => c.id === p.clubId)?.name || "";
  };

  const playerName = (playerId: string) => {
    const p = allPlayers.find(pl => pl.id === playerId);
    return p ? (p.nickname ? `${p.name} "${p.nickname}"` : p.name) : "?";
  };

  // Already assigned player IDs
  const assignedPlayerIds = new Set(tournamentTeams.flatMap(t => t.playerIds));

  return (
    <div>
      <Link to="/dashboard/tournaments" className="inline-flex items-center gap-2 text-muted-foreground hover:text-card-foreground font-heading mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <h2 className="font-display text-4xl text-primary-foreground mb-2">{meta.name}</h2>
      <p className="text-sm text-muted-foreground font-heading mb-8 uppercase tracking-wider">
        {meta.enableGroupElimination ? `Elimina ${meta.eliminationCount} na fase de grupos` : "Sem eliminação nos grupos"}
      </p>

      {/* Phase: Teams */}
      {phase === "teams" && (
        <>
          <div className="bg-card text-card-foreground border-2 border-border p-6 mb-6">
            <h3 className="font-heading text-xl uppercase tracking-wider mb-4">
              Montar Time ({tournamentTeams.length}/8-20)
            </h3>
            <input
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              placeholder="Nome do time"
              className="w-full h-12 px-4 bg-background text-foreground border-2 border-border font-heading focus:border-secondary outline-none mb-4"
            />

            <p className="font-heading text-sm text-muted-foreground mb-2 uppercase">
              Selecione 3-4 jogadores ({selectedPlayers.length} selecionados)
            </p>

            {allPlayers.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Cadastre jogadores primeiro em <Link to="/dashboard/players" className="text-secondary underline">Jogadores</Link>
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4 max-h-60 overflow-y-auto">
                {allPlayers.map(p => {
                  const assigned = assignedPlayerIds.has(p.id) && !selectedPlayers.includes(p.id);
                  const selected = selectedPlayers.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      disabled={assigned}
                      onClick={() => togglePlayer(p.id)}
                      className={`p-2 border text-left text-sm font-heading transition-colors ${
                        selected
                          ? "bg-secondary text-secondary-foreground border-secondary"
                          : assigned
                          ? "opacity-30 border-border cursor-not-allowed"
                          : "border-border hover:border-secondary"
                      }`}
                    >
                      <span>{p.nickname || p.name}</span>
                      <span className="block text-xs text-muted-foreground">{clubName(p.id)}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <button
              onClick={handleAddTeam}
              disabled={!teamName.trim() || selectedPlayers.length < 3 || selectedPlayers.length > 4}
              className="px-6 py-3 bg-secondary text-secondary-foreground font-heading text-lg uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Adicionar Time
            </button>
          </div>

          {/* Team list */}
          {tournamentTeams.length > 0 && (
            <div className="space-y-2 mb-8">
              <h3 className="font-heading text-xl uppercase tracking-wider text-primary-foreground mb-4">
                Times ({tournamentTeams.length})
              </h3>
              {tournamentTeams.map(tt => (
                <div key={tt.id} className="bg-card text-card-foreground border-2 border-border p-4 flex items-center justify-between">
                  <div>
                    <span className="font-heading text-lg">{tt.name}</span>
                    <span className="ml-3 text-xs text-muted-foreground">
                      {tt.playerIds.map(pid => playerName(pid)).join(", ")}
                    </span>
                  </div>
                  <button onClick={() => handleDeleteTeam(tt.id)} className="p-2 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {tournamentTeams.length >= 8 && (
            <div className="text-center">
              <button
                onClick={handleStartGroups}
                className="px-10 py-5 bg-accent text-accent-foreground font-heading text-2xl uppercase tracking-wider hover:bg-secondary hover:text-secondary-foreground transition-colors"
              >
                Iniciar Fase de Grupos →
              </button>
            </div>
          )}
        </>
      )}

      {/* Phase: Groups */}
      {phase === "groups" && tournament && (
        <GroupPhaseInline
          tournament={tournament}
          scores={scores}
          onScoreChange={handleScoreChange}
          onGoldenGoalChange={handleGoldenGoalChange}
          onSubmit={handleSubmitGroup}
          onStartDE={handleStartDE}
        />
      )}

      {/* Phase: Bracket */}
      {phase === "bracket" && tournament && (
        <DEPhaseInline tournament={tournament} onSubmitResult={handleSubmitDEResult} />
      )}
    </div>
  );
};

/* ─── Group Phase (inline) ─── */
function GroupPhaseInline({
  tournament, scores, onScoreChange, onGoldenGoalChange, onSubmit, onStartDE,
}: {
  tournament: Tournament;
  scores: Record<string, { a: string; b: string; gg: "a" | "b" | null }>;
  onScoreChange: (id: string, side: "a" | "b", val: string) => void;
  onGoldenGoalChange: (id: string, side: "a" | "b" | null) => void;
  onSubmit: (id: string) => void;
  onStartDE: () => void;
}) {
  const pendingMatches = tournament.groupMatches.filter(m => !m.played);
  const playedMatches = tournament.groupMatches.filter(m => m.played);

  return (
    <>
      {/* Standings */}
      <section className="mb-10">
        <h3 className="font-display text-3xl text-primary-foreground mb-4">CLASSIFICAÇÃO</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-2 border-border">
            <thead>
              <tr className="bg-card text-card-foreground font-heading text-base tracking-wider">
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Time</th>
                <th className="p-2 text-center">J</th>
                <th className="p-2 text-center">V</th>
                <th className="p-2 text-center">E</th>
                <th className="p-2 text-center">D</th>
                <th className="p-2 text-center">GP</th>
                <th className="p-2 text-center">GC</th>
                <th className="p-2 text-center">SG</th>
                <th className="p-2 text-center">PTS</th>
              </tr>
            </thead>
            <tbody>
              {tournament.standings.map((s, i) => {
                const eliminated = tournament.config.enableGroupElimination &&
                  i >= tournament.standings.length - tournament.config.eliminationCount;
                return (
                  <tr key={s.team.id} className={`border-t border-border font-heading ${i < 2 ? "bg-secondary/20" : ""} ${eliminated ? "opacity-40" : ""}`}>
                    <td className="p-2 font-display">{i + 1}</td>
                    <td className="p-2">{s.team.name}</td>
                    <td className="p-2 text-center">{s.played}</td>
                    <td className="p-2 text-center">{s.wins}</td>
                    <td className="p-2 text-center">{s.draws}</td>
                    <td className="p-2 text-center">{s.losses}</td>
                    <td className="p-2 text-center">{s.goalsFor}</td>
                    <td className="p-2 text-center">{s.goalsAgainst}</td>
                    <td className="p-2 text-center">{s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}</td>
                    <td className="p-2 text-center font-display text-xl text-secondary">{s.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pending matches */}
      {pendingMatches.length > 0 && (
        <section className="mb-10">
          <h3 className="font-display text-3xl text-primary-foreground mb-4">JOGOS PENDENTES</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingMatches.map(m => (
              <div key={m.id} className="p-4 border-2 border-border bg-card text-card-foreground">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-heading">{m.teamA.name}</span>
                  <span className="text-xs text-muted-foreground">⏱ 15min</span>
                  <span className="font-heading">{m.teamB.name}</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <input type="number" min="0" value={scores[m.id]?.a ?? ""} onChange={e => onScoreChange(m.id, "a", e.target.value)}
                    className="w-16 h-12 text-center font-display text-2xl bg-background text-foreground border-2 border-border" placeholder="0" />
                  <span className="font-display text-xl text-muted-foreground">X</span>
                  <input type="number" min="0" value={scores[m.id]?.b ?? ""} onChange={e => onScoreChange(m.id, "b", e.target.value)}
                    className="w-16 h-12 text-center font-display text-2xl bg-background text-foreground border-2 border-border" placeholder="0" />
                </div>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 text-accent" />
                  <span className="text-xs font-heading text-muted-foreground uppercase">GG:</span>
                  <button onClick={() => onGoldenGoalChange(m.id, (scores[m.id]?.gg === "a") ? null : "a")}
                    className={`px-2 py-1 text-xs font-heading border transition-colors ${scores[m.id]?.gg === "a" ? "bg-accent/20 border-accent text-accent" : "border-border text-muted-foreground"}`}>
                    {m.teamA.name}
                  </button>
                  <button onClick={() => onGoldenGoalChange(m.id, (scores[m.id]?.gg === "b") ? null : "b")}
                    className={`px-2 py-1 text-xs font-heading border transition-colors ${scores[m.id]?.gg === "b" ? "bg-accent/20 border-accent text-accent" : "border-border text-muted-foreground"}`}>
                    {m.teamB.name}
                  </button>
                </div>
                <button onClick={() => onSubmit(m.id)}
                  className="w-full mt-3 py-2 bg-secondary text-secondary-foreground font-heading uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-colors">
                  Confirmar
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Played matches */}
      {playedMatches.length > 0 && (
        <section className="mb-10">
          <h3 className="font-heading text-xl text-muted-foreground uppercase tracking-wider mb-4">Resultados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {playedMatches.map(m => (
              <div key={m.id} className="p-3 border border-border bg-card text-card-foreground flex items-center justify-between">
                <span className="font-heading">{m.teamA.name}</span>
                <span className="font-display text-2xl mx-3 flex items-center gap-1">
                  {m.goldenGoal === "a" && <Zap className="w-4 h-4 text-accent" />}
                  {m.scoreA} <span className="text-muted-foreground text-lg">x</span> {m.scoreB}
                  {m.goldenGoal === "b" && <Zap className="w-4 h-4 text-accent" />}
                </span>
                <span className="font-heading">{m.teamB.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {tournament.groupPhaseComplete && (
        <div className="text-center py-8">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onStartDE}
            className="px-10 py-6 bg-accent text-accent-foreground font-heading text-2xl uppercase tracking-wider border-4 border-accent-foreground/20 hover:bg-secondary hover:text-secondary-foreground transition-colors">
            Iniciar Double Elimination →
          </motion.button>
        </div>
      )}
    </>
  );
}

/* ─── DE Phase (inline) ─── */
function DEPhaseInline({ tournament, onSubmitResult }: {
  tournament: Tournament;
  onSubmitResult: (matchId: string, winnerId: number, scoreA: number, scoreB: number, goldenGoal?: "a" | "b" | null) => void;
}) {
  const ubRounds: Record<number, Match[]> = {};
  tournament.upperBracket.forEach(m => { if (!ubRounds[m.round]) ubRounds[m.round] = []; ubRounds[m.round].push(m); });

  const lbRounds: Record<number, Match[]> = {};
  tournament.lowerBracket.forEach(m => { if (!lbRounds[m.round]) lbRounds[m.round] = []; lbRounds[m.round].push(m); });

  const needsReset = tournament.grandFinal?.winner && tournament.grandFinalReset?.teamA;

  return (
    <>
      <AnimatePresence>
        {tournament.champion && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="text-center mb-12 p-8 bg-secondary text-secondary-foreground border-4 border-primary-foreground">
            <p className="text-4xl md:text-6xl font-display">🏆 CAMPEÃO: {tournament.champion.name} 🏆</p>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="mb-10">
        <h3 className="font-display text-3xl text-secondary mb-4">▲ UPPER BRACKET</h3>
        <div className="flex flex-wrap gap-8 items-start">
          {Object.keys(ubRounds).sort((a, b) => Number(a) - Number(b)).map(r => (
            <div key={`ub-${r}`} className="flex flex-col gap-4">
              <span className="text-sm font-heading tracking-widest text-muted-foreground uppercase">UB Rodada {r}</span>
              {ubRounds[Number(r)].map(m => <DEMatchCard key={m.id} match={m} onSubmitResult={onSubmitResult} />)}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h3 className="font-display text-3xl text-accent mb-4">▼ LOWER BRACKET</h3>
        <div className="flex flex-wrap gap-8 items-start">
          {Object.keys(lbRounds).sort((a, b) => Number(a) - Number(b)).map(r => (
            <div key={`lb-${r}`} className="flex flex-col gap-4">
              <span className="text-sm font-heading tracking-widest text-muted-foreground uppercase">LB Rodada {r}</span>
              {lbRounds[Number(r)].map(m => <DEMatchCard key={m.id} match={m} onSubmitResult={onSubmitResult} />)}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h3 className="font-display text-3xl text-primary-foreground mb-4">🏁 GRANDE FINAL</h3>
        <div className="flex flex-wrap gap-8 items-start">
          {tournament.grandFinal && (
            <div className="flex flex-col gap-4">
              <span className="text-sm font-heading tracking-widest text-muted-foreground uppercase">Grande Final</span>
              <DEMatchCard match={tournament.grandFinal} onSubmitResult={onSubmitResult} />
            </div>
          )}
          {needsReset && tournament.grandFinalReset && (
            <div className="flex flex-col gap-4">
              <span className="text-sm font-heading tracking-widest text-muted-foreground uppercase">Final Reset</span>
              <DEMatchCard match={tournament.grandFinalReset} onSubmitResult={onSubmitResult} />
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default TournamentDetail;
