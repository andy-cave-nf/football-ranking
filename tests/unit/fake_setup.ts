
import type { Page } from '../../src/pages/pages';
import type { Result, Team } from '../../src/leagues/types';
import type { Rankings } from '../../src/rankings';
import type { SourceTeam } from '../../src/sources/types';
import type { Source } from '../../src/sources/base';
import { type League } from '../../src/leagues/base';
import type { Ratings, Ruleset } from '../../src/rulesets/base';
import {
  cleanString,
  DefaultTeamMap,
  type ReadOnlyTeamMap,
  SanitizeMap,
  type TeamMap,
} from '../../src/leagues/team_maps';

export const DEFAULT_FAKE_TEAMS: Team[] = [
  { id: 1, name: 'fake-team-1', mu: 25, sigma: 25 / 3, lastFixtureDate: new Date(2000, 0, 1) },
  { id: 2, name: 'fake-team-2', mu: 25, sigma: 25 / 3, lastFixtureDate: new Date(2000, 0, 1) },
];
export const DEFAULT_SOURCE_TEAMS: SourceTeam[] = [
  { id: '1', name: 'fake-team-1' },
  { id: '2', name: 'fake-team-2' },
];
export const DEFAULT_FAKE_RESULTS: Result[] = [
  {
    home: { id: '1', name: 'default-team-1' },
    away: { id: '2', name: 'default-team-2' },
    homeWin: 1,
    date: new Date(2000, 0, 1),
  },
];

export class FakeSource implements Source {
  constructor(private matches: Result[]) {}
  results = vi.fn(
    async (_start: Date, _end?: Date): Promise<Result[]> =>
      this.matches ?? DEFAULT_FAKE_RESULTS
  );
}

export class FakeLeague implements League {
  private teamMap: TeamMap<string, Team>;
  constructor(private mu0: number, private sigma0: number) {
    this.teamMap = new DefaultTeamMap<string, Team>(new SanitizeMap(cleanString));
  }
  record = vi.fn(async (result: Result, _ruleset: Ruleset): Promise<void> => {
    this.teamMap.setInitOrIgnore(result.home.id, {
      id: result.home.id,
      name: result.home.name,
      mu: this.mu0,
      sigma: this.sigma0,
      lastFixtureDate: result.date,
    });
    this.teamMap.setInitOrIgnore(result.away.id, {
      id: result.away.id,
      name: result.away.name,
      mu: this.mu0,
      sigma: this.sigma0,
      lastFixtureDate: result.date,
    });
  });
  get teams(): ReadOnlyTeamMap<number | string, Team> {
    return this.teamMap.toReadOnly();
  }
}

export class FakePage implements Page {
  print = vi.fn(async (_teams: Team[]) => {
    return;
  });
}

export class FakeRuleset implements Ruleset {
  private readonly scale: number;
  constructor(scale?: number) {
    this.scale = scale ?? 8;
  }
  record = vi.fn((result: Result, elo: Ratings): Ratings => {
    return {
      home: elo.home.mu + this.scale * (2 * result.homeWin - 1),
      away: elo.away.mu + this.scale * (2 * (1 - result.homeWin) - 1),
    };
  });
}

export class ErroredRanking implements Rankings {
  run = vi.fn(async (_start: Date, _end: Date) => {
    throw new Error('run errors');
  });
  print = vi.fn(async (_page: Page) => {
    throw new Error('print errors');
  });
}
