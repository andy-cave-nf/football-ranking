export type DashedScore = `${number}-${number}`;
export type JsonData = {
  fixtures: JsonFixtures[];
};
export type JsonFixtures = {
  matchId: string;
  homeId: string;
  awayId: string;
  homeName: string;
  awayName: string;
  score: DashedScore;
  date: string;
};
