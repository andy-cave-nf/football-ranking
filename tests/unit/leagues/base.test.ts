import { StrictLeagueRecord, type League } from '../../../src/leagues/base';
import { defaultInMemoryLeague } from '../../utils';
import { DefaultTeamMap } from '../../../src/leagues/team_maps';
import type { Result, Team } from '../../../src/leagues/types';
import type { SourceTeam } from '../../../src/sources/types';

describe.only('Strict League Record', () => {
  let league: StrictLeagueRecord
  let origin: League
  describe('given a league with an empty map', () => {
    beforeEach(async () => {
      origin = defaultInMemoryLeague({teamMap: new DefaultTeamMap(new Map<string,Team>())});
      league = new StrictLeagueRecord(origin);
    })
    describe('when a match is processed', () => {
      let home: SourceTeam
      let away: SourceTeam
      let date: Date
      let result: Result
      beforeEach(async () => {
        home = {id: 'team-1', name: 'home'};
        away = {id: 'team-2', name: 'away'};
        date = new Date(2000,0,1)
        result = {
          home,
          away,
          homeWin: 1,
          date,
        }
        league.record(result)
      })
      it('stores the home team in the underlying league', () => {
        expect(league.teams.get(home.id)).toEqual({
          ...home,
          mu:2,
          sigma:2,
          lastFixtureDate: date
        })
      })
      it('stores the away team in the underlying league', () => {
        expect(league.teams.get(away.id)).toEqual({
          ...away,
          mu: 3,
          sigma:3,
          lastFixtureDate: date
        })
      })
      it('adds only two teams to the league', () => {
        expect(league.teams.size).toEqual(2)
      })
    })
  })
  describe.todo('given a league with a single existing team', () => {
    describe.todo('when a match involving one existing team and one new team, played after the existing teams last fixture date, is processed', () => {
      it.todo('updates the existing team correctly')
      it.todo('stores the new team correctly')
      it.todo('adds only a single team to the league')
    })
    describe.todo('when a match involving the existing team and one new team, played before the existing teams last fixture date, is processed', () => {
      it.todo('raises a League Error')
    })
    describe.todo('when a match involving two new teams, is processed', () => {
      it.todo('stores the new home team correctly')
      it.todo('stores the new away team correctly')
      it.todo('leaves the existing team unchanged')
      it.todo('adds only two teams to the league')
    })
    describe.todo('when a match involving two new teams, played before the existing teams last fixture date, is processed', () => {
      it.todo('does not raise a League Error')
      it.todo('stores the new home team correctly')
      it.todo('stores the new away team correctly')
      it.todo('leaves the existing team unchanged')
      it.todo('adds only two teams to the league')
    })
  })
  describe.todo('given a league with two existing teams', () => {
    describe.todo('when a match involving both teams, played before a single teams last fixture date, is processed', () => {
      it.todo('raises a League Error')
    })
    describe.todo('when a match involving both teams, played before both teams last fixture date, is processed', () => {
      it.todo('raises a League Error')
    })
    describe.todo('when a match involving both teams, played after both teams last fixture date, is processed', () => {
      it.todo('updates the home team correctly')
      it.todo('updates the away team correctly')
      it.todo('has only two teams in the league')
    })
    describe.todo('when a match with two new teams, played before an existing teams last fixture date, is processed', () => {
      it.todo('does not raise a League Error')
      it.todo('stores the new home team correctly')
      it.todo('stores the new away team correctly')
      it.todo('adds only two teams to the league')
      it.todo('leaves the existing teams unchanged')
    })
    describe.todo('when a match with two new teams is played before both existing teams last fixture date, is processed', () => {
      it.todo('does not raise a League Error')
      it.todo('stores the new home team correctly')
      it.todo('stores the new away team correctly')
      it.todo('adds only two teams to the league')
      it.todo('leaves the existing teams unchanged')
    })
  })

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
