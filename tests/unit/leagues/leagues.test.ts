import { InMemoryLeague } from '../../../src/leagues/in_memory';
import type { Ratings, Ruleset } from '../../../src/rulesets/rulesets';
import type { Result, Team } from '../../../src/leagues/types';
import { ReadOnlyStrictMap } from '../../../src/utils';
import { FakeRuleset } from '../fake_setup';
import {
  type League,
  LeagueError,
  SafeLeague,
  StrictLeagueRecord,
} from '../../../src/leagues/base';

let league: League;
let startingElo: number;
let startingUncertainty: number;

beforeEach(async () => {
  startingElo = 100;
  startingUncertainty = 10;
  league = new InMemoryLeague(startingElo, startingUncertainty);
});

describe('test empty in memory leagues', async () => {
  it('tests that an empty league returns an empty array of teams', async () => {
    expect(league.teams.size).toBe(0);
  });
});

describe('tests a record is added to a league with two teams', async () => {
  let fakeRuleset: Ruleset;
  let result: Result;
  beforeEach(async () => {
    fakeRuleset = {
      record: vi.fn(
        (result: Result, ratings: Ratings): Ratings => ({
          home: { rating: ratings.home.rating + 8 * (2 * result.homeWin - 1), uncertainty: 0 },
          away: { rating: ratings.away.rating - 8 * (2 * result.homeWin - 1), uncertainty: 0 },
        })
      ),
    };
    result = {
      home: { id: 'team-1', name: 'home' },
      away: { id: 'team-2', name: 'away' },
      homeWin: 1,
      date: new Date(2000, 0, 1),
    };
    league.record(result, fakeRuleset);
  });
  it('tests the correct number of teams in league', async () => {
    expect(league.teams.size).toBe(2);
  });

  it('tests that capitalised id in result does not add extra teams', async () => {
    league.record(
      {
        home: { id: 'TEAM-1', name: 'home' },
        away: { id: 'TEAM-2', name: 'away' },
        homeWin: 1,
        date: new Date(2000, 0, 2),
      },
      fakeRuleset
    );
    expect(league.teams.size).toBe(2);
  });

  it('tests that extra whitespace in id of team does not add extra teams', async () => {
    league.record(
      {
        home: { id: '     team-1    ', name: 'home' },
        away: { id: '    team-2     ', name: 'away' },
        homeWin: 1,
        date: new Date(2000, 0, 2),
      },
      fakeRuleset
    );
    expect(league.teams.size).toBe(2);
  });

  it('tests that record calls the ruleset', async () => {
    expect(fakeRuleset.record).toHaveBeenCalledWith(result, {
      home: { rating: startingElo, uncertainty: startingUncertainty },
      away: { rating: startingElo, uncertainty: startingUncertainty },
    });
  });

  it('tests that the home elos is correct after a win', async () => {
    expect(league.teams.getOrThrow(result.home.id).rating).toBe(startingElo + 8);
  });
  it('tests that the away elo is correct after a loss', async () => {
    expect(league.teams.getOrThrow(result.away.id).rating).toBe(startingElo - 8);
  });

  it('tests that an error is raised if the record added occurs before the previous fixture', () => {
    const earlyResult: Result = {
      home: { id: 'team-1', name: 'home' },
      away: { id: 'team-2', name: 'away' },
      homeWin: 1,
      date: new Date(1999, 0, 1),
    };
    const strictLeague = new StrictLeagueRecord(league);
    expect(() => strictLeague.record(earlyResult, fakeRuleset)).toThrowError(LeagueError);
  });
  it('tests that strict league correctly adds a record with new teams', () => {
    const strictLeague = new StrictLeagueRecord(league);
    const result: Result = {
      home: { id: 'team-3', name: 'home-again' },
      away: { id: 'team-4', name: 'away-again' },
      homeWin: 1,
      date: new Date(1999, 0, 1),
    };
    strictLeague.record(result, fakeRuleset);
    expect(strictLeague.teams.size).toBe(4);
  });
});

describe('safe league raises only league errors', async () => {
  let erroredLeague: League;
  let safeLeague: League;
  beforeEach(async () => {
    erroredLeague = {
      record: vi.fn((_result, _ruleset) => {
        throw new Error('records throws an error');
      }),
      get teams(): ReadOnlyStrictMap<number | string, Team> {
        throw new Error('get teams throws an error');
      },
    };
    safeLeague = new SafeLeague(erroredLeague);
  });
  it('tests that record raises an error', () => {
    expect(() =>
      safeLeague.record(
        {
          home: { id: '1', name: 'home' },
          away: { id: '1', name: 'away' },
          homeWin: 1,
          date: new Date(1999, 0, 1),
        },
        new FakeRuleset()
      )
    ).toThrowError(LeagueError);
  });
  it('tests that team raises an error', () => {
    expect(() => safeLeague.teams).toThrowError(LeagueError);
  });
});
