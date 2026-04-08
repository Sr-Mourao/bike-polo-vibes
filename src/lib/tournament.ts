// Tournament types and logic for Double Elimination

export interface Player {
  name: string;
}

export interface Team {
  id: number;
  name: string;
  players: Player[];
  losses: number;
  eliminated: boolean;
  seed: number;
}

export interface Match {
  id: string;
  round: number;
  bracket: "upper" | "lower" | "grand-final" | "grand-final-reset";
  teamA: Team | null;
  teamB: Team | null;
  winner: Team | null;
  loser: Team | null;
}

export interface Tournament {
  teams: Team[];
  upperBracket: Match[];
  lowerBracket: Match[];
  grandFinal: Match | null;
  grandFinalReset: Match | null;
  champion: Team | null;
}

const TEAM_NAMES = [
  "Pedal Fury", "Chain Breakers", "Spoke Demons", "Crank Lords", "Wheel Wolves",
  "Saddle Sharks", "Hub Hustlers", "Gear Ghosts", "Rim Reapers", "Axle Assassins",
  "Brake Bandits", "Tire Titans", "Frame Fighters", "Bar Brawlers", "Stem Strikers",
];

const PLAYER_NAMES = [
  "Lucas", "Pedro", "João", "Mateus", "Rafael", "Bruno", "Felipe", "Thiago",
  "Gustavo", "André", "Carlos", "Diego", "Eduardo", "Fábio", "Gabriel",
  "Henrique", "Igor", "Julio", "Kaio", "Leandro", "Marcos", "Nicolas",
  "Otávio", "Paulo", "Renato", "Samuel", "Tiago", "Vinícius", "Wagner", "Yuri",
  "Ana", "Beatriz", "Camila", "Daniela", "Elena", "Fernanda", "Gisele",
  "Helena", "Isabela", "Juliana",
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateTeams(): Team[] {
  const names = shuffle(TEAM_NAMES).slice(0, 10);
  const players = shuffle(PLAYER_NAMES);
  let pi = 0;

  return names.map((name, i) => {
    const count = 3 + Math.floor(Math.random() * 2); // 3 or 4
    const teamPlayers = players.slice(pi, pi + count).map(n => ({ name: n }));
    pi += count;
    return {
      id: i + 1,
      name,
      players: teamPlayers,
      losses: 0,
      eliminated: false,
      seed: i + 1,
    };
  });
}

export function initTournament(teams: Team[]): Tournament {
  // Seeds 1-10 based on array order
  // Upper Bracket Round 1: 3v7, 4v8, 5v9, 6v10
  const upper1: Match[] = [
    { id: "U1-1", round: 1, bracket: "upper", teamA: teams[2], teamB: teams[6], winner: null, loser: null },
    { id: "U1-2", round: 1, bracket: "upper", teamA: teams[3], teamB: teams[7], winner: null, loser: null },
    { id: "U1-3", round: 1, bracket: "upper", teamA: teams[4], teamB: teams[8], winner: null, loser: null },
    { id: "U1-4", round: 1, bracket: "upper", teamA: teams[5], teamB: teams[9], winner: null, loser: null },
  ];

  // Upper Bracket Round 2: Seed1 vs winner(U1-1), Seed2 vs winner(U1-2)
  // Plus: winner(U1-3) vs winner(U1-4)
  // Actually for 10 teams with 2 byes, UB R2 has:
  // Seed1 vs W(3v7), Seed2 vs W(4v8), W(5v9) vs W(6v10)
  // That's 3 matches -> then UB R3 semifinal needs adjustment
  // Let's do: UB R2: [Seed1 vs W(U1-4)], [Seed2 vs W(U1-3)], [W(U1-1) vs W(U1-2)]
  // UB R3 (semis): W(UBR2-1) vs W(UBR2-3), or just top half vs bottom half
  // Simpler: 
  // UB R2: Seed1 vs W(3v7), Seed2 vs W(4v8) -- byes play winners of first matches
  //         W(5v9) vs W(6v10)
  // UB R3 (semi): W(S1 match) vs W(5v9 vs 6v10 winner match)
  //               W(S2 match) -> wait that's only 3 in R2
  // 
  // Standard approach for 10 teams:
  // UB R2 (4 matches -> but we only have 6 teams left): 
  // Actually: after R1 we have 4 winners + 2 byes = 6 teams
  // UB R2: S1 vs W(U1-1), S2 vs W(U1-2), W(U1-3) vs W(U1-4) = 3 matches
  // UB R3: need to get to 1 winner. 3 winners from R2 is odd.
  // 
  // Better bracket: 
  // UB R1: 3v10, 4v9, 5v8, 6v7 (standard seeding)
  // UB R2: 1 vs W(4v9), 2 vs W(3v10), W(5v8) vs W(6v7) -- still 3
  // 
  // Let me use the user's specified pairings and handle 3 R2 matches:
  // UB R2: S1 vs W(U1-1=3v7), S2 vs W(U1-2=4v8), W(U1-3=5v9) vs W(U1-4=6v10)
  // UB R3 Semi: W(R2-1) vs W(R2-3)  (the odd one gets paired)
  // UB R3 has W(R2-2) with a bye to UB Final? No... 
  // Actually with 3 R2 winners we need: Semi = 2 matches? No.
  // One approach: R2 match 2 winner goes directly to UB Final, R2-1 and R2-3 play semi
  // UB Semi: W(R2-1) vs W(R2-3)
  // UB Final: W(Semi) vs W(R2-2)
  
  const upper2: Match[] = [
    { id: "U2-1", round: 2, bracket: "upper", teamA: teams[0], teamB: null, winner: null, loser: null }, // S1 vs W(3v7)
    { id: "U2-2", round: 2, bracket: "upper", teamA: teams[1], teamB: null, winner: null, loser: null }, // S2 vs W(4v8)
    { id: "U2-3", round: 2, bracket: "upper", teamA: null, teamB: null, winner: null, loser: null },     // W(5v9) vs W(6v10)
  ];

  const upperSemi: Match = { id: "U3-1", round: 3, bracket: "upper", teamA: null, teamB: null, winner: null, loser: null }; // W(U2-1) vs W(U2-3)
  const upperFinal: Match = { id: "U4-1", round: 4, bracket: "upper", teamA: null, teamB: null, winner: null, loser: null }; // W(U3-1) vs W(U2-2)

  // Lower Bracket builds as losers drop down. We'll create matches dynamically.
  // LB R1: L(U1-1) vs L(U1-2), L(U1-3) vs L(U1-4) = 2 matches
  // LB R2: L(U2-1) vs W(LB1-1), L(U2-2) vs W(LB1-2) -- but we have 3 upper R2 losers and 2 LB R1 winners
  // L(U2-3) also drops. So LB R2: 
  //   W(LB1-1) vs L(U2-3), W(LB1-2) vs L(U2-1) -- and L(U2-2) gets a complex path
  // This is getting complex. Let me pre-define all matches.

  const lower1: Match[] = [
    { id: "L1-1", round: 1, bracket: "lower", teamA: null, teamB: null, winner: null, loser: null }, // L(U1-1) vs L(U1-2)
    { id: "L1-2", round: 1, bracket: "lower", teamA: null, teamB: null, winner: null, loser: null }, // L(U1-3) vs L(U1-4)
  ];

  const lower2: Match[] = [
    { id: "L2-1", round: 2, bracket: "lower", teamA: null, teamB: null, winner: null, loser: null }, // W(L1-1) vs L(U2-3)
    { id: "L2-2", round: 2, bracket: "lower", teamA: null, teamB: null, winner: null, loser: null }, // W(L1-2) vs L(U2-1)
  ];

  // L(U2-2) drops to LB R3
  const lower3: Match = { id: "L3-1", round: 3, bracket: "lower", teamA: null, teamB: null, winner: null, loser: null }; // W(L2-1) vs W(L2-2)
  const lower4: Match = { id: "L4-1", round: 4, bracket: "lower", teamA: null, teamB: null, winner: null, loser: null }; // W(L3-1) vs L(U2-2)
  const lowerSemi: Match = { id: "L5-1", round: 5, bracket: "lower", teamA: null, teamB: null, winner: null, loser: null }; // W(L4-1) vs L(U3-1)
  const lowerFinal: Match = { id: "L6-1", round: 6, bracket: "lower", teamA: null, teamB: null, winner: null, loser: null }; // W(L5-1) vs L(U4-1)

  const grandFinal: Match = { id: "GF", round: 1, bracket: "grand-final", teamA: null, teamB: null, winner: null, loser: null };
  const grandFinalReset: Match = { id: "GFR", round: 2, bracket: "grand-final-reset", teamA: null, teamB: null, winner: null, loser: null };

  return {
    teams,
    upperBracket: [...upper1, ...upper2, upperSemi, upperFinal],
    lowerBracket: [...lower1, ...lower2, lower3, lower4, lowerSemi, lowerFinal],
    grandFinal,
    grandFinalReset,
    champion: null,
  };
}

function getMatch(matches: Match[], id: string): Match | undefined {
  return matches.find(m => m.id === id);
}

export function selectWinner(tournament: Tournament, matchId: string, winnerId: number): Tournament {
  const t = JSON.parse(JSON.stringify(tournament)) as Tournament;
  const allMatches = [...t.upperBracket, ...t.lowerBracket];
  if (t.grandFinal) allMatches.push(t.grandFinal);
  if (t.grandFinalReset) allMatches.push(t.grandFinalReset);

  const match = allMatches.find(m => m.id === matchId);
  if (!match || !match.teamA || !match.teamB) return t;
  if (match.winner) return t; // already decided

  const winner = match.teamA.id === winnerId ? match.teamA : match.teamB;
  const loser = match.teamA.id === winnerId ? match.teamB : match.teamA;
  match.winner = winner;
  match.loser = loser;

  // Update team losses
  const teamInList = t.teams.find(tm => tm.id === loser.id);
  if (teamInList) {
    teamInList.losses++;
    if (teamInList.losses >= 2) teamInList.eliminated = true;
  }

  // Also update the loser object
  loser.losses = (loser.losses || 0) + 1;
  if (loser.losses >= 2) loser.eliminated = true;

  // Write back
  const writeBack = (id: string, m: Match) => {
    const ui = t.upperBracket.findIndex(x => x.id === id);
    if (ui >= 0) { t.upperBracket[ui] = m; return; }
    const li = t.lowerBracket.findIndex(x => x.id === id);
    if (li >= 0) { t.lowerBracket[li] = m; return; }
    if (t.grandFinal?.id === id) { t.grandFinal = m; return; }
    if (t.grandFinalReset?.id === id) { t.grandFinalReset = m; return; }
  };
  writeBack(matchId, match);

  // Propagate winners/losers
  const ub = (id: string) => t.upperBracket.find(m => m.id === id);
  const lb = (id: string) => t.lowerBracket.find(m => m.id === id);

  // Upper R1 -> Upper R2 and Lower R1
  if (matchId === "U1-1") {
    const u21 = ub("U2-1"); if (u21) u21.teamB = { ...winner };
    const l11 = lb("L1-1"); if (l11) l11.teamA = { ...loser };
  }
  if (matchId === "U1-2") {
    const u22 = ub("U2-2"); if (u22) u22.teamB = { ...winner };
    const l11 = lb("L1-1"); if (l11) l11.teamB = { ...loser };
  }
  if (matchId === "U1-3") {
    const u23 = ub("U2-3"); if (u23) u23.teamA = { ...winner };
    const l12 = lb("L1-2"); if (l12) l12.teamA = { ...loser };
  }
  if (matchId === "U1-4") {
    const u23 = ub("U2-3"); if (u23) u23.teamB = { ...winner };
    const l12 = lb("L1-2"); if (l12) l12.teamB = { ...loser };
  }

  // Upper R2 -> Upper Semi/Final and Lower R2
  if (matchId === "U2-1") {
    const us = ub("U3-1"); if (us) us.teamA = { ...winner };
    const l22 = lb("L2-2"); if (l22) l22.teamB = { ...loser };
  }
  if (matchId === "U2-2") {
    const uf = ub("U4-1"); if (uf) uf.teamB = { ...winner };
    const l41 = lb("L4-1"); if (l41) l41.teamB = { ...loser };
  }
  if (matchId === "U2-3") {
    const us = ub("U3-1"); if (us) us.teamB = { ...winner };
    const l21 = lb("L2-1"); if (l21) l21.teamB = { ...loser };
  }

  // Upper Semi -> Upper Final and Lower Semi
  if (matchId === "U3-1") {
    const uf = ub("U4-1"); if (uf) uf.teamA = { ...winner };
    const ls = lb("L5-1"); if (ls) ls.teamB = { ...loser };
  }

  // Upper Final -> Grand Final and Lower Final
  if (matchId === "U4-1") {
    if (t.grandFinal) t.grandFinal.teamA = { ...winner };
    const lf = lb("L6-1"); if (lf) lf.teamB = { ...loser };
  }

  // Lower R1 -> Lower R2
  if (matchId === "L1-1") {
    const l21 = lb("L2-1"); if (l21) l21.teamA = { ...winner };
  }
  if (matchId === "L1-2") {
    const l22 = lb("L2-2"); if (l22) l22.teamA = { ...winner };
  }

  // Lower R2 -> Lower R3
  if (matchId === "L2-1") {
    const l3 = lb("L3-1"); if (l3) l3.teamA = { ...winner };
  }
  if (matchId === "L2-2") {
    const l3 = lb("L3-1"); if (l3) l3.teamB = { ...winner };
  }

  // Lower R3 -> Lower R4
  if (matchId === "L3-1") {
    const l4 = lb("L4-1"); if (l4) l4.teamA = { ...winner };
  }

  // Lower R4 -> Lower Semi
  if (matchId === "L4-1") {
    const ls = lb("L5-1"); if (ls) ls.teamA = { ...winner };
  }

  // Lower Semi -> Lower Final
  if (matchId === "L5-1") {
    const lf = lb("L6-1"); if (lf) lf.teamA = { ...winner };
  }

  // Lower Final -> Grand Final
  if (matchId === "L6-1") {
    if (t.grandFinal) t.grandFinal.teamB = { ...winner };
  }

  // Grand Final
  if (matchId === "GF") {
    // If lower bracket team wins, reset
    if (winner.losses > 0 || match.teamB?.id === winner.id) {
      // Lower bracket team won -> grand final reset
      if (t.grandFinalReset) {
        t.grandFinalReset.teamA = { ...match.teamA! };
        t.grandFinalReset.teamB = { ...match.teamB! };
      }
    } else {
      t.champion = winner;
    }
  }

  if (matchId === "GFR") {
    t.champion = winner;
  }

  return t;
}
