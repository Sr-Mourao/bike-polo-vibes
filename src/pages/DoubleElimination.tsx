import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import {
  storedToTeams,
  initTournament,
  submitGroupResult,
  startDoubleElimination,
  selectWinnerWithScore,
  type Tournament,
  type GroupMatch,
  type Match,
  type StoredTeam,
  type TournamentConfig as TConfig,
} from "@/lib/tournament";
import DEMatchCard from "@/components/DEMatchCard";
import TeamRegistration from "@/components/TeamRegistration";
import TournamentConfigComponent from "@/components/TournamentConfig";

type Phase = "register" | "config" | "tournament";

const DoubleEliminationPage = () => {
  const [phase, setPhase] = useState<Phase>("register");
  const [storedTeams, setStoredTeams] = useState<StoredTeam[]>([]);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [scores, setScores] = useState<Record<string, { a: string; b: string; gg: "a" | "b" | null }>>({});

  const handleTeamsReady = (teams: StoredTeam[]) => {
    setStoredTeams(teams);
    setPhase("config");
  };

  const handleStartTournament = (config: TConfig) => {
    const teams = storedToTeams(storedTeams);
    setTournament(initTournament(teams, config));
    setScores({});
    setPhase("tournament");
  };

  const handleReset = () => {
    setTournament(null);
    setScores({});
    setPhase("register");
  };

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
    setTournament(submitGroupResult(tournament, matchId, a, b, s.gg));
  };

  const handleStartDE = () => {
    if (!tournament) return;
    setTournament(startDoubleElimination(tournament));
  };

  const handleSubmitDEResult = (matchId: string, winnerId: number, scoreA: number, scoreB: number, goldenGoal?: "a" | "b" | null) => {
    if (!tournament) return;
    setTournament(selectWinnerWithScore(tournament, matchId, winnerId, scoreA, scoreB, goldenGoal));
  };

  return (
    <div className="min-h-screen bg-primary text-primary-foreground">
      <header className="border-b-4 border-secondary">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-display text-3xl hover:text-secondary transition-colors">
            ← BIKE POLO
          </Link>
          <h1 className="font-display text-3xl md:text-5xl">DOUBLE ELIMINATION</h1>
        </div>
      </header>

      <div className="container mx-auto px-6 py-10">
        {phase === "register" && (
          <TeamRegistration onStartTournament={handleTeamsReady} />
        )}

        {phase === "config" && (
          <TournamentConfigComponent
            teams={storedTeams}
            onStart={handleStartTournament}
            onBack={() => setPhase("register")}
          />
        )}

        {phase === "tournament" && tournament && (
          <>
            <div className="flex justify-end mb-8">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-destructive text-destructive-foreground font-heading text-xl uppercase tracking-wider hover:opacity-80 transition-opacity"
              >
                Resetar Tudo
              </button>
            </div>

            <AnimatePresence>
              {tournament.champion && (
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="text-center mb-12 p-8 bg-secondary text-secondary-foreground border-4 border-primary-foreground"
                >
                  <p className="text-4xl md:text-6xl font-display">
                    🏆 CAMPEÃO: {tournament.champion.name} 🏆
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Teams */}
            <section className="mb-12">
              <h2 className="text-4xl font-display mb-6">TIMES ({tournament.teams.length})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {tournament.teams.map(team => (
                  <div key={team.id} className={`p-3 border-2 border-border bg-card text-card-foreground ${team.eliminated ? "opacity-30" : ""}`}>
                    <p className="font-heading text-lg">#{team.seed} {team.name}</p>
                    <p className="text-xs text-muted-foreground">{team.players.map(p => p.name).join(", ")}</p>
                  </div>
                ))}
              </div>
            </section>

            {!tournament.groupPhaseComplete || tournament.upperBracket.length === 0 ? (
              <GroupPhase
                tournament={tournament}
                scores={scores}
                onScoreChange={handleScoreChange}
                onGoldenGoalChange={handleGoldenGoalChange}
                onSubmit={handleSubmitGroup}
                onStartDE={handleStartDE}
              />
            ) : (
              <DEPhase tournament={tournament} onSubmitResult={handleSubmitDEResult} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

/* ─── Group Phase ─── */
function GroupPhase({
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
      <section className="mb-12">
        <h2 className="text-4xl font-display mb-6">CLASSIFICAÇÃO</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-2 border-border">
            <thead>
              <tr className="bg-card text-card-foreground font-heading text-lg tracking-wider">
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Time</th>
                <th className="p-3 text-center">J</th>
                <th className="p-3 text-center">V</th>
                <th className="p-3 text-center">E</th>
                <th className="p-3 text-center">D</th>
                <th className="p-3 text-center">GP</th>
                <th className="p-3 text-center">GC</th>
                <th className="p-3 text-center">SG</th>
                <th className="p-3 text-center font-display text-xl">PTS</th>
              </tr>
            </thead>
            <tbody>
              {tournament.standings.map((s, i) => {
                const eliminated = tournament.config.enableGroupElimination &&
                  i >= tournament.standings.length - tournament.config.eliminationCount;
                return (
                  <motion.tr
                    key={s.team.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`border-t border-border font-heading text-lg ${
                      i < 2 ? "bg-secondary/20" : ""
                    } ${eliminated ? "opacity-40 bg-destructive/10" : ""}`}
                  >
                    <td className="p-3 font-display text-xl">{i + 1}</td>
                    <td className="p-3">
                      {s.team.name}
                      {eliminated && <span className="ml-2 text-xs text-destructive">ELIMINADO</span>}
                    </td>
                    <td className="p-3 text-center">{s.played}</td>
                    <td className="p-3 text-center">{s.wins}</td>
                    <td className="p-3 text-center">{s.draws}</td>
                    <td className="p-3 text-center">{s.losses}</td>
                    <td className="p-3 text-center">{s.goalsFor}</td>
                    <td className="p-3 text-center">{s.goalsAgainst}</td>
                    <td className="p-3 text-center">{s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}</td>
                    <td className="p-3 text-center font-display text-2xl text-secondary">{s.points}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Vitória = 3 pts · Empate = 1 pt · Derrota = 0 pts
          {tournament.config.enableGroupElimination &&
            ` · Últimos ${tournament.config.eliminationCount} eliminados`}
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-4xl font-display mb-6">RODADAS</h2>

        {pendingMatches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {pendingMatches.map(m => (
              <GroupMatchCard
                key={m.id}
                match={m}
                scoreA={scores[m.id]?.a ?? ""}
                scoreB={scores[m.id]?.b ?? ""}
                goldenGoal={scores[m.id]?.gg ?? null}
                onScoreChange={onScoreChange}
                onGoldenGoalChange={onGoldenGoalChange}
                onSubmit={onSubmit}
              />
            ))}
          </div>
        )}

        {playedMatches.length > 0 && (
          <>
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
          </>
        )}
      </section>

      {tournament.groupPhaseComplete && (
        <div className="text-center py-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStartDE}
            className="px-10 py-6 bg-accent text-accent-foreground font-heading text-2xl md:text-4xl uppercase tracking-wider border-4 border-accent-foreground/20 hover:bg-secondary hover:text-secondary-foreground transition-colors"
          >
            Iniciar Double Elimination →
          </motion.button>
        </div>
      )}
    </>
  );
}

function GroupMatchCard({
  match, scoreA, scoreB, goldenGoal, onScoreChange, onGoldenGoalChange, onSubmit,
}: {
  match: GroupMatch;
  scoreA: string;
  scoreB: string;
  goldenGoal: "a" | "b" | null;
  onScoreChange: (id: string, side: "a" | "b", val: string) => void;
  onGoldenGoalChange: (id: string, side: "a" | "b" | null) => void;
  onSubmit: (id: string) => void;
}) {
  return (
    <div className="p-4 border-2 border-border bg-card text-card-foreground">
      <div className="flex items-center justify-between mb-3">
        <span className="font-heading text-lg">{match.teamA.name}</span>
        <span className="text-xs text-muted-foreground">⏱ 15min</span>
        <span className="font-heading text-lg">{match.teamB.name}</span>
      </div>
      <div className="flex items-center gap-2 justify-center">
        <input
          type="number"
          min="0"
          value={scoreA}
          onChange={e => onScoreChange(match.id, "a", e.target.value)}
          className="w-16 h-12 text-center font-display text-2xl bg-background text-foreground border-2 border-border"
          placeholder="0"
        />
        <span className="font-display text-xl text-muted-foreground">X</span>
        <input
          type="number"
          min="0"
          value={scoreB}
          onChange={e => onScoreChange(match.id, "b", e.target.value)}
          className="w-16 h-12 text-center font-display text-2xl bg-background text-foreground border-2 border-border"
          placeholder="0"
        />
      </div>

      {/* Golden Goal */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <Zap className="w-4 h-4 text-accent" />
        <span className="text-xs font-heading text-muted-foreground uppercase">GG:</span>
        <button
          onClick={() => onGoldenGoalChange(match.id, goldenGoal === "a" ? null : "a")}
          className={`px-2 py-1 text-xs font-heading border transition-colors ${
            goldenGoal === "a" ? "bg-accent/20 border-accent text-accent" : "border-border text-muted-foreground hover:border-accent/50"
          }`}
        >
          {match.teamA.name}
        </button>
        <button
          onClick={() => onGoldenGoalChange(match.id, goldenGoal === "b" ? null : "b")}
          className={`px-2 py-1 text-xs font-heading border transition-colors ${
            goldenGoal === "b" ? "bg-accent/20 border-accent text-accent" : "border-border text-muted-foreground hover:border-accent/50"
          }`}
        >
          {match.teamB.name}
        </button>
      </div>

      <button
        onClick={() => onSubmit(match.id)}
        className="w-full mt-3 py-2 bg-secondary text-secondary-foreground font-heading text-lg uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        Confirmar
      </button>
    </div>
  );
}

/* ─── Double Elimination Phase ─── */
function DEPhase({ tournament, onSubmitResult }: {
  tournament: Tournament;
  onSubmitResult: (matchId: string, winnerId: number, scoreA: number, scoreB: number, goldenGoal?: "a" | "b" | null) => void;
}) {
  // Group matches by round for UB and LB
  const ubRounds: Record<number, typeof tournament.upperBracket> = {};
  tournament.upperBracket.forEach(m => {
    if (!ubRounds[m.round]) ubRounds[m.round] = [];
    ubRounds[m.round].push(m);
  });

  const lbRounds: Record<number, typeof tournament.lowerBracket> = {};
  tournament.lowerBracket.forEach(m => {
    if (!lbRounds[m.round]) lbRounds[m.round] = [];
    lbRounds[m.round].push(m);
  });

  const needsReset = tournament.grandFinal?.winner && tournament.grandFinalReset?.teamA;

  return (
    <>
      <section className="mb-12">
        <h2 className="text-4xl font-display mb-4">CLASSIFICAÇÃO FINAL</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-2 border-border">
            <thead>
              <tr className="bg-card text-card-foreground font-heading text-lg tracking-wider">
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Time</th>
                <th className="p-3 text-center">PTS</th>
                <th className="p-3 text-center">SG</th>
              </tr>
            </thead>
            <tbody>
              {tournament.standings.map((s, i) => {
                const eliminated = tournament.config.enableGroupElimination &&
                  i >= tournament.standings.length - tournament.config.eliminationCount;
                return (
                  <tr key={s.team.id} className={`border-t border-border font-heading text-lg ${i < 2 ? "bg-secondary/20" : ""} ${eliminated ? "opacity-40 line-through" : ""}`}>
                    <td className="p-3 font-display">{i + 1}</td>
                    <td className="p-3">{s.team.name}</td>
                    <td className="p-3 text-center font-display text-xl text-secondary">{s.points}</td>
                    <td className="p-3 text-center">{s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-4xl font-display mb-4">STATUS</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {tournament.teams.filter(t => !t.eliminated || t.losses > 0).map(t => (
            <div key={t.id} className={`p-2 border border-border bg-card text-card-foreground text-sm ${t.eliminated ? "opacity-30 line-through" : ""} ${t.losses === 1 ? "border-destructive" : ""}`}>
              <span className="font-heading">#{t.seed} {t.name}</span>
              {t.losses > 0 && <span className="text-destructive ml-1 text-xs font-bold">{t.losses}L</span>}
            </div>
          ))}
        </div>
      </section>

      {/* Upper Bracket */}
      <section className="mb-12">
        <h2 className="text-4xl font-display mb-6 text-secondary">▲ UPPER BRACKET</h2>
        <div className="flex flex-wrap gap-8 items-start">
          {Object.keys(ubRounds).sort((a, b) => Number(a) - Number(b)).map(round => (
            <BracketRound
              key={`ub-${round}`}
              label={`UB Rodada ${round}`}
              matches={ubRounds[Number(round)]}
              onSubmitResult={onSubmitResult}
            />
          ))}
        </div>
      </section>

      {/* Lower Bracket */}
      <section className="mb-12">
        <h2 className="text-4xl font-display mb-6 text-accent">▼ LOWER BRACKET</h2>
        <div className="flex flex-wrap gap-8 items-start">
          {Object.keys(lbRounds).sort((a, b) => Number(a) - Number(b)).map(round => (
            <BracketRound
              key={`lb-${round}`}
              label={`LB Rodada ${round}`}
              matches={lbRounds[Number(round)]}
              onSubmitResult={onSubmitResult}
            />
          ))}
        </div>
      </section>

      {/* Grand Final */}
      <section className="mb-12">
        <h2 className="text-4xl font-display mb-6">🏁 GRANDE FINAL</h2>
        <div className="flex flex-wrap gap-8 items-start">
          {tournament.grandFinal && (
            <BracketRound label="Grande Final" matches={[tournament.grandFinal]} onSubmitResult={onSubmitResult} />
          )}
          {needsReset && tournament.grandFinalReset && (
            <BracketRound label="Final Reset" matches={[tournament.grandFinalReset]} onSubmitResult={onSubmitResult} />
          )}
        </div>
      </section>
    </>
  );
}

function BracketRound({ label, matches, onSubmitResult }: {
  label: string;
  matches: Match[];
  onSubmitResult: (matchId: string, winnerId: number, scoreA: number, scoreB: number, goldenGoal?: "a" | "b" | null) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <span className="text-sm font-heading tracking-widest text-muted-foreground uppercase">{label}</span>
      {matches.map(m => (
        <DEMatchCard key={m.id} match={m} onSubmitResult={onSubmitResult} />
      ))}
    </div>
  );
}

export default DoubleEliminationPage;
