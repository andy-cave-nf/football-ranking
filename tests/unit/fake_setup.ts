import type { Elo, Ruleset } from '../../src/rulesets/rulesets';
import type { Page } from '../../src/pages/pages';
import { cleanString, type League } from '../../src/leagues/leagues';
import type { Result, Team } from '../../src/leagues/types';
import type { Rankings } from '../../src/rankings';
import type { SourceTeam } from '../../src/sources/types';
import { DefaultTeamMap, ReadOnlyStrictMap, type ReadOnlyTeamMap, SanitizeMap, StrictMap, type TeamMap } from '../../src/utils';
import type { Source } from '../../src/sources/base';

type fakeSourceData = {
  teams?: SourceTeam[];
  matches?: Result[];
};


export const DEFAULT_FAKE_TEAMS: Team[] = [{id:1, name: 'fake-team-1', elo:1000, lastFixtureDate: new Date(2000,0,1) }, {id:2, name: 'fake-team-2',elo:1200, lastFixtureDate: new Date(2000,0,1) }];
export const DEFAULT_SOURCE_TEAMS: SourceTeam[] = [{id:"1", name: 'fake-team-1'},{id:"2", name: 'fake-team-2'}]
export const DEFAULT_FAKE_RESULTS: Result[] = [{
  home: {id: "1", name:'default-team-1'},
  away: {id:"2", name:'default-team-2'},
  homeWin:1,
  date:new Date(2000,0,1)}]

export class FakeSource implements Source {
  constructor(private fakeData: fakeSourceData) {}
  teams = vi.fn(async () => {
    return this.fakeData.teams ?? DEFAULT_SOURCE_TEAMS;
  });
  results = vi.fn(
    async (_start: Date, _end?: Date): Promise<Result[]> =>
      this.fakeData.matches ?? DEFAULT_FAKE_RESULTS
  );
}

type fakeLeagueData = {
  teams?: Team[];
};

export class FakeLeague implements League {
  private teamMap: TeamMap<string, Team>
  constructor(private startingElo:number) {
    this.teamMap = new DefaultTeamMap<string, Team>(new SanitizeMap(cleanString))
  }
  record = vi.fn(async (result: Result, _ruleset: Ruleset): Promise<void> => {
    this.teamMap.setInit(result.home.id,{id:result.home.id, name: result.home.name, elo:this.startingElo, lastFixtureDate: result.date})
    this.teamMap.setInit(result.away.id, {
      id: result.away.id,
      name: result.away.name,
      elo: this.startingElo,
      lastFixtureDate: result.date,
    });
  });
  get teams(): ReadOnlyTeamMap<number|string, Team> {
    return this.teamMap.toReadOnly()
  }
}

export class FakePage implements Page {
  print = vi.fn(async (_teams: Team[])=> {
    return
  })
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