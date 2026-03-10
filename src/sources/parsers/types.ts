export type DashedScore = `${number}-${number}`;
export type JsonData = {
  fixtures: Fixtures[];
};
export type Fixtures = {
  matchId: string;
  homeId: string;
  awayId: string;
  homeName: string;
  awayName: string;
  score: DashedScore;
  date: string;
};
