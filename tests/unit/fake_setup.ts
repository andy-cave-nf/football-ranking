import type { Elo, Ruleset } from '../../src/rulesets/rulesets';
import type { Page } from '../../src/pages/pages';
import type { Team } from '../../src/leagues/teams';
import type { Match, Source } from '../../src/sources/sources';
import type { League } from '../../src/leagues/leagues';
import type { Result } from '../../src/leagues/types';
import type { Rankings } from '../../src/rankings';

type fakeSourceData = {
  teams?: Team[];
  matches?: Match[];
};

export const DEFAULT_FAKE_SOURCE_TEAMS: Team[] = [{ name: 'fake-team-1', elo:1000 }, { name: 'fake-team-2',elo:1200 }];

export class FakeSource implements Source {
  constructor(private fakeData: fakeSourceData) {}
  teams = vi.fn(async () => {
    return this.fakeData.teams ?? DEFAULT_FAKE_SOURCE_TEAMS;
  });
  matches = vi.fn(
    async (_start: Date, _end?: Date): Promise<Match[]> =>
      this.fakeData.matches ?? [{ id: 1 }, { id: 2 }]
  );
}

type fakeLeagueData = {
  teams?: Team[];
};

export class FakeLeague implements League {
  constructor(private fakeData: fakeLeagueData) {}
  add = vi.fn(async (_name: string, _start: Date) => {});
  record = vi.fn(async (_match: Match, _ruleset: Ruleset): Promise<void> => {});
  teams = vi.fn(async (): Promise<Team[]> => {
    return this.fakeData.teams ?? [{ name: 'default-test-1' }, { name: 'default-test-2' }];
  });
}

export class FakePage implements Page {
  with = vi.fn((_data:Record<string,string|number>)=>this)
}

export class FakeRuleset implements Ruleset {
  private readonly scale: number;
  constructor(scale?: number) {
    this.scale = scale ?? 8;
  }
  record = vi.fn((result: Result, elo: Elo): Elo => {
    return {
      home: elo.home + this.scale * (2 * result.homeWin - 1),
      away: elo.away + this.scale * (2 * (1 - result.homeWin) - 1),
    };
  });
}

export class ErroredRanking implements Rankings {
  run = vi.fn(async (_start: Date, _end: Date) => {throw new Error('run errors')});
  print = vi.fn(async (_page: Page) => {throw new Error('print errors')});
}