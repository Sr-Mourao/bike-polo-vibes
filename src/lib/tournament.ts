// Tournament types and logic

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

export interface GroupMatch {
  id: string;
  teamA: Team;
  teamB: Team;
  scoreA: number | null;
  scoreB: number | null;
  played: boolean;
}

export interface Standing {
  team: Team;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
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
  groupMatches: GroupMatch[];
  standings: Standing[];
  groupPhaseComplete: boolean;
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
    const count = 3 + Math.floor(Math.random() * 2);
    const teamPlayers = players.slice(pi, pi + count).map(n => ({ name: n }));
    pi += count;
    return { id: i + 1, name, players: teamPlayers, losses: 0, eliminated: false, seed: i + 1 };
  });
}

// Generate round-robin group matches
export function generateGroupMatches(teams: Team[]): GroupMatch[] {
  const matches: GroupMatch[] = [];
  let id = 1;
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({
        id: `G${id++}`,
        teamA: teams[i],
        teamB: teams[j],
        scoreA: null,
        scoreB: null,
        played: false,
      });
    }
  }
  return matches;
}

export function computeStandings(teams: Team[], matches: GroupMatch[]): Standing[] {
  const map = new Map<number, Standing>();
  teams.forEach(t => map.set(t.id, {
    team: t, played: 0, wins: 0, draws: 0, losses: 0,
    goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0,
  }));

  matches.filter(m => m.played).forEach(m => {
    const a = map.get(m.teamA.id)!;
    const b = map.get(m.teamB.id)!;
    a.played++; b.played++;
    a.goalsFor += m.scoreA!; a.goalsAgainst += m.scoreB!;
    b.goalsFor += m.scoreB!; b.goalsAgainst += m.scoreA!;
    if (m.scoreA! > m.scoreB!) { a.wins++; b.losses++; a.points += 3; }
    else if (m.scoreA! < m.scoreB!) { b.wins++; a.losses++; b.points += 3; }
    else { a.draws++; b.draws++; a.points += 1; b.points += 1; }
  });

  map.forEach(s => { s.goalDiff = s.goalsFor - s.goalsAgainst; });

  return Array.from(map.values()).sort((a, b) =>
    b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor
  );
}

export function initTournament(teams: Team[]): Tournament {
  const groupMatches = generateGroupMatches(teams);
  const standings = computeStandings(teams, groupMatches);

  return {
    teams,
    groupMatches,
    standings,
    groupPhaseComplete: false,
    upperBracket: [],
    lowerBracket: [],
    grandFinal: null,
    grandFinalReset: null,
    champion: null,
  };
}

export function submitGroupResult(tournament: Tournament, matchId: string, scoreA: number, scoreB: number): Tournament {
  const t = JSON.parse(JSON.stringify(tournament)) as Tournament;
  const match = t.groupMatches.find(m => m.id === matchId);
  if (!match || match.played) return t;
  match.scoreA = scoreA;
  match.scoreB = scoreB;
  match.played = true;
  t.standings = computeStandings(t.teams, t.groupMatches);

  // Check if all group matches played
  if (t.groupMatches.every(m => m.played)) {
    t.groupPhaseComplete = true;
  }

  return t;
}

export function startDoubleElimination(tournament: Tournament): Tournament {
  const t = JSON.parse(JSON.stringify(tournament)) as Tournament;
  if (!t.groupPhaseComplete) return t;

  // Use standings to seed: top 10 ranked
  const ranked = t.standings.map((s, i) => ({ ...s.team, seed: i + 1, losses: 0, eliminated: false }));
  t.teams = ranked;

  // UB R1: 3v7, 4v8, 5v9, 6v10 — seeds 1,2 get bye
  const upper1: Match[] = [
    { id: "U1-1", round: 1, bracket: "upper", teamA: ranked[2], teamB: ranked[6], winner: null, loser: null },
    { id: "U1-2", round: 1, bracket: "upper", teamA: ranked[3], teamB: ranked[7], winner: null, loser: null },
    { id: "U1-3", round: 1, bracket: "upper", teamA: ranked[4], teamB: ranked[8], winner: null, loser: null },
    { id: "U1-4", round: 1, bracket: "upper", teamA: ranked[5], teamB: ranked[9], winner: null, loser: null },
  ];
  const upper2: Match[] = [
    { id: "U2-1", round: 2, bracket: "upper", teamA: ranked[0], teamB: null, winner: null, loser: null },
    { id: "U2-2", round: 2, bracket: "upper", teamA: ranked[1], teamB: null, winner: null, loser: null },
    { id: "U2-3", round: 2, bracket: "upper", teamA: null, teamB: null, winner: null, loser: null },
  ];
  const upperSemi: Match = { id: "U3-1", round: 3, bracket: "upper", teamA: null, teamB: null, winner: null, loser: null };
  const upperFinal: Match = { id: "U4-1", round: 4, bracket: "upper", teamA: null, teamB: null, winner: null, loser: null };

  const lower1: Match[] = [
    { id: "L1-1", round: 1, bracket: "lower", teamA: null, teamB: null, winner: null, loser: null },
    { id: "L1-2", round: 1, bracket: "lower", teamA: null, teamB: null, winner: null, loser: null },
  ];
  const lower2: Match[] = [
    { id: "L2-1", round: 2, bracket: "lower", teamA: null, teamB: null, winner: null, loser: null },
    { id: "L2-2", round: 2, bracket: "lower", teamA: null, teamB: null, winner: null, loser: null },
  ];
  const lower3: Match = { id: "L3-1", round: 3, bracket: "lower", teamA: null, teamB: null, winner: null, loser: null };
  const lower4: Match = { id: "L4-1", round: 4, bracket: "lower", teamA: null, teamB: null, winner: null, loser: null };
  const lowerSemi: Match = { id: "L5-1", round: 5, bracket: "lower", teamA: null, teamB: null, winner: null, loser: null };
  const lowerFinal: Match = { id: "L6-1", round: 6, bracket: "lower", teamA: null, teamB: null, winner: null, loser: null };

  t.upperBracket = [...upper1, ...upper2, upperSemi, upperFinal];
  t.lowerBracket = [...lower1, ...lower2, lower3, lower4, lowerSemi, lowerFinal];
  t.grandFinal = { id: "GF", round: 1, bracket: "grand-final", teamA: null, teamB: null, winner: null, loser: null };
  t.grandFinalReset = { id: "GFR", round: 2, bracket: "grand-final-reset", teamA: null, teamB: null, winner: null, loser: null };

  return t;
}

export function selectWinner(tournament: Tournament, matchId: string, winnerId: number): Tournament {
  const t = JSON.parse(JSON.stringify(tournament)) as Tournament;
  const allMatches = [...t.upperBracket, ...t.lowerBracket];
  if (t.grandFinal) allMatches.push(t.grandFinal);
  if (t.grandFinalReset) allMatches.push(t.grandFinalReset);

  const match = allMatches.find(m => m.id === matchId);
  if (!match || !match.teamA || !match.teamB || match.winner) return t;

  const winner = match.teamA.id === winnerId ? match.teamA : match.teamB;
  const loser = match.teamA.id === winnerId ? match.teamB : match.teamA;
  match.winner = winner;
  match.loser = loser;

  const teamInList = t.teams.find(tm => tm.id === loser.id);
  if (teamInList) {
    teamInList.losses++;
    if (teamInList.losses >= 2) teamInList.eliminated = true;
  }
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

  const ub = (id: string) => t.upperBracket.find(m => m.id === id);
  const lb = (id: string) => t.lowerBracket.find(m => m.id === id);

  if (matchId === "U1-1") { const u = ub("U2-1"); if (u) u.teamB = { ...winner }; const l = lb("L1-1"); if (l) l.teamA = { ...loser }; }
  if (matchId === "U1-2") { const u = ub("U2-2"); if (u) u.teamB = { ...winner }; const l = lb("L1-1"); if (l) l.teamB = { ...loser }; }
  if (matchId === "U1-3") { const u = ub("U2-3"); if (u) u.teamA = { ...winner }; const l = lb("L1-2"); if (l) l.teamA = { ...loser }; }
  if (matchId === "U1-4") { const u = ub("U2-3"); if (u) u.teamB = { ...winner }; const l = lb("L1-2"); if (l) l.teamB = { ...loser }; }

  if (matchId === "U2-1") { const s = ub("U3-1"); if (s) s.teamA = { ...winner }; const l = lb("L2-2"); if (l) l.teamB = { ...loser }; }
  if (matchId === "U2-2") { const f = ub("U4-1"); if (f) f.teamB = { ...winner }; const l = lb("L4-1"); if (l) l.teamB = { ...loser }; }
  if (matchId === "U2-3") { const s = ub("U3-1"); if (s) s.teamB = { ...winner }; const l = lb("L2-1"); if (l) l.teamB = { ...loser }; }

  if (matchId === "U3-1") { const f = ub("U4-1"); if (f) f.teamA = { ...winner }; const l = lb("L5-1"); if (l) l.teamB = { ...loser }; }
  if (matchId === "U4-1") { if (t.grandFinal) t.grandFinal.teamA = { ...winner }; const l = lb("L6-1"); if (l) l.teamB = { ...loser }; }

  if (matchId === "L1-1") { const l = lb("L2-1"); if (l) l.teamA = { ...winner }; }
  if (matchId === "L1-2") { const l = lb("L2-2"); if (l) l.teamA = { ...winner }; }
  if (matchId === "L2-1") { const l = lb("L3-1"); if (l) l.teamA = { ...winner }; }
  if (matchId === "L2-2") { const l = lb("L3-1"); if (l) l.teamB = { ...winner }; }
  if (matchId === "L3-1") { const l = lb("L4-1"); if (l) l.teamA = { ...winner }; }
  if (matchId === "L4-1") { const l = lb("L5-1"); if (l) l.teamA = { ...winner }; }
  if (matchId === "L5-1") { const l = lb("L6-1"); if (l) l.teamA = { ...winner }; }
  if (matchId === "L6-1") { if (t.grandFinal) t.grandFinal.teamB = { ...winner }; }

  if (matchId === "GF") {
    if (match.teamB?.id === winner.id) {
      if (t.grandFinalReset) { t.grandFinalReset.teamA = { ...match.teamA! }; t.grandFinalReset.teamB = { ...match.teamB! }; }
    } else { t.champion = winner; }
  }
  if (matchId === "GFR") { t.champion = winner; }

  return t;
}
