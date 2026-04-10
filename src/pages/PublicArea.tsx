import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Zap, ArrowLeft } from "lucide-react";
import { loadTournaments, loadTournamentState, getTeamsForTournament, loadPlayers } from "@/lib/storage";
import type { TournamentMeta } from "@/lib/types";
import type { Tournament, Match } from "@/lib/tournament";
import DEMatchCard from "@/components/DEMatchCard";

/* ─── Tournament List ─── */
export function PublicTournamentList() {
  const [tournaments, setTournaments] = useState<TournamentMeta[]>([]);

  useEffect(() => {
    setTournaments(loadTournaments().filter(t => t.status !== "draft"));
  }, []);

  return (
    <div className="min-h-screen bg-primary text-primary-foreground">
      <header className="border-b-4 border-secondary">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-display text-3xl hover:text-secondary transition-colors">🚲 BIKE POLO</Link>
          <h1 className="font-display text-3xl md:text-5xl">RESULTADOS</h1>
        </div>
      </header>
      <div className="container mx-auto px-6 py-10">
        {tournaments.length === 0 ? (
          <p className="text-center font-heading text-muted-foreground py-12">Nenhum campeonato ativo</p>
        ) : (
          <div className="space-y-4">
            {tournaments.map(t => (
              <Link key={t.id} to={`/public/${t.id}`}
                className="block bg-card text-card-foreground border-2 border-border p-6 hover:border-secondary transition-colors">
                <div className="flex items-center gap-4">
                  <Trophy className="w-8 h-8" />
                  <div>
                    <p className="font-heading text-2xl">{t.name}</p>
                    <p className="text-xs font-heading text-muted-foreground uppercase tracking-wider">
                      {t.status === "groups" ? "FASE DE GRUPOS" : t.status === "bracket" ? "DOUBLE ELIMINATION" : "FINALIZADO"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/login" className="text-muted-foreground font-heading text-sm hover:text-secondary transition-colors">
            Área administrativa →
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Tournament Public View ─── */
export function PublicTournamentView() {
  const { id } = useParams<{ id: string }>();
  const [meta, setMeta] = useState<TournamentMeta | null>(null);
  const [tournament, setTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    if (!id) return;
    const t = loadTournaments().find(t => t.id === id);
    setMeta(t || null);
    if (t) {
      const state = loadTournamentState(id) as Tournament | null;
      setTournament(state);
    }
  }, [id]);

  if (!meta || !tournament) {
    return (
      <div className="min-h-screen bg-primary text-primary-foreground flex items-center justify-center">
        <p className="font-heading text-muted-foreground">Campeonato não encontrado</p>
      </div>
    );
  }

  const ubRounds: Record<number, Match[]> = {};
  tournament.upperBracket.forEach(m => { if (!ubRounds[m.round]) ubRounds[m.round] = []; ubRounds[m.round].push(m); });

  const lbRounds: Record<number, Match[]> = {};
  tournament.lowerBracket.forEach(m => { if (!lbRounds[m.round]) lbRounds[m.round] = []; lbRounds[m.round].push(m); });

  const needsReset = tournament.grandFinal?.winner && tournament.grandFinalReset?.teamA;

  return (
    <div className="min-h-screen bg-primary text-primary-foreground">
      <header className="border-b-4 border-secondary">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/public" className="font-display text-3xl hover:text-secondary transition-colors flex items-center gap-2">
            <ArrowLeft className="w-6 h-6" /> RESULTADOS
          </Link>
          <h1 className="font-display text-2xl md:text-4xl">{meta.name}</h1>
        </div>
      </header>
      <div className="container mx-auto px-6 py-10">
        {/* Champion */}
        {tournament.champion && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="text-center mb-12 p-8 bg-secondary text-secondary-foreground border-4 border-primary-foreground">
            <p className="text-4xl md:text-6xl font-display">🏆 CAMPEÃO: {tournament.champion.name} 🏆</p>
          </motion.div>
        )}

        {/* Standings */}
        <section className="mb-10">
          <h2 className="font-display text-3xl mb-4">CLASSIFICAÇÃO</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-2 border-border">
              <thead>
                <tr className="bg-card text-card-foreground font-heading tracking-wider">
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Time</th>
                  <th className="p-2 text-center">J</th>
                  <th className="p-2 text-center">V</th>
                  <th className="p-2 text-center">E</th>
                  <th className="p-2 text-center">D</th>
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
                      <td className="p-2 text-center">{s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}</td>
                      <td className="p-2 text-center font-display text-xl text-secondary">{s.points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Group Results */}
        {tournament.groupMatches.filter(m => m.played).length > 0 && (
          <section className="mb-10">
            <h2 className="font-display text-3xl mb-4">RESULTADOS DOS GRUPOS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {tournament.groupMatches.filter(m => m.played).map(m => (
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

        {/* Brackets (read-only) */}
        {tournament.upperBracket.length > 0 && (
          <>
            <section className="mb-10">
              <h2 className="font-display text-3xl text-secondary mb-4">▲ UPPER BRACKET</h2>
              <div className="flex flex-wrap gap-8 items-start">
                {Object.keys(ubRounds).sort((a, b) => Number(a) - Number(b)).map(r => (
                  <div key={`ub-${r}`} className="flex flex-col gap-4">
                    <span className="text-sm font-heading tracking-widest text-muted-foreground uppercase">Rodada {r}</span>
                    {ubRounds[Number(r)].map(m => <ReadOnlyMatchCard key={m.id} match={m} />)}
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-10">
              <h2 className="font-display text-3xl text-accent mb-4">▼ LOWER BRACKET</h2>
              <div className="flex flex-wrap gap-8 items-start">
                {Object.keys(lbRounds).sort((a, b) => Number(a) - Number(b)).map(r => (
                  <div key={`lb-${r}`} className="flex flex-col gap-4">
                    <span className="text-sm font-heading tracking-widest text-muted-foreground uppercase">Rodada {r}</span>
                    {lbRounds[Number(r)].map(m => <ReadOnlyMatchCard key={m.id} match={m} />)}
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-10">
              <h2 className="font-display text-3xl mb-4">🏁 GRANDE FINAL</h2>
              <div className="flex flex-wrap gap-8 items-start">
                {tournament.grandFinal && <ReadOnlyMatchCard match={tournament.grandFinal} />}
                {needsReset && tournament.grandFinalReset && <ReadOnlyMatchCard match={tournament.grandFinalReset} />}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Read-only match card ─── */
function ReadOnlyMatchCard({ match }: { match: Match }) {
  return (
    <div className="w-64 p-4 border-2 border-border bg-card text-card-foreground">
      <div className={`p-2 font-heading flex justify-between items-center ${match.winner?.id === match.teamA?.id ? "text-secondary" : ""}`}>
        <span>{match.teamA?.name ?? "TBD"}</span>
        {match.scoreA !== null && match.scoreA !== undefined && (
          <span className="font-display text-xl flex items-center gap-1">
            {match.goldenGoal === "a" && <Zap className="w-3 h-3 text-accent" />}
            {match.scoreA}
          </span>
        )}
      </div>
      <div className="text-center text-xs text-muted-foreground font-heading">VS</div>
      <div className={`p-2 font-heading flex justify-between items-center ${match.winner?.id === match.teamB?.id ? "text-secondary" : ""}`}>
        <span>{match.teamB?.name ?? "TBD"}</span>
        {match.scoreB !== null && match.scoreB !== undefined && (
          <span className="font-display text-xl flex items-center gap-1">
            {match.goldenGoal === "b" && <Zap className="w-3 h-3 text-accent" />}
            {match.scoreB}
          </span>
        )}
      </div>
      {match.winner && (
        <div className="mt-2 text-center text-xs font-heading text-secondary uppercase">
          🏆 {match.winner.name}
        </div>
      )}
    </div>
  );
}

export default PublicTournamentList;
