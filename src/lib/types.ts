// Domain types for the application

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

export interface TournamentMeta {
  id: string;
  name: string;
  status: "draft" | "groups" | "bracket" | "finished";
  enableGroupElimination: boolean;
  eliminationCount: 2 | 4;
  createdAt: string;
}

export interface TournamentTeam {
  id: string;
  tournamentId: string;
  name: string;
  playerIds: string[];
}
