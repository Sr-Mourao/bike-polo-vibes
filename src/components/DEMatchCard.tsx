import { useState } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import type { Match } from "@/lib/tournament";

interface DEMatchCardProps {
  match: Match;
  onSubmitResult: (matchId: string, winnerId: number, scoreA: number, scoreB: number, goldenGoal?: "a" | "b" | null) => void;
}

const DEMatchCard = ({ match, onSubmitResult }: DEMatchCardProps) => {
  const { teamA, teamB, winner, id, bracket, round } = match;
  const isReady = teamA && teamB && !winner;
  const isWaiting = !teamA || !teamB;

  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");
  const [goldenGoal, setGoldenGoal] = useState<"a" | "b" | null>(null);

  const bracketLabel = {
    upper: "UPPER",
    lower: "LOWER",
    "grand-final": "GRANDE FINAL",
    "grand-final-reset": "FINAL RESET",
  }[bracket];

  const handleSubmit = () => {
    if (!teamA || !teamB) return;
    const a = parseInt(scoreA);
    const b = parseInt(scoreB);
    if (isNaN(a) || isNaN(b) || a < 0 || b < 0 || a === b) return;
    const winnerId = a > b ? teamA.id : teamB.id;
    onSubmitResult(id, winnerId, a, b, goldenGoal);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="border-2 border-primary bg-card text-card-foreground p-4 min-w-[240px]"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-heading tracking-wider text-muted-foreground">
          {bracketLabel} R{round}
        </span>
        <span className="text-xs text-muted-foreground">⏱ 15min</span>
      </div>

      {winner ? (
        <>
          {/* Completed match */}
          <div className={`p-2 mb-1 border border-border ${winner.id === teamA?.id ? "bg-secondary text-secondary-foreground border-secondary" : "opacity-40"}`}>
            <div className="flex items-center justify-between">
              <span className="font-heading text-lg tracking-wide">
                {teamA ? `#${teamA.seed} ${teamA.name}` : "A definir"}
              </span>
              <div className="flex items-center gap-1">
                {match.goldenGoal === "a" && <Zap className="w-4 h-4 text-yellow-400" title="Golden Goal" />}
                <span className="font-display text-xl">{match.scoreA ?? 0}</span>
              </div>
            </div>
          </div>
          <div className="text-center font-display text-sm text-muted-foreground">VS</div>
          <div className={`p-2 mt-1 border border-border ${winner.id === teamB?.id ? "bg-secondary text-secondary-foreground border-secondary" : "opacity-40"}`}>
            <div className="flex items-center justify-between">
              <span className="font-heading text-lg tracking-wide">
                {teamB ? `#${teamB.seed} ${teamB.name}` : "A definir"}
              </span>
              <div className="flex items-center gap-1">
                {match.goldenGoal === "b" && <Zap className="w-4 h-4 text-yellow-400" title="Golden Goal" />}
                <span className="font-display text-xl">{match.scoreB ?? 0}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-center mt-2 font-heading tracking-wider text-secondary">
            🏆 {winner.name}
            {match.goldenGoal && <span className="ml-1 text-yellow-400">⚡ GG</span>}
          </p>
        </>
      ) : isReady ? (
        <>
          {/* Score input */}
          <div className="p-2 mb-1 border border-border">
            <span className="font-heading text-lg tracking-wide">
              #{teamA!.seed} {teamA!.name}
            </span>
            {teamA!.losses > 0 && <span className="ml-2 text-xs text-destructive">({teamA!.losses}L)</span>}
          </div>
          <div className="flex items-center gap-2 justify-center my-2">
            <input
              type="number"
              min="0"
              value={scoreA}
              onChange={e => setScoreA(e.target.value)}
              className="w-16 h-12 text-center font-display text-2xl bg-background text-foreground border-2 border-border"
              placeholder="0"
            />
            <span className="font-display text-xl text-muted-foreground">X</span>
            <input
              type="number"
              min="0"
              value={scoreB}
              onChange={e => setScoreB(e.target.value)}
              className="w-16 h-12 text-center font-display text-2xl bg-background text-foreground border-2 border-border"
              placeholder="0"
            />
          </div>
          <div className="p-2 mt-1 border border-border">
            <span className="font-heading text-lg tracking-wide">
              #{teamB!.seed} {teamB!.name}
            </span>
            {teamB!.losses > 0 && <span className="ml-2 text-xs text-destructive">({teamB!.losses}L)</span>}
          </div>

          {/* Golden Goal toggle */}
          <div className="mt-3 flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-heading text-muted-foreground uppercase">Golden Goal:</span>
            <button
              onClick={() => setGoldenGoal(goldenGoal === "a" ? null : "a")}
              className={`px-2 py-1 text-xs font-heading border transition-colors ${
                goldenGoal === "a" ? "bg-yellow-400/20 border-yellow-400 text-yellow-400" : "border-border text-muted-foreground hover:border-yellow-400/50"
              }`}
            >
              {teamA!.name}
            </button>
            <button
              onClick={() => setGoldenGoal(goldenGoal === "b" ? null : "b")}
              className={`px-2 py-1 text-xs font-heading border transition-colors ${
                goldenGoal === "b" ? "bg-yellow-400/20 border-yellow-400 text-yellow-400" : "border-border text-muted-foreground hover:border-yellow-400/50"
              }`}
            >
              {teamB!.name}
            </button>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full mt-3 py-2 bg-secondary text-secondary-foreground font-heading text-lg uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Confirmar
          </button>
          {scoreA && scoreB && parseInt(scoreA) === parseInt(scoreB) && (
            <p className="text-xs text-destructive text-center mt-1">Empate não permitido!</p>
          )}
        </>
      ) : (
        <>
          <div className="p-2 mb-1 border border-border opacity-50">
            <span className="font-heading text-lg">{teamA ? `#${teamA.seed} ${teamA.name}` : "A definir"}</span>
          </div>
          <div className="text-center font-display text-sm text-muted-foreground">VS</div>
          <div className="p-2 mt-1 border border-border opacity-50">
            <span className="font-heading text-lg">{teamB ? `#${teamB.seed} ${teamB.name}` : "A definir"}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center italic">Aguardando...</p>
        </>
      )}
    </motion.div>
  );
};

export default DEMatchCard;
