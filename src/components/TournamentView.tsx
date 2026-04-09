import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateTeams, initTournament, selectWinner, type Tournament } from "@/lib/tournament";
import MatchCard from "./MatchCard";

const TournamentView = () => {
  const [tournament, setTournament] = useState<Tournament | null>(null);

  const handleCreate = () => {
    const teams = generateTeams();
    setTournament(initTournament(teams, { enableGroupElimination: false, eliminationCount: 2 }));
  };

  const handleReset = () => setTournament(null);

  const handleSelectWinner = (matchId: string, teamId: number) => {
    if (!tournament) return;
    setTournament(selectWinner(tournament, matchId, teamId));
  };

  if (!tournament) {
    return (
      <section className="py-20 grain-overlay bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreate}
            className="px-10 py-5 bg-secondary text-secondary-foreground font-heading text-2xl md:text-4xl uppercase tracking-wider border-4 border-secondary-foreground/20 hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
          >
            Criar Double Elimination 🏆
          </motion.button>
        </div>
      </section>
    );
  }

  const upperR1 = tournament.upperBracket.filter(m => m.id.startsWith("U1"));
  const upperR2 = tournament.upperBracket.filter(m => m.id.startsWith("U2"));
  const upperSemi = tournament.upperBracket.filter(m => m.id === "U3-1");
  const upperFinal = tournament.upperBracket.filter(m => m.id === "U4-1");

  const lowerR1 = tournament.lowerBracket.filter(m => m.id.startsWith("L1"));
  const lowerR2 = tournament.lowerBracket.filter(m => m.id.startsWith("L2"));
  const lowerR3 = tournament.lowerBracket.filter(m => m.id === "L3-1");
  const lowerR4 = tournament.lowerBracket.filter(m => m.id === "L4-1");
  const lowerSemi = tournament.lowerBracket.filter(m => m.id === "L5-1");
  const lowerFinal = tournament.lowerBracket.filter(m => m.id === "L6-1");

  const showGrandFinal = tournament.grandFinal?.teamA && tournament.grandFinal?.teamB;
  const showReset = tournament.grandFinalReset?.teamA && tournament.grandFinalReset?.teamB && !tournament.grandFinal?.winner;
  const needsReset = tournament.grandFinal?.winner && tournament.grandFinalReset?.teamA;

  return (
    <section className="py-16 grain-overlay bg-primary text-primary-foreground overflow-x-auto">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
          <h2 className="text-5xl md:text-7xl font-display text-primary-foreground">
            CAMPEONATO
          </h2>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-destructive text-destructive-foreground font-heading text-xl uppercase tracking-wider border-2 border-destructive-foreground/20 hover:opacity-80 transition-opacity"
          >
            Resetar Campeonato
          </button>
        </div>

        {/* Champion */}
        <AnimatePresence>
          {tournament.champion && (
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-center mb-12 p-8 bg-secondary text-secondary-foreground border-4 border-primary-foreground"
            >
              <p className="text-3xl md:text-5xl font-display">
                🏆 CAMPEÃO: {tournament.champion.name} 🏆
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Teams List */}
        <div className="mb-12">
          <h3 className="text-3xl font-heading tracking-wider mb-4 text-primary-foreground uppercase">
            Times
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {tournament.teams.map(team => (
              <div
                key={team.id}
                className={`p-3 border-2 border-border bg-card text-card-foreground transition-opacity ${
                  team.eliminated ? "opacity-30 line-through" : ""
                } ${team.losses === 1 ? "border-destructive" : ""}`}
              >
                <p className="font-heading text-lg tracking-wide">
                  #{team.seed} {team.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {team.players.map(p => p.name).join(", ")}
                </p>
                {team.losses > 0 && (
                  <span className="text-xs text-destructive font-bold">{team.losses} derrota(s)</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upper Bracket */}
        <div className="mb-12">
          <h3 className="text-3xl font-heading tracking-wider mb-6 text-secondary uppercase">
            ▲ Upper Bracket
          </h3>
          <div className="flex flex-wrap gap-8 items-start">
            <BracketRound label="Rodada 1" matches={upperR1} onSelect={handleSelectWinner} />
            <BracketRound label="Rodada 2" matches={upperR2} onSelect={handleSelectWinner} />
            <BracketRound label="Semi" matches={upperSemi} onSelect={handleSelectWinner} />
            <BracketRound label="Final UB" matches={upperFinal} onSelect={handleSelectWinner} />
          </div>
        </div>

        {/* Lower Bracket */}
        <div className="mb-12">
          <h3 className="text-3xl font-heading tracking-wider mb-6 text-accent uppercase">
            ▼ Lower Bracket
          </h3>
          <div className="flex flex-wrap gap-8 items-start">
            <BracketRound label="LB R1" matches={lowerR1} onSelect={handleSelectWinner} />
            <BracketRound label="LB R2" matches={lowerR2} onSelect={handleSelectWinner} />
            <BracketRound label="LB R3" matches={lowerR3} onSelect={handleSelectWinner} />
            <BracketRound label="LB R4" matches={lowerR4} onSelect={handleSelectWinner} />
            <BracketRound label="LB Semi" matches={lowerSemi} onSelect={handleSelectWinner} />
            <BracketRound label="LB Final" matches={lowerFinal} onSelect={handleSelectWinner} />
          </div>
        </div>

        {/* Grand Final */}
        <div className="mb-12">
          <h3 className="text-3xl font-heading tracking-wider mb-6 text-primary-foreground uppercase">
            🏁 Grande Final
          </h3>
          <div className="flex flex-wrap gap-8 items-start">
            {tournament.grandFinal && (
              <BracketRound label="Grande Final" matches={[tournament.grandFinal]} onSelect={handleSelectWinner} />
            )}
            {needsReset && tournament.grandFinalReset && (
              <BracketRound label="Final Reset" matches={[tournament.grandFinalReset]} onSelect={handleSelectWinner} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

function BracketRound({
  label,
  matches,
  onSelect,
}: {
  label: string;
  matches: { id: string; round: number; bracket: string; teamA: any; teamB: any; winner: any; loser: any }[];
  onSelect: (matchId: string, teamId: number) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <span className="text-sm font-heading tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
      {matches.map(m => (
        <MatchCard key={m.id} match={m as any} onSelectWinner={onSelect} />
      ))}
    </div>
  );
}

export default TournamentView;
