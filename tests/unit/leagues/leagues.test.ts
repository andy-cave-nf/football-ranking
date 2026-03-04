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
import { defaultInMemoryLeague, InMemoryLeague } from '../../utils';

test('a new league has no teams', () => {
  const league = defaultInMemoryLeague()
  expect(league.teams.size).toBe(0);
})

describe('given a new league, when a match is processed', () => {
  let result: Result;
  let league: League;
  beforeEach(async () => {
    league = defaultInMemoryLeague();
    result = {
      home: { id: 'team-1', name: 'home' },
      away: { id: 'team-2', name: 'away' },
      homeWin: 1,
      date: new Date(2000, 0, 1),
    };
    league.record(result)
  })
  it('adds both teams to the league', ()=>{
    expect(league.teams.size).toBe(2)
  })
})

describe('given a league with two existing teams, when a match is recorded with differently capitalised team names', () => {
  let result1: Result;
  let result2: Result;
  let league: League;
  beforeEach(async () => {
    league = defaultInMemoryLeague();
    result1 = {
      home: { id: 'team-1', name: 'home' },
      away: { id: 'team-2', name: 'away' },
      homeWin: 1,
      date: new Date(2000, 0, 1),
    };
    result2 = {
      home: { id: 'TEAM-1', name: 'home' },
      away: { id: 'TEAM-2', name: 'away' },
      homeWin: 1,
      date: new Date(2000, 0, 2),
    };
    league.record(result1)
    league.record(result2)
  })
  it('does not add duplicate teams', () => {
    expect(league.teams.size).toBe(2)
  })
})

describe('given a league with two existing teams, when a match is processed with ids with extra whitespace', () => {
  let result1: Result;
  let result2: Result;
  let league: League;
  beforeEach(async () => {
    league = defaultInMemoryLeague();
    result1 = {
      home: { id: 'team-1', name: 'home' },
      away: { id: 'team-2', name: 'away' },
      homeWin: 1,
      date: new Date(2000, 0, 1),
    };
    result2 = {
      home: { id: '    team-1     ', name: 'home' },
      away: { id: '    team-2     ', name: 'away' },
      homeWin: 1,
      date: new Date(2000, 0, 2),
    };
    league.record(result1);
    league.record(result2);
  });
  it('does not add duplicate teams', () => {
    expect(league.teams.size).toBe(2)
  })
})

describe('given a league with a predicatable ruleset when a match is processed', () => {
  let result: Result;
  let fakeRuleset: Ruleset;
  let league: League;
  beforeEach(async () => {
    result = {
      home: { id: 'team-1', name: 'home' },
      away: { id: 'team-2', name: 'away' },
      homeWin: 1,
      date: new Date(2000, 0, 1),
    };
    fakeRuleset = {
      record(_result: Result, ratings:Ratings): Ratings {
        return {
          home:{...ratings.home, mu:10},
          away:{...ratings.away, mu:-10 },
        }
      }
    }
    league = InMemoryLeague(fakeRuleset);
    league.record(result)
  })
  it('stores the teams with their new ratings', () => {
    const homeTeam = league.teams.getOrThrow(result.home.id);
    const awayTeam = league.teams.getOrThrow(result.away.id);
    expect(homeTeam.mu).toBe(10)
    expect(awayTeam.mu).toBe(-10)
  })

})

describe.todo('given a league with two existing teams, when a match is processed that occurs on prior day to the previous match', () => {
  it.todo('raises a League Error', () =>{

  })
})

describe.todo('given a league with two existing teams, when a match is processed that occurs before the previous match on the same day', () => {
  it.todo('raises a League Error', () =>{})
})

describe.todo('given a league with two existing teams, when a match is processed that occurs after the previous match on the same day', () => {
  it.todo('does not raise a League Error', () => {});
});

describe.todo('given a league with two existing teams, when a match is processed that occurs on the same day as the previous match', () => {
  it.todo('does not raise a League Error', () => {});
});

describe('tests a record is added to a league with two teams', async () => {
  beforeEach(async () => {
    // fakeRuleset = {
    //   record: vi.fn(
    //     (result: Result, ratings: Ratings): Ratings => ({
    //       home: { rating: ratings.home.rating + 8 * (2 * result.homeWin - 1), uncertainty: 0 },
    //       away: { rating: ratings.away.rating - 8 * (2 * result.homeWin - 1), uncertainty: 0 },
    //     })
    //   ),
    // };
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
    expect(league.teams.getOrThrow(result.home.id).mu).toBe(startingElo + 8);
  });
  it('tests that the away elo is correct after a loss', async () => {
    expect(league.teams.getOrThrow(result.away.id).mu).toBe(startingElo - 8);
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
