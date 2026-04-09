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
  goldenGoal?: "a" | "b" | null; // which side scored golden goal
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
  scoreA?: number | null;
  scoreB?: number | null;
  goldenGoal?: "a" | "b" | null;
}

export interface TournamentConfig {
  enableGroupElimination: boolean;
  eliminationCount: 2 | 4; // how many teams eliminated from groups
}

export interface Tournament {
  teams: Team[];
  config: TournamentConfig;
  groupMatches: GroupMatch[];
  standings: Standing[];
  groupPhaseComplete: boolean;
  upperBracket: Match[];
  lowerBracket: Match[];
  grandFinal: Match | null;
  grandFinalReset: Match | null;
  champion: Team | null;
}

// ─── localStorage helpers ───

const STORAGE_KEY = "bikepolo_teams";

export interface StoredTeam {
  id: number;
  name: string;
  players: string[];
}

export function loadTeamsFromStorage(): StoredTeam[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch { return []; }
}

export function saveTeamsToStorage(teams: StoredTeam[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
}

export function storedToTeams(stored: StoredTeam[]): Team[] {
  return stored.map((s, i) => ({
    id: s.id,
    name: s.name,
    players: s.players.map(n => ({ name: n })),
    losses: 0,
    eliminated: false,
    seed: i + 1,
  }));
}

// ─── Group matches ───

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
        goldenGoal: null,
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

export function initTournament(teams: Team[], config: TournamentConfig): Tournament {
  const groupMatches = generateGroupMatches(teams);
  const standings = computeStandings(teams, groupMatches);

  return {
    teams,
    config,
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

export function submitGroupResult(
  tournament: Tournament, matchId: string,
  scoreA: number, scoreB: number,
  goldenGoal?: "a" | "b" | null
): Tournament {
  const t = JSON.parse(JSON.stringify(tournament)) as Tournament;
  const match = t.groupMatches.find(m => m.id === matchId);
  if (!match || match.played) return t;
  match.scoreA = scoreA;
  match.scoreB = scoreB;
  match.played = true;
  match.goldenGoal = goldenGoal || null;
  t.standings = computeStandings(t.teams, t.groupMatches);

  if (t.groupMatches.every(m => m.played)) {
    t.groupPhaseComplete = true;
  }

  return t;
}

// ─── Dynamic Double Elimination bracket generation ───

function nextPowerOf2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

export function startDoubleElimination(tournament: Tournament): Tournament {
  const t = JSON.parse(JSON.stringify(tournament)) as Tournament;
  if (!t.groupPhaseComplete) return t;

  // Determine qualified teams
  let qualifiedCount = t.standings.length;
  if (t.config.enableGroupElimination) {
    qualifiedCount = Math.max(4, t.standings.length - t.config.eliminationCount);
  }
  const qualified = t.standings.slice(0, qualifiedCount).map((s, i) => ({
    ...s.team, seed: i + 1, losses: 0, eliminated: false,
  }));

  // Mark eliminated teams
  t.teams = t.standings.map((s, i) => {
    const team = { ...s.team, seed: i + 1, losses: 0, eliminated: false };
    if (i >= qualifiedCount) team.eliminated = true;
    return team;
  });

  const n = qualified.length;
  const bracketSize = nextPowerOf2(n);
  const byeCount = bracketSize - n;

  // Build UB R1 pairings using standard seeding (1vN, 2v(N-1), etc.)
  const r1MatchCount = bracketSize / 2;
  const ubR1: Match[] = [];
  const byeWinners: { team: Team; targetR2Index: number }[] = [];

  for (let i = 0; i < r1MatchCount; i++) {
    const seedA = i + 1;
    const seedB = bracketSize - i;
    const teamA = seedA <= n ? qualified[seedA - 1] : null;
    const teamB = seedB <= n ? qualified[seedB - 1] : null;

    if (teamA && teamB) {
      ubR1.push({
        id: `U1-${i + 1}`, round: 1, bracket: "upper",
        teamA, teamB, winner: null, loser: null,
      });
    } else if (teamA) {
      // Bye — teamA advances directly
      byeWinners.push({ team: teamA, targetR2Index: Math.floor(i / 2) });
    }
  }

  // Build subsequent UB rounds
  let currentMatchCount = r1MatchCount / 2;
  let ubRound = 2;
  const ubRounds: Match[][] = [ubR1];

  while (currentMatchCount >= 1) {
    const round: Match[] = [];
    for (let i = 0; i < currentMatchCount; i++) {
      round.push({
        id: `U${ubRound}-${i + 1}`, round: ubRound, bracket: "upper",
        teamA: null, teamB: null, winner: null, loser: null,
      });
    }
    ubRounds.push(round);
    currentMatchCount /= 2;
    ubRound++;
    if (currentMatchCount < 1) break;
  }

  // Place bye winners into R2
  for (const bw of byeWinners) {
    const r2 = ubRounds[1];
    if (r2 && r2[bw.targetR2Index]) {
      const m = r2[bw.targetR2Index];
      if (!m.teamA) m.teamA = bw.team;
      else if (!m.teamB) m.teamB = bw.team;
    }
  }

  // Build LB — LB has roughly 2*(ubRoundCount-1) rounds
  const ubTotalRounds = ubRounds.length;
  const lbRounds: Match[][] = [];
  let lbTeamCount = r1MatchCount / 2; // losers from UB R1
  let lbRound = 1;

  // LB alternates: one round of "losers drop in", one round of "internal"
  for (let ubR = 0; ubR < ubTotalRounds - 1; ubR++) {
    // Round where UB losers drop in and face LB winners
    const dropInCount = Math.max(1, Math.ceil(lbTeamCount / 2));
    const dropIn: Match[] = [];
    for (let i = 0; i < dropInCount; i++) {
      dropIn.push({
        id: `L${lbRound}-${i + 1}`, round: lbRound, bracket: "lower",
        teamA: null, teamB: null, winner: null, loser: null,
      });
    }
    lbRounds.push(dropIn);
    lbRound++;

    if (dropInCount > 1) {
      // Internal LB round
      const internalCount = Math.ceil(dropInCount / 2);
      const internal: Match[] = [];
      for (let i = 0; i < internalCount; i++) {
        internal.push({
          id: `L${lbRound}-${i + 1}`, round: lbRound, bracket: "lower",
          teamA: null, teamB: null, winner: null, loser: null,
        });
      }
      lbRounds.push(internal);
      lbRound++;
    }

    lbTeamCount = Math.ceil(lbTeamCount / 2);
    if (lbTeamCount <= 1 && ubR > 0) break;
  }

  t.upperBracket = ubRounds.flat();
  t.lowerBracket = lbRounds.flat();
  t.grandFinal = { id: "GF", round: 1, bracket: "grand-final", teamA: null, teamB: null, winner: null, loser: null };
  t.grandFinalReset = { id: "GFR", round: 2, bracket: "grand-final-reset", teamA: null, teamB: null, winner: null, loser: null };

  return t;
}

// ─── Select winner with score ───

export function selectWinnerWithScore(
  tournament: Tournament, matchId: string, winnerId: number,
  scoreA: number, scoreB: number, goldenGoal?: "a" | "b" | null
): Tournament {
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
  match.scoreA = scoreA;
  match.scoreB = scoreB;
  match.goldenGoal = goldenGoal || null;

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

  // Propagate — dynamic approach
  propagateWinner(t, matchId, winner, loser);

  return t;
}

// Keep legacy for compatibility
export function selectWinner(tournament: Tournament, matchId: string, winnerId: number): Tournament {
  return selectWinnerWithScore(tournament, matchId, winnerId, 0, 0);
}

function propagateWinner(t: Tournament, matchId: string, winner: Team, loser: Team) {
  const ub = (id: string) => t.upperBracket.find(m => m.id === id);
  const lb = (id: string) => t.lowerBracket.find(m => m.id === id);

  // Parse match id
  const ubMatch = matchId.match(/^U(\d+)-(\d+)$/);
  const lbMatch = matchId.match(/^L(\d+)-(\d+)$/);

  if (ubMatch) {
    const round = parseInt(ubMatch[1]);
    const pos = parseInt(ubMatch[2]);
    const nextRoundId = `U${round + 1}-${Math.ceil(pos / 2)}`;
    const nextUB = ub(nextRoundId);
    if (nextUB) {
      if (pos % 2 === 1) nextUB.teamA = { ...winner };
      else nextUB.teamB = { ...winner };
    }

    // Loser goes to lower bracket
    // Find first LB round that has an empty slot and matches the round mapping
    const lbRoundIndex = (round - 1) * 2; // approximate
    const lbRoundsMap = groupByRound(t.lowerBracket);
    const lbRoundIds = Object.keys(lbRoundsMap).map(Number).sort((a, b) => a - b);

    if (lbRoundIndex < lbRoundIds.length) {
      const targetLBRound = lbRoundsMap[lbRoundIds[lbRoundIndex]];
      // Find slot
      for (const m of targetLBRound) {
        if (!m.teamA) { m.teamA = { ...loser }; break; }
        if (!m.teamB) { m.teamB = { ...loser }; break; }
      }
    }

    // Check if it's the UB final (last UB match)
    const maxUBRound = Math.max(...t.upperBracket.map(m => m.round));
    if (round === maxUBRound && t.grandFinal) {
      t.grandFinal.teamA = { ...winner };
      // Loser goes to LB final
      const lastLB = t.lowerBracket[t.lowerBracket.length - 1];
      if (lastLB && !lastLB.teamA) lastLB.teamA = { ...loser };
      else if (lastLB && !lastLB.teamB) lastLB.teamB = { ...loser };
    }
  }

  if (lbMatch) {
    const round = parseInt(lbMatch[1]);
    const pos = parseInt(lbMatch[2]);
    // Find next LB match
    const lbRoundsMap = groupByRound(t.lowerBracket);
    const lbRoundIds = Object.keys(lbRoundsMap).map(Number).sort((a, b) => a - b);
    const currentIdx = lbRoundIds.indexOf(round);

    if (currentIdx < lbRoundIds.length - 1) {
      const nextRound = lbRoundsMap[lbRoundIds[currentIdx + 1]];
      const targetIdx = Math.floor((pos - 1) / 2);
      const target = nextRound[Math.min(targetIdx, nextRound.length - 1)];
      if (target) {
        if (!target.teamA) target.teamA = { ...winner };
        else if (!target.teamB) target.teamB = { ...winner };
      }
    } else {
      // This is the LB final — winner goes to grand final
      if (t.grandFinal) {
        t.grandFinal.teamB = { ...winner };
      }
    }
  }

  if (matchId === "GF") {
    if (winner.id === t.grandFinal?.teamB?.id) {
      // Lower bracket winner won — need reset
      if (t.grandFinalReset) {
        t.grandFinalReset.teamA = { ...t.grandFinal!.teamA! };
        t.grandFinalReset.teamB = { ...t.grandFinal!.teamB! };
      }
    } else {
      t.champion = winner;
    }
  }
  if (matchId === "GFR") {
    t.champion = winner;
  }
}

function groupByRound(matches: Match[]): Record<number, Match[]> {
  const map: Record<number, Match[]> = {};
  for (const m of matches) {
    if (!map[m.round]) map[m.round] = [];
    map[m.round].push(m);
  }
  return map;
}

// Legacy exports for compatibility
export function generateTeams(): Team[] {
  const TEAM_NAMES = [
    "Pedal Fury", "Chain Breakers", "Spoke Demons", "Crank Lords", "Wheel Wolves",
    "Saddle Sharks", "Hub Hustlers", "Gear Ghosts", "Rim Reapers", "Axle Assassins",
  ];
  const PLAYER_NAMES = [
    "Lucas", "Pedro", "João", "Mateus", "Rafael", "Bruno", "Felipe", "Thiago",
    "Gustavo", "André", "Carlos", "Diego", "Eduardo", "Fábio", "Gabriel",
    "Henrique", "Igor", "Julio", "Kaio", "Leandro", "Marcos", "Nicolas",
    "Otávio", "Paulo", "Renato", "Samuel", "Tiago", "Vinícius", "Wagner", "Yuri",
  ];

  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

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
