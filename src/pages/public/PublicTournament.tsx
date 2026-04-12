import { useParams, Link } from "react-router-dom";
import { getTournaments } from "@/lib/store";
import { type Tournament, type Match } from "@/lib/tournament";
import { ArrowLeft, Zap, Trophy } from "lucide-react";

const PublicTournament = () => {
  const { id } = useParams<{ id: string }>();
  const data = getTournaments().find(t => t.id === id);

  if (!data) return (
    <div className="min-h-screen bg-primary text-primary-foreground flex items-center justify-center">
      <p className="font-heading text-xl text-muted-foreground">Campeonato não encontrado.</p>
    </div>
  );

  let tournament: Tournament | null = null;
  if (data.tournamentState) {
    try { tournament = JSON.parse(data.tournamentState); } catch {}
  }

  return (
    <div className="min-h-screen bg-primary text-primary-foreground">
      <header className="border-b-4 border-secondary">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/public" className="font-display text-3xl hover:text-secondary transition-colors flex items-center gap-2">
            <ArrowLeft className="w-6 h-6" /> BIKE POLO
          </Link>
          <Link to="/login" className="font-heading text-sm uppercase tracking-wider text-muted-foreground hover:text-secondary transition-colors">
            Login →
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-10">
        <h1 className="text-5xl font-display mb-2">{data.name}</h1>
        <p className="font-heading text-muted-foreground tracking-wider uppercase mb-8">
          {data.teams.length} times · Visualização pública
        </p>

        {!tournament ? (
          <p className="text-muted-foreground font-heading text-lg text-center py-12">
            O campeonato ainda está em fase de montagem. Resultados aparecerão aqui em breve.
          </p>
        ) : (
          <>
            {tournament.champion && (
              <div className="text-center mb-12 p-8 bg-secondary text-secondary-foreground border-4 border-primary-foreground">
                <p className="text-4xl md:text-6xl font-display">🏆 CAMPEÃO: {tournament.champion.name} 🏆</p>
              </div>
            )}

            {/* Standings */}
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
                      <th className="p-3 text-center">SG</th>
                      <th className="p-3 text-center font-display text-xl">PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tournament.standings.map((s, i) => (
                      <tr key={s.team.id} className={`border-t border-border font-heading text-lg ${i < 2 ? "bg-secondary/20" : ""}`}>
                        <td className="p-3 font-display text-xl">{i + 1}</td>
                        <td className="p-3">{s.team.name}</td>
                        <td className="p-3 text-center">{s.played}</td><td className="p-3 text-center">{s.wins}</td>
                        <td className="p-3 text-center">{s.draws}</td><td className="p-3 text-center">{s.losses}</td>
                        <td className="p-3 text-center">{s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}</td>
                        <td className="p-3 text-center font-display text-2xl text-secondary">{s.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Results */}
            {tournament.groupMatches.filter(m => m.played).length > 0 && (
              <section className="mb-12">
                <h2 className="text-4xl font-display mb-6">RESULTADOS</h2>
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
                <ReadOnlyBracket title="▲ UPPER BRACKET" matches={tournament.upperBracket} titleColor="text-secondary" />
                <ReadOnlyBracket title="▼ LOWER BRACKET" matches={tournament.lowerBracket} titleColor="text-accent" />
                {tournament.grandFinal && (
                  <section className="mb-12">
                    <h2 className="text-4xl font-display mb-6">🏁 GRANDE FINAL</h2>
                    <ReadOnlyMatch match={tournament.grandFinal} />
                    {tournament.grandFinalReset?.teamA && <ReadOnlyMatch match={tournament.grandFinalReset} />}
                  </section>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

function ReadOnlyBracket({ title, matches, titleColor }: { title: string; matches: Match[]; titleColor: string }) {
  const rounds: Record<number, Match[]> = {};
  matches.forEach(m => { (rounds[m.round] ??= []).push(m); });

  return (
    <section className="mb-12">
      <h2 className={`text-4xl font-display mb-6 ${titleColor}`}>{title}</h2>
      <div className="flex flex-wrap gap-8 items-start">
        {Object.keys(rounds).sort((a, b) => +a - +b).map(r => (
          <div key={r} className="flex flex-col gap-4">
            <span className="text-sm font-heading tracking-widest text-muted-foreground uppercase">Rodada {r}</span>
            {rounds[+r].map(m => <ReadOnlyMatch key={m.id} match={m} />)}
          </div>
        ))}
      </div>
    </section>
  );
}

function ReadOnlyMatch({ match }: { match: Match }) {
  const { teamA, teamB, winner } = match;
  return (
    <div className="border-2 border-border bg-card text-card-foreground p-4 min-w-[240px]">
      <div className={`p-2 mb-1 border border-border ${winner?.id === teamA?.id ? "bg-secondary text-secondary-foreground border-secondary" : teamA ? "" : "opacity-50"}`}>
        <div className="flex items-center justify-between">
          <span className="font-heading">{teamA ? `#${teamA.seed} ${teamA.name}` : "A definir"}</span>
          {winner && <span className="font-display text-xl">{match.scoreA ?? 0}</span>}
        </div>
      </div>
      <div className="text-center font-display text-sm text-muted-foreground">VS</div>
      <div className={`p-2 mt-1 border border-border ${winner?.id === teamB?.id ? "bg-secondary text-secondary-foreground border-secondary" : teamB ? "" : "opacity-50"}`}>
        <div className="flex items-center justify-between">
          <span className="font-heading">{teamB ? `#${teamB.seed} ${teamB.name}` : "A definir"}</span>
          {winner && <span className="font-display text-xl">{match.scoreB ?? 0}</span>}
        </div>
      </div>
      {winner && (
        <p className="text-xs text-center mt-2 font-heading tracking-wider text-secondary">
          🏆 {winner.name}
          {match.goldenGoal && <span className="ml-1 text-accent">⚡ GG</span>}
        </p>
      )}
    </div>
  );
}

export default PublicTournament;
