export type JsonData = {
  teams: {
    id: string;
    name: string;
  }[];
  fixtures: {
    matchId: string;
    homeId: string;
    awayId: string;
    score: string;
    date: Date;
  }[];
};

export interface Match {
  id: number|string;
}