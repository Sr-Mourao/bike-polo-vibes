import { motion } from "framer-motion";
import type { Match } from "@/lib/tournament";

interface MatchCardProps {
  match: Match;
  onSelectWinner: (matchId: string, teamId: number) => void;
}

const MatchCard = ({ match, onSelectWinner }: MatchCardProps) => {
  const { teamA, teamB, winner, id, bracket, round } = match;
  const isReady = teamA && teamB && !winner;
  const isWaiting = !teamA || !teamB;

  const bracketLabel = {
    upper: "UPPER",
    lower: "LOWER",
    "grand-final": "GRANDE FINAL",
    "grand-final-reset": "FINAL RESET",
  }[bracket];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="border-2 border-primary bg-card text-card-foreground p-4 min-w-[220px]"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-heading tracking-wider text-muted-foreground">
          {bracketLabel} R{round}
        </span>
        <span className="text-xs text-muted-foreground">⏱ 15min</span>
      </div>

      {/* Team A */}
      <div
        className={`p-2 mb-1 border border-border transition-all duration-200 ${
          winner?.id === teamA?.id
            ? "bg-secondary text-secondary-foreground border-secondary"
            : winner && winner.id !== teamA?.id
            ? "opacity-40"
            : ""
        } ${isReady && !winner ? "cursor-pointer hover:bg-secondary/20" : ""}`}
        onClick={() => isReady && teamA && onSelectWinner(id, teamA.id)}
      >
        <span className="font-heading text-lg tracking-wide">
          {teamA ? `#${teamA.seed} ${teamA.name}` : "A definir"}
        </span>
        {teamA && teamA.losses > 0 && (
          <span className="ml-2 text-xs text-destructive">({teamA.losses}L)</span>
        )}
      </div>

      <div className="text-center font-display text-sm text-muted-foreground">VS</div>

      {/* Team B */}
      <div
        className={`p-2 mt-1 border border-border transition-all duration-200 ${
          winner?.id === teamB?.id
            ? "bg-secondary text-secondary-foreground border-secondary"
            : winner && winner.id !== teamB?.id
            ? "opacity-40"
            : ""
        } ${isReady && !winner ? "cursor-pointer hover:bg-secondary/20" : ""}`}
        onClick={() => isReady && teamB && onSelectWinner(id, teamB.id)}
      >
        <span className="font-heading text-lg tracking-wide">
          {teamB ? `#${teamB.seed} ${teamB.name}` : "A definir"}
        </span>
        {teamB && teamB.losses > 0 && (
          <span className="ml-2 text-xs text-destructive">({teamB.losses}L)</span>
        )}
      </div>

      {isWaiting && (
        <p className="text-xs text-muted-foreground mt-2 text-center italic">Aguardando...</p>
      )}
      {winner && (
        <p className="text-xs text-center mt-2 font-heading tracking-wider text-secondary">
          🏆 {winner.name}
        </p>
      )}
    </motion.div>
  );
};

export default MatchCard;
