import type { Result, Team } from '../../../src/leagues/types';
import {
  type League,
} from '../../../src/leagues/base';
import type { Ratings, Ruleset, TeamRating } from '../../../src/rulesets/base';
import { DefaultTeamMap, type TeamMap } from '../../../src/leagues/team_maps';
import { InMemoryLeague } from '../../../src/leagues/in_memory';

describe('InMemoryLeague', () => {
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
