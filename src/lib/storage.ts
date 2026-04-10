import type { Club, Player, TournamentMeta, TournamentTeam } from "./types";

// Generic localStorage helpers
function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Clubs ───
const CLUBS_KEY = "bp_clubs";

export function loadClubs(): Club[] { return load<Club>(CLUBS_KEY); }
export function saveClubs(clubs: Club[]) { save(CLUBS_KEY, clubs); }

export function addClub(name: string): Club {
  const clubs = loadClubs();
  const club: Club = { id: crypto.randomUUID(), name, createdAt: new Date().toISOString() };
  clubs.push(club);
  saveClubs(clubs);
  return club;
}

export function updateClub(id: string, name: string) {
  const clubs = loadClubs().map(c => c.id === id ? { ...c, name } : c);
  saveClubs(clubs);
}

export function deleteClub(id: string) {
  saveClubs(loadClubs().filter(c => c.id !== id));
  // Also remove players from this club
  savePlayers(loadPlayers().filter(p => p.clubId !== id));
}

// ─── Players ───
const PLAYERS_KEY = "bp_players";

export function loadPlayers(): Player[] { return load<Player>(PLAYERS_KEY); }
export function savePlayers(players: Player[]) { save(PLAYERS_KEY, players); }

export function addPlayer(name: string, clubId: string, nickname?: string): Player {
  const players = loadPlayers();
  const player: Player = { id: crypto.randomUUID(), name, nickname: nickname || undefined, clubId };
  players.push(player);
  savePlayers(players);
  return player;
}

export function updatePlayer(id: string, data: Partial<Pick<Player, "name" | "nickname" | "clubId">>) {
  const players = loadPlayers().map(p => p.id === id ? { ...p, ...data } : p);
  savePlayers(players);
}

export function deletePlayer(id: string) {
  savePlayers(loadPlayers().filter(p => p.id !== id));
}

// ─── Tournaments ───
const TOURNAMENTS_KEY = "bp_tournaments";

export function loadTournaments(): TournamentMeta[] { return load<TournamentMeta>(TOURNAMENTS_KEY); }
export function saveTournaments(tournaments: TournamentMeta[]) { save(TOURNAMENTS_KEY, tournaments); }

export function addTournament(data: Omit<TournamentMeta, "id" | "createdAt" | "status">): TournamentMeta {
  const tournaments = loadTournaments();
  const t: TournamentMeta = {
    id: crypto.randomUUID(),
    ...data,
    status: "draft",
    createdAt: new Date().toISOString(),
  };
  tournaments.push(t);
  saveTournaments(tournaments);
  return t;
}

export function updateTournament(id: string, data: Partial<TournamentMeta>) {
  const tournaments = loadTournaments().map(t => t.id === id ? { ...t, ...data } : t);
  saveTournaments(tournaments);
}

export function deleteTournament(id: string) {
  saveTournaments(loadTournaments().filter(t => t.id !== id));
  // Remove teams for this tournament
  saveTournamentTeams(loadTournamentTeams().filter(t => t.tournamentId !== id));
  // Remove tournament state
  localStorage.removeItem(`bp_tournament_state_${id}`);
}

// ─── Tournament Teams ───
const TEAMS_KEY = "bp_tournament_teams";

export function loadTournamentTeams(): TournamentTeam[] { return load<TournamentTeam>(TEAMS_KEY); }
export function saveTournamentTeams(teams: TournamentTeam[]) { save(TEAMS_KEY, teams); }

export function getTeamsForTournament(tournamentId: string): TournamentTeam[] {
  return loadTournamentTeams().filter(t => t.tournamentId === tournamentId);
}

export function addTournamentTeam(tournamentId: string, name: string, playerIds: string[]): TournamentTeam {
  const teams = loadTournamentTeams();
  const team: TournamentTeam = { id: crypto.randomUUID(), tournamentId, name, playerIds };
  teams.push(team);
  saveTournamentTeams(teams);
  return team;
}

export function updateTournamentTeam(id: string, data: Partial<Pick<TournamentTeam, "name" | "playerIds">>) {
  const teams = loadTournamentTeams().map(t => t.id === id ? { ...t, ...data } : t);
  saveTournamentTeams(teams);
}

export function deleteTournamentTeam(id: string) {
  saveTournamentTeams(loadTournamentTeams().filter(t => t.id !== id));
}

// ─── Tournament State (full game state) ───
export function saveTournamentState(tournamentId: string, state: unknown) {
  localStorage.setItem(`bp_tournament_state_${tournamentId}`, JSON.stringify(state));
}

export function loadTournamentState(tournamentId: string): unknown | null {
  try {
    const raw = localStorage.getItem(`bp_tournament_state_${tournamentId}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
