import type { Result, Team } from '../../../src/leagues/types';
import {
  type League,
} from '../../../src/leagues/base';
import type { Ratings, Ruleset, TeamRating } from '../../../src/rulesets/base';
import { DefaultTeamMap, type TeamMap } from '../../../src/leagues/team_maps';
import { defaultInMemoryLeague } from '../../utils';
import type { SourceTeam } from '../../../src/sources/types';

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
      league = defaultInMemoryLeague({teamMap, ruleset});
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
  describe('given a league with a map of a single team', () => {
    let team: Team
    beforeEach(async () => {
      team = {
        id: 'new-id',
        name: 'new-name',
        mu: 12,
        sigma: 2,
        lastFixtureDate: new Date(2021, 1, 1),
      }
      teamMap = new DefaultTeamMap(new Map([[team.id, team]]));
      league = defaultInMemoryLeague({teamMap});
    })
    test('it has one team', () => {
      expect(league.teams.size).toEqual(1)
    })
    describe('when a match is processed with the existing team', () => {
      let result: Result;
      let newTeam: SourceTeam
      let date: Date;
      beforeEach(async () => {
        date = new Date(2021, 1, 1);
        newTeam = {id: 'id-2', name: 'another-name'}
        result = {
          home: team,
          away: newTeam,
          homeWin: 1,
          date
        }
        league.record(result)
      })
      it('adds a single team', () => {
        expect(league.teams.size).toEqual(2)
      })
      it('updates the existing team correctly', () => {
        expect(league.teams.get(team.id)).toEqual({
          id: team.id,
          name: team.name,
          mu: team.mu + 1,
          sigma: team.sigma + 1,
          lastFixtureDate: date
        })
      })
      it('stores the new team correctly', () => {
        expect(league.teams.get(newTeam.id)).toEqual({
          id: newTeam.id,
          name: newTeam.name,
          mu: 3,
          sigma: 3,
          lastFixtureDate: date
        })
      })
    })
    describe.todo('when standings is called', () => {
      it.todo('returns only the existing team with the correct skill')
    })
  })


  describe('given a league with a map of two teams', () => {
    let existingTeam1: Team
    let existingTeam2: Team
    let teamMap: TeamMap<string, Team>
    beforeEach(async () => {
      existingTeam1 = {id: 'id-1', name: 'team-1', mu: 25, sigma:2, lastFixtureDate: new Date(2021, 1, 1)}
      existingTeam2 = {id: 'id-2', name: 'team-2', mu:12, sigma:3, lastFixtureDate: new Date(2020, 1, 1)}
      teamMap = new DefaultTeamMap(new Map([[existingTeam1.id, existingTeam1],[existingTeam2.id, existingTeam2]]))
      league = defaultInMemoryLeague({teamMap})
    })
    test('it has two teams', () => {
      expect(league.teams.size).toEqual(2)
    })
    describe('when a new match is processed between existing teams', () => {
      let result: Result;
      let date: Date;
      beforeEach(async () => {
        date = new Date(2022,0,1)
        result = {
          home: existingTeam1,
          away: existingTeam2,
          homeWin: 1,
          date
        }
        league.record(result)
      })
      it('has only two teams', () => {
        expect(league.teams.size).toEqual(2)
      })
      it('updates the home team correctly', () => {
        expect(league.teams.get(existingTeam1.id)).toEqual({
          ...existingTeam1,
          mu: existingTeam1.mu+1,
          sigma: existingTeam1.sigma+1,
          lastFixtureDate: date
        })
      })
      it('updates the away team correctly', () => {
        expect(league.teams.get(existingTeam2.id)).toEqual({
          ...existingTeam2,
          mu: existingTeam2.mu+2,
          sigma: existingTeam2.sigma+2,
          lastFixtureDate: date
        })
      })
    })
    describe('when a new match is processed with a single new team', () => {
      let newTeam: SourceTeam
      let result: Result;
      let date: Date;
      beforeEach(async () => {
        date = new Date(2022,0,1)
        newTeam = {id: 'id-3', name: 'another-name'}
        result = {
          home: existingTeam1,
          away: newTeam,
          homeWin: 1,
          date
        }
        league.record(result)
      })
      it('has only three teams', () => {
        expect(league.teams.size).toEqual(3)
      })
      it('updates the existing team correctly', () => {
        expect(league.teams.get(existingTeam1.id)).toEqual({
          ...existingTeam1,
          mu: existingTeam1.mu+1,
          sigma: existingTeam1.sigma+1,
          lastFixtureDate: date
        })
      })
      it('stores the new team correctly', () => {
        expect(league.teams.get(newTeam.id)).toEqual({
          ...newTeam,
          mu: 3,
          sigma: 3,
          lastFixtureDate: date
        })
      })
      it('leaves the remaining team unchanged', () => {
        expect(league.teams.get(existingTeam2.id)).toEqual(existingTeam2)
      })
    })
    describe('when a new match is processed with two different teams', () => {
      let newHome: SourceTeam
      let newAway: SourceTeam
      let result: Result;
      let date: Date;
      beforeEach(async () => {
        date = new Date(2022,0,1)
        newHome = {id:'id-3', name: 'home-team'}
        newAway = {id:'id-4', name:'away-team'}
        result = {
          home: newHome,
          away: newAway,
          homeWin: 1,
          date
        }
        league.record(result)
      })
      it('has only four teams', () => {
        expect(league.teams.size).toEqual(4)
      })
      it('stores the home team correctly', () => {
        expect(league.teams.get(newHome.id)).toEqual({
          ...newHome,
          mu: 2,
          sigma: 2,
          lastFixtureDate: date
        })
      })
      it('stores the away team correctly', () => {
        expect(league.teams.get(newAway.id)).toEqual({
          ...newAway,
          mu: 3,
          sigma: 3,
          lastFixtureDate: date
        })
      })
      it('leaves the remaining teams unchanged', () => {
        expect(league.teams.get(existingTeam1.id)).toEqual(existingTeam1)
        expect(league.teams.get(existingTeam2.id)).toEqual(existingTeam2)
      })
    })
    describe.todo('when standings is called', () => {
      it.todo('returns a list of two teams', () => {})
      it.todo('returns the skills of the teams correctly', () => {})
      it.todo('returns the teams in skill order')
    })
  })
})
