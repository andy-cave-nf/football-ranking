import { StrictLeagueRecord, type League } from '../../../src/leagues/base';
import { defaultInMemoryLeague } from '../../utils';
import { DefaultTeamMap } from '../../../src/leagues/team_maps';
import type { Result, Team } from '../../../src/leagues/types';
import type { SourceTeam } from '../../../src/sources/types';

describe('Strict League Record', () => {
  let league: StrictLeagueRecord
  let origin: League
  describe('given an empty league', () => {
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

describe.todo('Safe League' , () => {
  describe.todo('given an empty league', () => {
    test.todo('it has no teams')
    describe.todo('when a match is processed', () => {
      it.todo('does not raise a League Error')
      it.todo('stores the new home team correctly')
      it.todo('stores the new away team correctly')
      it.todo('adds only two teams to the league')
    })
  })
  describe.todo('given a league with an existing team', () => {
    test.todo('it has only one team')
    describe.todo('when a match is processed with one existing team', () => {
      it.todo('does not raise a League Error')
      it.todo('stores the new team correctly')
      it.todo('updates the existing team correctly')
      it.todo('adds only one team to the league')
    })
    describe.todo('when a match is processed with two new teams', () => {
      it.todo('does not raise a League Error')
      it.todo('stores the new home team correctly')
      it.todo('stores the new away team correctly')
      it.todo('adds only two teams to the league')
      it.todo('leaves the existing team unchanged')
    })
  })
  describe.todo('given a league with two existing teams', () => {
    describe.todo('when a match is processed with between existing teams', () => {
      it.todo('does not raise a League Error')
      it.todo('updates the home team correctly')
      it.todo('updates the away team correctly')
      it.todo('has only two teams')
    })
    describe.todo('when a match is processed with one new team', () => {
      it.todo('does not raise a League Error')
      it.todo('stores the new team correctly')
      it.todo('updates the existing team correctly')
      it.todo('leaves the existing team unchanged')
      it.todo('adds only one team to the league')
    })
    describe.todo('when a match is processed with two new teams', () => {
      it.todo('does not raise a League Error')
      it.todo('stores the new home team correctly')
      it.todo('stores the new away team correctly')
      it.todo('leaves th existing teams unchanged')
      it.todo('adds only two teams to the league')
    })
  })

  describe.todo('given a league that throws an unexpected error', () => {
    describe.todo('when a match is processed', () => {
      it.todo('wraps it in a League Error')
    })
    describe.todo('when the teams are called', () => {
      it.todo('wraps it in a League Error')
    })
  })
})

