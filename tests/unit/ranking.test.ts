import { InMemoryLeague } from '../../src/leagues/in_memory';
import {
  DefaultRankings,
  RankingError,
  type Rankings,
  RankingsWithStrictDates,
  SafeRankings,
} from '../../src/rankings';
import type { Ruleset } from '../../src/rulesets/rulesets';
import {
  DEFAULT_FAKE_TEAMS,
  ErroredRanking,
  FakeLeague,
  FakePage,
  FakeRuleset,
  FakeSource,
} from './fake_setup';
import type { Page } from '../../src/pages/pages';
import type { SourceTeam } from '../../src/sources/types';
import type { Mock } from 'vitest';
import type { Result, Team } from '../../src/leagues/types';
import type { ReadOnlyStrictMap, ReadOnlyTeamMap } from '../../src/utils';
import type { Source } from '../../src/sources/base';
import type { League } from '../../src/leagues/base';

let rankings: Rankings;
let league: League;
let ruleset: Ruleset;
let source: Source;
let dates: { start: Date; end: Date };
let sourceTeams: SourceTeam[];
let teams: Team[];
let results: Result[];

beforeEach(async () => {
  dates = { start: new Date(2000, 0, 1), end: new Date(2001, 0, 1) };
  sourceTeams = [
    { name: 'team-1', id: '1' },
    { name: 'team-2', id: '2' },
    { name: 'team-3', id: '3' },
  ];
  // teams = [{id:1, name: "team1", elo: 200, lastFixtureDate:dates.start}, {id:2, name: "team2", elo: 300, lastFixtureDate:dates.start}, {id:3, name: "team3", elo: 400, lastFixtureDate:dates.start}];
  results = [
    {
      home: { id: '1', name: 'team-1' },
      away: { id: '2', name: 'team-3' },
      homeWin: 1,
      date: new Date(dates.start),
    },
    {
      home: { id: '2', name: 'team-2' },
      away: { id: '3', name: 'team-3' },
      homeWin: 0.5,
      date: new Date(dates.start),
    },
    {
      home: { id: '1', name: 'team-1' },
      away: { id: '3', name: 'team-3' },
      homeWin: 0,
      date: new Date(dates.start),
    },
  ];

  league = new FakeLeague(1000);
  ruleset = new FakeRuleset();
  source = new FakeSource({ teams: sourceTeams, matches: results });
  rankings = new DefaultRankings(league, source, ruleset);
});

describe('Ranking makes correct calls on running', async () => {
  beforeEach(async () => {
    await rankings.run(dates.start, dates.end);
  });

  it('tests matches are called from the source', async () => {
    expect(source.results).toBeCalledWith(dates.start, dates.end);
  });

  it('tests that the matches are recorded by the league', async () => {
    results.forEach((result) => {
      expect(league.record).toBeCalledWith(result, ruleset);
    });
  });
});

describe('test that printing rankings call pages', async () => {
  let fakePage: Page;
  let spy: Mock<() => ReadOnlyTeamMap<number | string, Team>>;
  beforeEach(async () => {
    spy = vi.spyOn(FakeLeague.prototype, 'teams', 'get');
    fakePage = new FakePage();
    await rankings.print(fakePage);
  });
  afterEach(async () => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });
  it('tests that teams are called from leagues', async () => {
    expect(spy).toBeCalledTimes(1);
  });

  it('tests print is called once', async () => {
    expect(fakePage.print).toBeCalledWith(league.teams.values());
  });
});

describe('test strict rankings throws errors', async () => {
  let strictRankings: Rankings;
  beforeEach(async () => {
    strictRankings = new RankingsWithStrictDates(rankings);
  });
  it('tests an error is raised if the dates are incompatible', async () => {
    await expect(
      strictRankings.run(new Date(2020, 1, 1), new Date(1970, 1, 1))
    ).rejects.toThrowError(RankingError);
  });
});

describe('tests error handling of safe rankings', async () => {
  let safeRankings: Rankings;
  beforeEach(async () => {
    safeRankings = new SafeRankings(new ErroredRanking());
  });
  it('tests run raises a ranking error', async () => {
    await expect(safeRankings.run(dates.start, dates.end)).rejects.toThrowError(RankingError);
  });
  it('tests page raises a ranking error', async () => {
    await expect(safeRankings.print(new FakePage())).rejects.toThrowError(RankingError);
  });
});
