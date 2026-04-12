import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Play, Zap, Users } from "lucide-react";
import {
  getTournaments, updateTournament, getPlayers, getClubs,
  type TournamentData, type TournamentTeam, type Player, type Club,
} from "@/lib/store";
import {
  storedToTeams, initTournament, submitGroupResult, startDoubleElimination, selectWinnerWithScore,
  type Tournament, type GroupMatch, type Match, type StoredTeam,
} from "@/lib/tournament";
import DEMatchCard from "@/components/DEMatchCard";

const TournamentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<TournamentData | null>(null);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);

  // Team builder
  const [teamName, setTeamName] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  // Tournament engine
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [scores, setScores] = useState<Record<string, { a: string; b: string; gg: "a" | "b" | null }>>({});

  const reload = () => {
    const t = getTournaments().find(t => t.id === id);
    setData(t || null);
    setAllPlayers(getPlayers());
    setClubs(getClubs());
    if (t?.tournamentState) {
      try { setTournament(JSON.parse(t.tournamentState)); } catch {}
    }
  };
  useEffect(reload, [id]);

  const save = (d: Partial<TournamentData>) => {
    if (!id) return;
    updateTournament(id, d);
    reload();
  };

  const clubName = (clubId: string) => clubs.find(c => c.id === clubId)?.name ?? "";
  const playerName = (pId: string) => {
    const p = allPlayers.find(x => x.id === pId);
    return p ? (p.nickname ? `${p.name} "${p.nickname}"` : p.name) : "—";
  };

  // Players already assigned to teams
  const usedPlayerIds = useMemo(() => {
    if (!data) return new Set<string>();
    return new Set(data.teams.flatMap(t => t.playerIds));
  }, [data]);

  const availablePlayers = allPlayers.filter(p => !usedPlayerIds.has(p.id));

  const togglePlayer = (pId: string) => {
    setSelectedPlayers(prev =>
      prev.includes(pId) ? prev.filter(x => x !== pId) : prev.length < 4 ? [...prev, pId] : prev
    );
  };

  const handleAddTeam = () => {
    if (!data || !teamName.trim() || selectedPlayers.length < 3) return;
    const newTeam: TournamentTeam = {
      id: data.teams.length > 0 ? Math.max(...data.teams.map(t => t.id)) + 1 : 1,
      name: teamName.trim(),
      playerIds: selectedPlayers,
    };
    save({ teams: [...data.teams, newTeam] });
    setTeamName("");
    setSelectedPlayers([]);
  };

  const handleRemoveTeam = (teamId: number) => {
    if (!data) return;
    save({ teams: data.teams.filter(t => t.id !== teamId) });
  };

  const canStart = data && data.teams.length >= 8 && data.teams.length <= 20;

  const handleStartGroups = () => {
    if (!data || !canStart) return;
    const stored: StoredTeam[] = data.teams.map(t => ({
      id: t.id,
      name: t.name,
      players: t.playerIds.map(pid => playerName(pid)),
    }));
    const teams = storedToTeams(stored);
    const t = initTournament(teams, data.config);
    setTournament(t);
    save({ status: "groups", tournamentState: JSON.stringify(t) });
  };

  const saveTournamentState = (t: Tournament, status?: TournamentData["status"]) => {
    setTournament(t);
    const updates: Partial<TournamentData> = { tournamentState: JSON.stringify(t) };
    if (status) updates.status = status;
    save(updates);
  };

  // Group phase handlers
  const handleScoreChange = (matchId: string, side: "a" | "b", value: string) => {
    setScores(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], gg: prev[matchId]?.gg ?? null, [side]: value },
    }));
  };

  const handleGoldenGoalChange = (matchId: string, side: "a" | "b" | null) => {
    setScores(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], a: prev[matchId]?.a ?? "", b: prev[matchId]?.b ?? "", gg: side },
    }));
  };

  const handleSubmitGroup = (matchId: string) => {
    if (!tournament) return;
    const s = scores[matchId];
    if (!s || s.a === "" || s.b === "" || s.a === undefined || s.b === undefined) return;
    const a = parseInt(s.a); const b = parseInt(s.b);
    if (isNaN(a) || isNaN(b) || a < 0 || b < 0) return;
    saveTournamentState(submitGroupResult(tournament, matchId, a, b, s.gg));
  };

  const handleStartDE = () => {
    if (!tournament) return;
    saveTournamentState(startDoubleElimination(tournament), "bracket");
  };

  const handleSubmitDEResult = (matchId: string, winnerId: number, scoreA: number, scoreB: number, goldenGoal?: "a" | "b" | null) => {
    if (!tournament) return;
    const t = selectWinnerWithScore(tournament, matchId, winnerId, scoreA, scoreB, goldenGoal);
    saveTournamentState(t, t.champion ? "finished" : undefined);
  };

  if (!data) return <p className="font-heading text-xl text-muted-foreground">Campeonato não encontrado.</p>;

  return (
    <div>
      <Link to="/dashboard/tournaments" className="flex items-center gap-2 font-heading text-lg text-muted-foreground hover:text-card-foreground transition-colors mb-4">
        <ArrowLeft className="w-5 h-5" /> Voltar
      </Link>

      <h1 className="text-5xl font-display mb-2">{data.name}</h1>
      <p className="font-heading text-muted-foreground tracking-wider uppercase mb-8">
        {data.teams.length} times · {data.status}
      </p>

      {/* Draft phase: team builder */}
      {data.status === "draft" && (
        <>
          <section className="mb-8">
            <h2 className="text-3xl font-display mb-4 flex items-center gap-2">
              <Users className="w-8 h-8" /> MONTAR TIMES
            </h2>
            <p className="text-muted-foreground font-heading mb-4">
              Selecione 3-4 jogadores cadastrados para cada time. ({data.teams.length}/20 times)
            </p>

            <div className="border-2 border-border bg-card text-card-foreground p-5 mb-6 max-w-2xl">
              <input
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                placeholder="Nome do time"
                maxLength={30}
                className="w-full mb-3 px-3 py-2 bg-background text-foreground border-2 border-border font-heading text-lg focus:border-secondary outline-none transition-colors"
              />

              <p className="text-sm font-heading text-muted-foreground uppercase tracking-wider mb-2">
                Jogadores disponíveis ({selectedPlayers.length}/4 selecionados)
              </p>

              {availablePlayers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Nenhum jogador disponível. Cadastre jogadores na seção Jogadores.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto mb-4">
                  {availablePlayers.map(p => (
                    <button
                      key={p.id}
                      onClick={() => togglePlayer(p.id)}
                      disabled={selectedPlayers.length >= 4 && !selectedPlayers.includes(p.id)}
                      className={`p-2 text-left border text-sm font-heading transition-colors ${
                        selectedPlayers.includes(p.id)
                          ? "border-secondary bg-secondary/20 text-secondary"
                          : "border-border hover:border-secondary/50 disabled:opacity-30"
                      }`}
                    >
                      <span>{p.name}</span>
                      {p.nickname && <span className="text-xs text-accent ml-1">"{p.nickname}"</span>}
                      <br />
                      <span className="text-xs text-muted-foreground">{clubName(p.clubId)}</span>
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={handleAddTeam}
                disabled={!teamName.trim() || selectedPlayers.length < 3 || data.teams.length >= 20}
                className="w-full py-3 bg-secondary text-secondary-foreground font-heading text-lg uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Adicionar Time
              </button>
            </div>
          </section>

          {/* Teams list */}
          <section className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.teams.map((team, i) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-2 border-border bg-card text-card-foreground p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-display text-lg text-secondary">#{i + 1}</span>
                      <h4 className="font-heading text-xl">{team.name}</h4>
                    </div>
                    <button onClick={() => handleRemoveTeam(team.id)} className="p-2 hover:bg-destructive/20 text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {team.playerIds.map(pid => playerName(pid)).join(", ")}
                  </p>
                </motion.div>
              ))}
            </div>

            {data.teams.length > 0 && data.teams.length < 8 && (
              <p className="text-sm text-destructive font-heading mt-4">
                ⚠ Adicione pelo menos {8 - data.teams.length} time(s) a mais para iniciar.
              </p>
            )}
          </section>

          {canStart && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <button
                onClick={handleStartGroups}
                className="px-10 py-6 bg-accent text-accent-foreground font-heading text-2xl md:text-4xl uppercase tracking-wider border-4 border-accent-foreground/20 hover:bg-secondary hover:text-secondary-foreground transition-colors"
              >
                <Play className="w-8 h-8 inline mr-2" /> Iniciar Fase de Grupos
              </button>
            </motion.div>
          )}
        </>
      )}

      {/* Group phase */}
      {tournament && (data.status === "groups" || (data.status === "bracket" && tournament.upperBracket.length === 0)) && !tournament.groupPhaseComplete && (
        <GroupPhaseView
          tournament={tournament}
          scores={scores}
          onScoreChange={handleScoreChange}
          onGoldenGoalChange={handleGoldenGoalChange}
          onSubmit={handleSubmitGroup}
        />
      )}

      {tournament && tournament.groupPhaseComplete && tournament.upperBracket.length === 0 && (
        <div className="text-center py-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartDE}
            className="px-10 py-6 bg-accent text-accent-foreground font-heading text-2xl md:text-4xl uppercase tracking-wider border-4 border-accent-foreground/20 hover:bg-secondary hover:text-secondary-foreground transition-colors"
          >
            Iniciar Double Elimination →
          </motion.button>
        </div>
      )}

      {/* Bracket phase */}
      {tournament && tournament.upperBracket.length > 0 && (
        <BracketView tournament={tournament} onSubmitResult={handleSubmitDEResult} />
      )}
    </div>
  );
};

/* ─── Group Phase View ─── */
function GroupPhaseView({ tournament, scores, onScoreChange, onGoldenGoalChange, onSubmit }: {
  tournament: Tournament;
  scores: Record<string, { a: string; b: string; gg: "a" | "b" | null }>;
  onScoreChange: (id: string, side: "a" | "b", val: string) => void;
  onGoldenGoalChange: (id: string, side: "a" | "b" | null) => void;
  onSubmit: (id: string) => void;
}) {
  const pendingMatches = tournament.groupMatches.filter(m => !m.played);
  const playedMatches = tournament.groupMatches.filter(m => m.played);

  return (
    <>
      <section className="mb-12">
        <h2 className="text-4xl font-display mb-6">CLASSIFICAÇÃO</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-2 border-border">
            <thead>
              <tr className="bg-card text-card-foreground font-heading text-lg tracking-wider">
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Time</th>
                <th className="p-3 text-center">J</th><th className="p-3 text-center">V</th>
                <th className="p-3 text-center">E</th><th className="p-3 text-center">D</th>
                <th className="p-3 text-center">GP</th><th className="p-3 text-center">GC</th>
                <th className="p-3 text-center">SG</th>
                <th className="p-3 text-center font-display text-xl">PTS</th>
              </tr>
            </thead>
            <tbody>
              {tournament.standings.map((s, i) => {
                const eliminated = tournament.config.enableGroupElimination &&
                  i >= tournament.standings.length - tournament.config.eliminationCount;
                return (
                  <tr key={s.team.id} className={`border-t border-border font-heading text-lg ${i < 2 ? "bg-secondary/20" : ""} ${eliminated ? "opacity-40 bg-destructive/10" : ""}`}>
                    <td className="p-3 font-display text-xl">{i + 1}</td>
                    <td className="p-3">{s.team.name} {eliminated && <span className="text-xs text-destructive ml-1">ELIMINADO</span>}</td>
                    <td className="p-3 text-center">{s.played}</td><td className="p-3 text-center">{s.wins}</td>
                    <td className="p-3 text-center">{s.draws}</td><td className="p-3 text-center">{s.losses}</td>
                    <td className="p-3 text-center">{s.goalsFor}</td><td className="p-3 text-center">{s.goalsAgainst}</td>
                    <td className="p-3 text-center">{s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}</td>
                    <td className="p-3 text-center font-display text-2xl text-secondary">{s.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {pendingMatches.length > 0 && (
        <section className="mb-12">
          <h2 className="text-4xl font-display mb-6">RODADAS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingMatches.map(m => (
              <div key={m.id} className="p-4 border-2 border-border bg-card text-card-foreground">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-heading text-lg">{m.teamA.name}</span>
                  <span className="font-heading text-lg">{m.teamB.name}</span>
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
                  <button onClick={() => onGoldenGoalChange(m.id, scores[m.id]?.gg === "a" ? null : "a")}
                    className={`px-2 py-1 text-xs font-heading border transition-colors ${scores[m.id]?.gg === "a" ? "bg-accent/20 border-accent text-accent" : "border-border text-muted-foreground"}`}>
                    {m.teamA.name}
                  </button>
                  <button onClick={() => onGoldenGoalChange(m.id, scores[m.id]?.gg === "b" ? null : "b")}
                    className={`px-2 py-1 text-xs font-heading border transition-colors ${scores[m.id]?.gg === "b" ? "bg-accent/20 border-accent text-accent" : "border-border text-muted-foreground"}`}>
                    {m.teamB.name}
                  </button>
                </div>
                <button onClick={() => onSubmit(m.id)}
                  className="w-full mt-3 py-2 bg-secondary text-secondary-foreground font-heading text-lg uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-colors">
                  Confirmar
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {playedMatches.length > 0 && (
        <section className="mb-12">
          <h3 className="text-2xl font-heading tracking-wider mb-4 text-muted-foreground uppercase">Resultados</h3>
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
    </>
  );
}

/* ─── Bracket View ─── */
function BracketView({ tournament, onSubmitResult }: {
  tournament: Tournament;
  onSubmitResult: (matchId: string, winnerId: number, scoreA: number, scoreB: number, goldenGoal?: "a" | "b" | null) => void;
}) {
  const ubRounds: Record<number, Match[]> = {};
  tournament.upperBracket.forEach(m => { (ubRounds[m.round] ??= []).push(m); });
  const lbRounds: Record<number, Match[]> = {};
  tournament.lowerBracket.forEach(m => { (lbRounds[m.round] ??= []).push(m); });

  return (
    <>
      {tournament.champion && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center mb-12 p-8 bg-secondary text-secondary-foreground border-4 border-primary-foreground">
          <p className="text-4xl md:text-6xl font-display">🏆 CAMPEÃO: {tournament.champion.name} 🏆</p>
        </motion.div>
      )}

      <section className="mb-12">
        <h2 className="text-4xl font-display mb-6 text-secondary">▲ UPPER BRACKET</h2>
        <div className="flex flex-wrap gap-8 items-start">
          {Object.keys(ubRounds).sort((a, b) => +a - +b).map(r => (
            <div key={`ub-${r}`} className="flex flex-col gap-4">
              <span className="text-sm font-heading tracking-widest text-muted-foreground uppercase">UB Rodada {r}</span>
              {ubRounds[+r].map(m => <DEMatchCard key={m.id} match={m} onSubmitResult={onSubmitResult} />)}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-4xl font-display mb-6 text-accent">▼ LOWER BRACKET</h2>
        <div className="flex flex-wrap gap-8 items-start">
          {Object.keys(lbRounds).sort((a, b) => +a - +b).map(r => (
            <div key={`lb-${r}`} className="flex flex-col gap-4">
              <span className="text-sm font-heading tracking-widest text-muted-foreground uppercase">LB Rodada {r}</span>
              {lbRounds[+r].map(m => <DEMatchCard key={m.id} match={m} onSubmitResult={onSubmitResult} />)}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-4xl font-display mb-6">🏁 GRANDE FINAL</h2>
        <div className="flex flex-wrap gap-8 items-start">
          {tournament.grandFinal && (
            <div className="flex flex-col gap-4">
              <span className="text-sm font-heading tracking-widest text-muted-foreground uppercase">Grande Final</span>
              <DEMatchCard match={tournament.grandFinal} onSubmitResult={onSubmitResult} />
            </div>
          )}
          {tournament.grandFinal?.winner && tournament.grandFinalReset?.teamA && (
            <div className="flex flex-col gap-4">
              <span className="text-sm font-heading tracking-widest text-muted-foreground uppercase">Final Reset</span>
              <DEMatchCard match={tournament.grandFinalReset!} onSubmitResult={onSubmitResult} />
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default TournamentDetail;
