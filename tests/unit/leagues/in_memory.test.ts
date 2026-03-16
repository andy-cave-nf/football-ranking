import type { Result, Team } from '../../../src/leagues/types';
import {
  type League,
  LeagueError,
  SafeLeague,
  StrictLeagueRecord,
} from '../../../src/leagues/base';
import { defaultInMemoryLeague, inMemoryLeague } from '../../utils';
import type { Ratings, Ruleset, TeamRating } from '../../../src/rulesets/base';
import { DefaultTeamMap, type TeamMap } from '../../../src/leagues/team_maps';
import { InMemoryLeague } from '../../../src/leagues/in_memory';

describe.only('InMemoryLeague', () => {
  let league: League;
  let teamMap: TeamMap<string, Team>
  let ruleset: Ruleset;
  describe('given a league with an empty map', () => {
    let homeRating: TeamRating
    let awayRating: TeamRating
    let newRating: TeamRating;
    beforeEach(() => {
      homeRating = {mu:10, sigma:3}
      awayRating = {mu:11, sigma:4}
      newRating = {mu:12, sigma:5}
      ruleset = {
        record(_result: Result, _ratings: Ratings):Ratings{
          return {
            home: homeRating,
            away: awayRating,
          }
        },
        newRating():TeamRating {
          return newRating;
        }
      }
      teamMap = new DefaultTeamMap(new Map());
      league = new InMemoryLeague(teamMap, ruleset);
    })
    test('it has no teams', () => {
      expect(league.teams.size).toBe(0);
    });
    describe('when a new match is processed', () =>{
      let result: Result;
      let fixtureDate: Date;
      beforeEach(async () => {
        fixtureDate = new Date(2021, 1, 1);
        result = {
          home: { id: 'team-1', name: 'home' },
          away: { id: 'team-2', name: 'away' },
          homeWin: 1,
          date: fixtureDate,
        };
        league.record(result)
      })
      it('stores the home team correctly', ()=>{
        expect(league.teams.getOrThrow(result.home.id)).toEqual({
          id: 'team-1',
          name: 'home',
          lastFixtureDate: fixtureDate,
          ...homeRating
        })
      })
      it('stores the away team correctly', ()=>{
        expect(league.teams.getOrThrow(result.away.id)).toEqual({
          id: 'team-2',
          name: 'away',
          lastFixtureDate: fixtureDate,
          ...awayRating
        })
        expect(league.teams.has(result.away.id)).toBe(true);
      })
      it('adds only the two teams to the league', ()=>{
        expect(league.teams.size).toBe(2)
      })
    })
  })
  describe.todo('given a league with a map of two teams', () => {
    test.todo('it has two teams')
    describe('when a new match is processed between existing teams', () => {
      it.todo('has only two teams')
      it.todo('stores the updated home team correctly')
      it.todo('stores the updated away team correctly')
    })
    describe('when a new match is processed with a single new team', () => {
      it.todo('has only three teams')
      it.todo('stores the updated home team correctly')
      it.todo('stores the updated away team correctly')
      it.todo('leaves the remaining team unchanged')
    })
    describe('when a new match is processed with two different teams', () => {
      it.todo('has only four teams')
      it.todo('stores the home team correctly')
      it.todo('stores the away team correctly')
      it.todo('leaves the remaining teams unchanged')
    })
  })
})

describe('Strict League Record', () => {
  describe.todo('given a league with an empty map')
})

describe('given a league with two existing teams, when a match is processed that occurs on a prior day to the previous match of both teams', () => {
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
  it('raises a League Error', () =>{
    expect(() => league.record(earlyResult)).toThrowError(LeagueError)
  })
})

describe('given a league with existing teams, when a match is processed with an existing team that occurs on a prior day to the previous match of that team', () => {
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
  it('raises a League Error', () =>{
    expect(() => league.record(earlyResult)).toThrowError(LeagueError);
  })
})

describe('given a league with two existing teams, when a match is processed that occurs on the same day as the previous match', () => {
  let previousResult: Result
  let league: League;
  let earlyResult: Result;
  beforeEach(async () => {
    league = new StrictLeagueRecord(defaultInMemoryLeague());
    previousResult = {
      home: { id: 'team-1', name: 'home' },
      away: { id: 'team-2', name: 'away' },
      homeWin: 1,
      date: new Date(2000, 0, 1,12,0),
    };
    earlyResult = {
      home: { id: 'team-1', name: 'home' },
      away: { id: 'team-3', name: 'away' },
      homeWin: 1,
      date: new Date(2000, 0, 1,12,0),
    };
    league.record(previousResult)
  })
  it('does not raise an Error', () =>{
    expect(() => league.record(earlyResult)).not.toThrowError();
  })
});

describe('given a league with two existing teams, when a match is processed that occurs on the same day and an earlier time as the previous match', () => {
  let previousResult: Result;
  let league: League;
  let earlyResult: Result;
  beforeEach(async () => {
    league = new StrictLeagueRecord(defaultInMemoryLeague());
    previousResult = {
      home: { id: 'team-1', name: 'home' },
      away: { id: 'team-2', name: 'away' },
      homeWin: 1,
      date: new Date(2000, 0, 1, 12, 0),
    };
    earlyResult = {
      home: { id: 'team-1', name: 'home' },
      away: { id: 'team-3', name: 'away' },
      homeWin: 1,
      date: new Date(2000, 0, 1, 11, 0),
    };
    league.record(previousResult);
  });
  it('raises a league error', () => {
    expect(() => league.record(earlyResult)).toThrowError(LeagueError);
  });
})

describe('given a league with a storage that throws an unexpected error, when a match is processed', () => {
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
      record(_result: Result, _ratings: Ratings): Ratings {
        throw new Error('errored');
      },
      newRating(): TeamRating {
        throw new Error('errored');
      },
    };
    league = new SafeLeague(inMemoryLeague(erroredRuleset));
  })
  it('wraps it in a League Error', () => {
    expect(() => league.record(result)).toThrowError(LeagueError);
  });
})

describe.todo('given a league with existing teams, when a match is processed with duplicated ids', () => {
  it.todo('a source error is raised')
})

describe.todo('given a league with no existing teams, when a match is processed with duplicated ids', () => {
  it.todo('a source error is raised')
})