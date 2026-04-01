import type { FixtureQuery } from './api_source/api_source';

export interface SourceTeam {
  id: string;
  name: string;
}

export type ApiResponse = {
  get: string;
  parameters: FixtureQuery;
  errors: string[];
  results: number;
  paging: { current: number; total: number };
  response: FixtureResponse[];
};

export type FixtureResponse = {
  fixture: Fixture;
  league: League;
  teams: { home: TeamFixtureDetail; away: TeamFixtureDetail };
  goals: StrictGoals;
  score: Score;
};

type Fixture = {
  id: number;
  referee: string;
  timezone: string;
  date: string;
  timestamp: number;
  periods: { first: number; second: number };
  venue: VenueFixtureDetail;
  status: Status;
};

type VenueFixtureDetail = {
  id: number;
  name: string;
  city: string;
};
type Status = {
  long: string;
  short: string;
  elapsed: number;
  extra: number | null;
};
type League = {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string;
  season: number;
  round: string;
  standings: boolean;
};
type TeamFixtureDetail = {
  id: number;
  name: string;
  logo: string;
  winner: boolean | null;
};
type StrictGoals = {
  home: number;
  away: number;
};
type Goals = {
  home: number | null;
  away: number | null;
};

type Score = {
  halftime: Goals;
  fulltime: Goals
  extratime: Goals;
  penalty: Goals;
};
