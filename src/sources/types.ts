import type { ApiQuery, FixtureQuery } from './api_source';

export type DashedScore = `${number}-${number}`;

export type JsonData = {
  teams: JsonTeams[];
  fixtures: JsonFixtures[];
};

export type JsonTeams = {
  id: string;
  name: string;
};
export type JsonFixtures = {
  matchId: string;
  homeId: string;
  awayId: string;
  score: DashedScore;
  date: string;
};

export interface SourceTeam {
  id: string;
  name: string;
}

type ApiResponseMap = {
  team: { parameters: ApiQuery; response: TeamResponse[] };
  fixture: { parameters: FixtureQuery; response: FixtureResponse[] };
};

export type ApiResponse<T extends keyof ApiResponseMap> = {
  get: string;
  parameters: ApiResponseMap[T]['parameters'];
  errors: string[];
  results: number;
  paging: { current: number; total: number };
  response: ApiResponseMap[T]['response'];
};
export type TeamResponse = {
  team: TeamDetail;
  venue: VenueDetail;
};

type TeamDetail = {
  id: number;
  name: string;
  code: string;
  country: string;
  founded: number;
  national: boolean;
  logo: string;
};
type VenueDetail = {
  id: number;
  name: string;
  address: string;
  city: string;
  capacity: number;
  surface: string;
  image: string;
};

export type FixtureResponse = {
  fixture: Fixture;
  venue: VenueFixtureDetail;
  status: Status;
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
  periods: { first: number; last: number };
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
  winner: boolean;
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
  fulltime: Goals;
  extratime: Goals;
  penalty: Goals;
};
