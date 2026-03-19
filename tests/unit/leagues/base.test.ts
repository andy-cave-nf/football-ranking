import {
  StrictLeagueRecord,
  type League,
  LeagueError,
  SafeLeague,
} from '../../../src/leagues/base';
import { defaultInMemoryLeague } from '../../utils';
import { DefaultTeamMap, type ReadOnlyTeamMap } from '../../../src/leagues/team_maps';
import type { Result, Team } from '../../../src/leagues/types';
import type { SourceTeam } from '../../../src/sources/types';
import { addDays } from 'date-fns';
import { record } from 'zod';

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
  describe('given a league with a single existing team', () => {
    let team: Team
    let lastFixtureDate: Date
    beforeEach(() => {
      lastFixtureDate = new Date(2000,0,1)
      team = {id:'team-id',name:'team-name',mu:10,sigma:0.5, lastFixtureDate}
      origin = defaultInMemoryLeague({teamMap: new DefaultTeamMap(new Map<string,Team>([[team.id,team]]))})
      league = new StrictLeagueRecord(origin);
    })
    describe('when a match involving one existing team and one new team, played after the existing teams last fixture date, is processed', () => {
      let newTeam: SourceTeam
      let result: Result
      let date: Date
      beforeEach(async () => {
        date = addDays(lastFixtureDate,1)
        newTeam = {id: 'new-id', name: 'new-name'};
        result = {
          home: newTeam,
          away: team,
          homeWin: 1,
          date,
        }
        league.record(result)
      })
      it('updates the existing team correctly', ()=> {
        expect(league.teams.get(team.id)).toEqual({
          ...team,
          mu: team.mu+2,
          sigma: team.sigma + 2,
          lastFixtureDate: date,
        })
      })
      it('stores the new team correctly', () => {
        expect(league.teams.get(newTeam.id)).toEqual({
          ...newTeam,
          mu: 2,
          sigma: 2,
          lastFixtureDate: date,
        })
      })
      it('adds only a single team to the league', () => {
        expect(league.teams.size).toEqual(2)
      })
    })
    describe('when a match involving the existing team and one new team, played before the existing teams last fixture date, is processed', () => {
      let newTeam: SourceTeam
      let result: Result
      let date: Date
      beforeEach(async () => {
        date = addDays(lastFixtureDate,-1)
        newTeam = {id: 'new-id', name: 'new-name'};
        result = {
          home: team,
          away: newTeam,
          homeWin: 0,
          date,
        }
      })
      it('raises a League Error', () => {
        expect(()=> league.record(result)).toThrow(LeagueError)
      })
    })
    describe('when a match involving two new teams, is processed', () => {
      let newHome: SourceTeam
      let newAway: SourceTeam
      let result: Result
      let date: Date
      beforeEach(async () => {
        newHome = {id: 'new-home',name:'home-name'}
        newAway = {id: 'new-away',name:'away-name'}
        date = new Date(2000,0,1)
        result = {
          home: newHome,
          away: newAway,
          homeWin: 0.5,
          date
        }
        league.record(result)
      })
      it('stores the new home team correctly', () => {
        expect(league.teams.get(newHome.id)).toEqual({
          ...newHome,
          mu: 2,
          sigma: 2,
          lastFixtureDate: date
        })
      })
      it('stores the new away team correctly', () => {
        expect(league.teams.get(newAway.id)).toEqual({
          ...newAway,
          mu: 3,
          sigma: 3,
          lastFixtureDate: date
        })
      })
      it('leaves the existing team unchanged', ()=> {
        expect(league.teams.get(team.id)).toEqual(team)
      })
      it('adds only two teams to the league', () => {
        expect(league.teams.size).toEqual(3)
      })
    })
    describe('when a match involving two new teams, played before the existing teams last fixture date, is processed', () => {
      let newHome: SourceTeam
      let newAway: SourceTeam
      let result: Result
      let date: Date
      beforeEach(async () => {
        date = addDays(team.lastFixtureDate,-1)
        newHome = {id: 'new-id-home', name: 'new-home'};
        newAway = {id: 'new-id-away', name:'new-away'};
        result = {
          home: newHome,
          away: newAway,
          homeWin: 0,
          date,
        }
      })
      it('does not raise a League Error', () => {
        expect(() => league.record(result)).not.toThrow(LeagueError)
      })
      it('stores the new home team correctly', () => {
        league.record(result)
        expect(league.teams.get(newHome.id)).toEqual({
          ...newHome,
          mu: 2,
          sigma: 2,
          lastFixtureDate: date
        })
      })
      it('stores the new away team correctly', () => {
        league.record(result)
        expect(league.teams.get(newAway.id)).toEqual({
          ...newAway,
          mu: 3,
          sigma: 3,
          lastFixtureDate: date
        })
      })
      it('leaves the existing team unchanged', () => {
        league.record(result)
        expect(league.teams.get(team.id)).toEqual(team)
      })
      it('adds only two teams to the league', () => {
        league.record(result)
        expect(league.teams.size).toEqual(3)
      })
    })
  })
  describe('given a league with two existing teams', () => {
    let team1: Team
    let team2: Team
    let date1: Date
    let date2: Date
    beforeEach(async () => {
      date1 = new Date(2000,0,1)
      date2 = new Date(2001,0,1)
      team1 = {id: 'id-1',name:'team-1', mu:12, sigma:3, lastFixtureDate: date1}
      team2 = {id: 'id-2',name:'team-2', mu:15, sigma:5, lastFixtureDate: date2}
      origin = defaultInMemoryLeague({teamMap: new DefaultTeamMap(new Map([[team1.id, team1],[team2.id, team2]]))})
      league = new StrictLeagueRecord(origin)
    })
    describe('when a match involving both teams, played before a single teams last fixture date, is processed', () => {
      let result: Result
      let date: Date
      beforeEach(async () => {
        date = addDays(team2.lastFixtureDate,-1)
        result = {
          home: team1,
          away: team2,
          homeWin: 1,
          date,
        }
      })
      it('raises a League Error', () => {
        expect(()=>league.record(result)).toThrow(LeagueError)
      })
    })
    describe('when a match involving both teams, played before both teams last fixture date, is processed', () => {
      let result: Result
      let date: Date
      beforeEach(async () => {
        date = addDays(team1.lastFixtureDate,-1)
        result = {
          home: team1,
          away: team2,
          homeWin:0,
          date,
        }
      })
      it('raises a League Error', () => {
        expect(()=>league.record(result)).toThrow(LeagueError)
      })
    })
    describe('when a match involving both teams, played after both teams last fixture date, is processed', () => {
      let result: Result
      let date: Date
      beforeEach(async () => {
        date = addDays(team2.lastFixtureDate,1)
        result = {
          home: team1,
          away: team2,
          homeWin:0.5,
          date,
        }
        league.record(result)
      })
      it('updates the home team correctly', () =>{
        expect(league.teams.get(team1.id)).toEqual({
          ...team1,
          mu: team1.mu+1,
          sigma: team1.sigma+1,
          lastFixtureDate: date,
        })
      })
      it('updates the away team correctly', () => {
        expect(league.teams.get(team2.id)).toEqual({
          ...team2,
          mu: team2.mu+2,
          sigma: team2.sigma+2,
          lastFixtureDate: date,
        })
      })
      it('has only two teams in the league', () => {
        expect(league.teams.size).toEqual(2)
      })
    })
    describe('when a match with two new teams, played before an existing teams last fixture date, is processed', () => {
      let newHome: SourceTeam
      let newAway: SourceTeam
      let result: Result
      let date: Date
      beforeEach(async () => {
        date = addDays(team1.lastFixtureDate,-1)
        newHome = {id: 'new-home-id', name: 'new-home-name'}
        newAway = {id: 'new-away-id', name: 'new-away-name'}
        result = {
          home: newHome,
          away: newAway,
          homeWin: 1,
          date,
        }
      })
      it('does not raise a League Error', () => {
        expect(()=>league.record(result)).not.toThrow(LeagueError)
      })
      it('stores the new home team correctly', () => {
        league.record(result)
        expect(league.teams.get(newHome.id)).toEqual({
          ...newHome,
          mu: 2,
          sigma: 2,
          lastFixtureDate: date,
        })
      })
      it('stores the new away team correctly', () => {
        league.record(result)
        expect(league.teams.get(newAway.id)).toEqual({
          ...newAway,
          mu: 3,
          sigma: 3,
          lastFixtureDate: date,
        })
      })
      it('adds only two teams to the league', () => {
        league.record(result)
        expect(league.teams.size).toEqual(4)
      })
      it('leaves the existing teams unchanged', () => {
        league.record(result)
        expect(league.teams.get(team1.id)).toEqual(team1)
        expect(league.teams.get(team2.id)).toEqual(team2)
      })
    })
  })
})

describe('Safe League' , () => {
  let league: SafeLeague
  let origin: League
  describe('given an empty league', () => {
    beforeEach(() => {
      origin = defaultInMemoryLeague()
      league = new SafeLeague(origin)
    })
    test('it has no teams', () => {
      expect(league.teams.size).toEqual(0)
    })
    describe('when a match is processed', () => {
      let home: SourceTeam
      let away: SourceTeam
      let result: Result
      let date: Date
      beforeEach(async () => {
        home = {id: 'home-id', name: 'home-name'}
        away = {id: 'away-id', name: 'away-name'}
        date = new Date(2000,0,1)
        result = {
          home:home,
          away:away,
          homeWin:0.5,
          date,
        }
      })
      it('does not raise a League Error', () => {
        expect(()=>league.record(result)).not.toThrow(LeagueError)
      })
      it('stores the new home team correctly', () => {
        league.record(result)
        expect(league.teams.get(home.id)).toEqual({
          ...home,
          mu: 2,
          sigma: 2,
          lastFixtureDate: date,
        })
      })
      it('stores the new away team correctly', () => {
        league.record(result)
        expect(league.teams.get(away.id)).toEqual({
          ...away,
          mu: 3,
          sigma: 3,
          lastFixtureDate: date,
        })
      })
      it('adds only two teams to the league', () => {
        league.record(result)
        expect(league.teams.size).toEqual(2)
      })
    })
  })
  describe('given a league with an existing team', () => {
    let existingTeam: Team
    beforeEach(async () => {
      existingTeam = {
        id:'existing-id',
        name:'existing-name',
        mu: 12,
        sigma:3.5,
        lastFixtureDate: new Date(2000,0,1)
      }
      origin = defaultInMemoryLeague({teamMap:new DefaultTeamMap(new Map([[existingTeam.id,existingTeam]]))})
      league = new SafeLeague(origin)
    })
    test('it has only one team', () => {
      expect(league.teams.size).toEqual(1)
    })
    describe('when a match is processed with the existing team', () => {
      let newTeam: SourceTeam
      let result: Result
      let date: Date
      beforeEach(async () => {
        newTeam = {id: 'new-id',name:'new-name'}
        date = new Date(2000,0,2)
        result = {
          home: newTeam,
          away: existingTeam,
          homeWin: 1,
          date,
        }
      })
      it('does not raise a League Error', () => {
        expect(()=> league.record(result)).not.toThrow(LeagueError)
      })
      it('stores the new team correctly', () => {
        league.record(result)
        expect(league.teams.get(newTeam.id)).toEqual({
          ...newTeam,
          mu: 2,
          sigma: 2,
          lastFixtureDate: date
        })
      })
      it('updates the existing team correctly', () => {
        league.record(result)
        expect(league.teams.get(existingTeam.id)).toEqual({
          ...existingTeam,
          mu: existingTeam.mu+2,
          sigma: existingTeam.sigma+2,
          lastFixtureDate: date,
        })
      })
      it('adds only one team to the league', () => {
        league.record(result)
        expect(league.teams.size).toEqual(2)
      })
    })
    describe('when a match is processed with two new teams', () => {
      let newTeam1: SourceTeam
      let newTeam2: SourceTeam
      let date: Date
      let result: Result
      beforeEach(async () => {
        newTeam1 = {id: 'new-id-1',name:'new-name-1'}
        newTeam2 = {id: 'new-id-2',name:'new-name-2'}
        date = new Date(2000,0,2)
        result = {
          home: newTeam1,
          away: newTeam2,
          homeWin: 0.5,
          date,
        }
      })
      it('does not raise a League Error', () => {
        expect(()=>league.record(result)).not.toThrow(LeagueError)
      })
      it('stores the new home team correctly', () => {
        league.record(result)
        expect(league.teams.get(newTeam1.id)).toEqual({
          ...newTeam1,
          mu: 2,
          sigma: 2,
          lastFixtureDate: date,
        })
      })
      it('stores the new away team correctly', () => {
        league.record(result)
        expect(league.teams.get(newTeam2.id)).toEqual({
          ...newTeam2,
          mu: 3,
          sigma: 3,
          lastFixtureDate: date,
        })
      })
      it('adds only two teams to the league', () => {
        league.record(result)
        expect(league.teams.size).toEqual(3)
      })
      it('leaves the existing team unchanged', () => {
        league.record(result)
        expect(league.teams.get(existingTeam.id)).toEqual(existingTeam)
      })
    })
  })
  describe('given a league with two existing teams', () => {
    let existingTeam1: Team
    let existingTeam2: Team
    let date1: Date
    let date2: Date
    beforeEach(async () => {
      date1 = new Date(2000,0,1)
      date2 = new Date(2000,0,2)
      existingTeam1 = {id: 'existing-id-1', name: 'existing-name-1', mu: 25, sigma: 2, lastFixtureDate: date1}
      existingTeam2 = {id: 'existing-id-2', name: 'existing-name-2', mu: 12, sigma: 3, lastFixtureDate: date2}
      origin = defaultInMemoryLeague({teamMap: new DefaultTeamMap(new Map([[existingTeam1.id, existingTeam1],[existingTeam2.id, existingTeam2]]))})
      league = new SafeLeague(origin)
    })
    describe('when a match is processed with between existing teams', () => {
      let result: Result
      let date: Date
      beforeEach(async () => {
        date = new Date(2000,0,3)
        result = {
          home: existingTeam1,
          away: existingTeam2,
          homeWin: 1,
          date
        }
      })
      it('does not raise a League Error', () => {
        expect(()=>league.record(result)).not.toThrow(LeagueError)
      })
      it('updates the home team correctly', () => {
        league.record(result)
        expect(league.teams.get(existingTeam1.id)).toEqual({
          ...existingTeam1,
          mu: existingTeam1.mu+1,
          sigma: existingTeam1.sigma+1,
          lastFixtureDate: date,
        })
      })
      it('updates the away team correctly', () => {
        league.record(result)
        expect(league.teams.get(existingTeam2.id)).toEqual({
          ...existingTeam2,
          mu: existingTeam2.mu+2,
          sigma: existingTeam2.sigma+2,
          lastFixtureDate: date,
        })
      })
      it('has only two teams', () => {
        league.record(result)
        expect(league.teams.size).toEqual(2)
      })
    })
    describe('when a match is processed with one new team', () => {
      let newTeam: SourceTeam
      let result: Result
      let date: Date
      beforeEach(async () => {
        date = new Date(2000,0,3)
        newTeam = {id: 'new-id-1', name: 'new-name-1'}
        result = {
          home: newTeam,
          away: existingTeam1,
          homeWin:0,
          date,
        }
      })
      it('does not raise a League Error', () => {
        expect(()=>league.record(result)).not.toThrow(LeagueError)
      })
      it('stores the new team correctly', () => {
        league.record(result)
        expect(league.teams.get(newTeam.id)).toEqual({
          ...newTeam,
          mu: 2,
          sigma: 2,
          lastFixtureDate: date,
        })
      })
      it('updates the existing team correctly', () => {
        league.record(result)
        expect(league.teams.get(existingTeam1.id)).toEqual({
          ...existingTeam1,
          mu: existingTeam1.mu+2,
          sigma: existingTeam1.sigma+2,
          lastFixtureDate: date,
        })
      })
      it('leaves the existing team unchanged', () => {
        league.record(result)
        expect(league.teams.get(existingTeam2.id)).toEqual(existingTeam2)
      })
      it('adds only one team to the league', () => {
        league.record(result)
        expect(league.teams.size).toEqual(3)
      })
    })
    describe('when a match is processed with two new teams', () => {
      let newHome: SourceTeam
      let newAway: SourceTeam
      let result: Result
      let date: Date
      beforeEach(async () => {
        newHome = {id: 'new-home-id-1', name: 'new-home'}
        newAway = {id: 'new-away-id-2', name: 'new-away'}
        date = new Date(2000,0,3)
        result = {
          home: newHome,
          away: newAway,
          homeWin: 1,
          date,
        }
      })
      it('does not raise a League Error', ()=> {
        expect(()=> league.record(result)).not.toThrow(LeagueError)
      })
      it('stores the new home team correctly', () => {
        league.record(result)
        expect(league.teams.get(newHome.id)).toEqual({
          ...newHome,
          mu: 2,
          sigma: 2,
          lastFixtureDate: date,
        })
      })
      it('stores the new away team correctly', () => {
        league.record(result)
        expect(league.teams.get(newAway.id)).toEqual({
          ...newAway,
          mu: 3,
          sigma: 3,
          lastFixtureDate: date,
        })
      })
      it('leaves the existing teams unchanged', ()=>{
        league.record(result)
        expect(league.teams.get(existingTeam1.id)).toEqual(existingTeam1)
        expect(league.teams.get(existingTeam2.id)).toEqual(existingTeam2)
      })
      it('adds only two teams to the league', () => {
        league.record(result)
        expect(league.teams.size).toEqual(4)
      })
    })
  })

  describe('given a league that throws an unexpected error', () => {
    let result: Result
    beforeEach(async () => {
      result = {
        home: {id:'1', name:'home'},
        away: {id:'2',name:'away'},
        homeWin: 1,
        date: new Date()
      }
      origin = {
        get teams(): ReadOnlyTeamMap<string, Team> {throw new Error('errored league')},
        record(_result: Result) {
          throw new Error('errored league')
        }
      }
      league = new SafeLeague(origin)
    })
    describe('when a match is processed', () => {
      it('wraps it in a League Error', () => {
        expect(()=>league.record(result)).toThrow(LeagueError)
      })
    })
    describe('when the teams are called', () => {
      it('wraps it in a League Error', () => {
        expect(()=> league.teams).toThrow(LeagueError)
      })
    })
  })
})

describe.todo('Fixed Names', () => {
  describe.todo('given a league with an existing team', () => {
    describe.todo('when a new match is processed with the existing team with a changed name', () => {
      it.todo('raises a league error')
    })
    describe.todo('when a match is processed with the existing team with the same name', () => {
      it.todo('does not raise a League Error')
      it.todo('stores the new team correctly')
      it.todo('updates the existing team correctly')
      it.todo('adds a single team to the league')
    })
  })
})
