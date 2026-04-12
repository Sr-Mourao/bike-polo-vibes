// localStorage-based data store for all modules

export interface Club {
  id: string;
  name: string;
  createdAt: string;
}

export interface Player {
  id: string;
  name: string;
  nickname?: string;
  clubId: string;
}

export interface TournamentData {
  id: string;
  name: string;
  createdAt: string;
  status: "draft" | "groups" | "bracket" | "finished";
  config: {
    enableGroupElimination: boolean;
    eliminationCount: 2 | 4;
  };
  teams: TournamentTeam[];
  // serialized tournament state from tournament.ts
  tournamentState?: string;
}

export interface TournamentTeam {
  id: number;
  name: string;
  playerIds: string[];
}

// Auth
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  provider: "email" | "google";
}

const KEYS = {
  auth: "bikepolo_auth",
  clubs: "bikepolo_clubs",
  players: "bikepolo_players",
  tournaments: "bikepolo_tournaments",
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Auth
export function getAuthUser(): AuthUser | null { return load(KEYS.auth, null); }
export function setAuthUser(user: AuthUser | null) { save(KEYS.auth, user); }

// Clubs
export function getClubs(): Club[] { return load(KEYS.clubs, []); }
export function saveClubs(clubs: Club[]) { save(KEYS.clubs, clubs); }

export function addClub(name: string): Club {
  const clubs = getClubs();
  const club: Club = { id: crypto.randomUUID(), name, createdAt: new Date().toISOString() };
  clubs.push(club);
  saveClubs(clubs);
  return club;
}

export function updateClub(id: string, name: string) {
  const clubs = getClubs().map(c => c.id === id ? { ...c, name } : c);
  saveClubs(clubs);
}

export function deleteClub(id: string) {
  saveClubs(getClubs().filter(c => c.id !== id));
  // Also remove players from this club
  savePlayers(getPlayers().filter(p => p.clubId !== id));
}

// Players
export function getPlayers(): Player[] { return load(KEYS.players, []); }
export function savePlayers(players: Player[]) { save(KEYS.players, players); }

export function addPlayer(name: string, clubId: string, nickname?: string): Player {
  const players = getPlayers();
  const player: Player = { id: crypto.randomUUID(), name, clubId, nickname: nickname || undefined };
  players.push(player);
  savePlayers(players);
  return player;
}

export function updatePlayer(id: string, data: Partial<Pick<Player, "name" | "nickname" | "clubId">>) {
  const players = getPlayers().map(p => p.id === id ? { ...p, ...data } : p);
  savePlayers(players);
}

export function deletePlayer(id: string) {
  savePlayers(getPlayers().filter(p => p.id !== id));
}

// Tournaments
export function getTournaments(): TournamentData[] { return load(KEYS.tournaments, []); }
export function saveTournaments(t: TournamentData[]) { save(KEYS.tournaments, t); }

export function addTournament(name: string, config: TournamentData["config"]): TournamentData {
  const tournaments = getTournaments();
  const t: TournamentData = {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
    status: "draft",
    config,
    teams: [],
  };
  tournaments.push(t);
  saveTournaments(tournaments);
  return t;
}

export function updateTournament(id: string, data: Partial<TournamentData>) {
  const tournaments = getTournaments().map(t => t.id === id ? { ...t, ...data } : t);
  saveTournaments(tournaments);
}

export function deleteTournament(id: string) {
  saveTournaments(getTournaments().filter(t => t.id !== id));
}
