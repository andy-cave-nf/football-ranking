import type { SourceTeam } from '../sources/types';

export type Result = {
  home: SourceTeam;
  away: SourceTeam;
  homeWin: 1 | 0 | 0.5;
  date: Date;
};
export type Team = {
  id: string;
  name: string;
  mu: number;
  sigma: number;
  lastFixtureDate: Date;
};

export type Standing = {
  name: string
  skill: number
  mu: number
  sigma: number
}