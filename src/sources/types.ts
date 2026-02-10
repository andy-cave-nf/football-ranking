export type DashedScore = `${number}-${number}`;

export type JsonData = {
  teams: JsonTeams[];
  fixtures: JsonFixtures[];
};

export type JsonTeams = {
  id: string;
  name: string;
}
export type JsonFixtures = {
  matchId: string;
  homeId: string;
  awayId: string;
  score: DashedScore;
  date: string;
}



export interface Match {
  id: number|string;
}

export interface SourceTeam {
  id: number|string;
  name: string;
}