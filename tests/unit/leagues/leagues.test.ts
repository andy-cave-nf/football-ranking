import type { Ratings, Ruleset } from '../../../src/rulesets/rulesets';
import type { Result } from '../../../src/leagues/types';
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

describe('given a league with a predicatable ruleset, when a match is processed', () => {
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
          home:{...ratings.home, mu:10,sigma:1},
          away:{...ratings.away, mu:-10,sigma:2},
        }
      }
    }
    league = InMemoryLeague(fakeRuleset);
    league.record(result)
  })
  it('stores the teams with their new ratings', () => {
    const homeTeam = league.teams.getOrThrow(result.home.id);
    const awayTeam = league.teams.getOrThrow(result.away.id);
    expect({mu: homeTeam.mu, sigma:homeTeam.sigma}).toBe({mu:10, sigma:1})
    expect({mu: awayTeam.mu, sigma:awayTeam.sigma}).toBe({mu:-10, sigma:2})
  })

})

describe.todo('given a league with two existing teams, when a match is processed that occurs on a prior day to the previous match of both teams', () => {
  let previousResult: Result
  let league: League;
  let earlyResult: Result;
  beforeEach(async () => {
    league = new StrictLeagueRecord(defaultInMemoryLeague());
    previousResult = {
      home: { id: 'team-1', name: 'home' },
      away: { id: 'team-2', name: 'away' },
      homeWin: 1,
      date: new Date(2000, 0, 1),
    };
    earlyResult = {
      home: { id: 'team-1', name: 'home' },
      away: { id: 'team-2', name: 'away' },
      homeWin: 1,
      date: new Date(1999, 0, 1),
    };
    league.record(previousResult)
  })
  it.todo('raises a League Error', () =>{
    expect(() => league.record(earlyResult)).toThrowError(LeagueError)
  })
})

describe.todo('given a league with existing teams, when a match is processed with an existing team that occurs on a prior day to the previous match of that team', () => {
  let previousResult: Result
  let league: League;
  let earlyResult: Result;
  beforeEach(async () => {
    league = new StrictLeagueRecord(defaultInMemoryLeague());
    previousResult = {
      home: { id: 'team-1', name: 'home' },
      away: { id: 'team-2', name: 'away' },
      homeWin: 1,
      date: new Date(2000, 0, 1),
    };
    earlyResult = {
      home: { id: 'team-1', name: 'home' },
      away: { id: 'team-3', name: 'away' },
      homeWin: 1,
      date: new Date(1999, 0, 1),
    };
    league.record(previousResult)
  })
  it.todo('raises a League Error', () =>{
    expect(() => league.record(earlyResult)).toThrowError(LeagueError);
  })
})

describe.todo('given a league with two existing teams, when a match is processed that occurs on the same day as the previous match', () => {
  let previousResult: Result
  let league: League;
  let earlyResult: Result;
  beforeEach(async () => {
    league = new StrictLeagueRecord(defaultInMemoryLeague());
    previousResult = {
      home: { id: 'team-1', name: 'home' },
      away: { id: 'team-2', name: 'away' },
      homeWin: 1,
      date: new Date(2000, 0, 1),
    };
    earlyResult = {
      home: { id: 'team-1', name: 'home' },
      away: { id: 'team-3', name: 'away' },
      homeWin: 1,
      date: new Date(2000, 0, 1),
    };
    league.record(previousResult)
  })
  it.todo('does not raise an Error', () =>{
    expect(() => league.record(earlyResult)).not.toThrowError();
  })
});

describe.todo('given a league with a storage that throws an unexpected error, when a match is processed', () => {
  let erroredRuleset: Ruleset;
  let league: League;
  let result: Result;
  beforeEach(async () => {
    result = {
      home: { id: 'team-1', name: 'home' },
      away: { id: 'team-2', name: 'away' },
      homeWin: 1,
      date: new Date(2000, 0, 1),
    };
    erroredRuleset = {
      record(_result:Result,_ratings: Ratings): Ratings {
        throw new Error('errored');
      }
    }
    league = new SafeLeague(InMemoryLeague(erroredRuleset));
  })
  it.todo('wraps it in a League Error', () => {
    expect(() => league.record(result)).toThrowError(LeagueError);
  });
})
