import {
  InMemoryLeague,
  type League,
  LeagueError,
  SafeLeague,
  StrictLeagueAddition,
  StrictLeagueRecord,
} from '../../../src/leagues/leagues';
import type { Elo, Ruleset } from '../../../src/rulesets/rulesets';
import type { Result } from '../../../src/leagues/types';
import type { SourceTeam } from '../../../src/sources/types';
import { ReadOnlyStrictMap, StrictMapError } from '../../../src/utils';
import type { Team } from '../../../src/leagues/teams';
import { FakeRuleset } from '../fake_setup';

let league: League;
let startingElo: number;

beforeEach(async () => {
  startingElo = 100
  league = new InMemoryLeague(startingElo);
})

describe('test empty in memory leagues', async () => {
  it('tests that an empty league returns an empty array of teams', async () => {
    expect(league.teams.size).toBe(0)
  })
})

describe('tests in memory leagues with a single team', async () => {
  let team: SourceTeam;
  beforeEach(async () => {
    team ={id:1,name: 'test-name'}
    await league.add(team,new Date(2000,0,1));
  })
  it('tests a team has been added', async () => {
    expect(league.teams.size).toBe(1)
  })
  it('tests that a team is added correctly', async () => {
    expect(league.teams.getOrThrow(team.id.toString())).toStrictEqual({
      id: team.id.toString().trim().toLowerCase(),
      name: team.name,
      elo: startingElo,
      lastFixtureDate: new Date(2000, 0, 1),
    });
  })
})

describe('tests in memory leagues with two teams', async () => {
  let teams: SourceTeam[]
  beforeEach(async () => {
    teams = [{id:'team-1', name: 'home'},{id:'team-2', name: 'away'}]
    for (const team of teams) {await league.add(team, new Date(1999,0,1));}
  })
  it('tests there are two teams in the league', async () => {
    expect(league.teams.size).toBe(2)
  })
  it('tests that the teams have the correct starting elo', async () => {
    league.teams.values().forEach((team) => {
      expect(team.elo).toBe(startingElo)
    })
  })
  it('tests that a team cant be added with the same id', async () => {
    const strictLeague: League = new StrictLeagueAddition(league)
    await expect(
      strictLeague.add(
        {id:'team-1',
        name: 'a different_name'}, new Date()
      )
    ).rejects.toThrow(LeagueError)
  })

  it('tests that a team cant be added with the same case independent id', async () => {
    const strictLeague: League = new StrictLeagueAddition(league);
    await expect(strictLeague.add({ id: 'TEAM-1', name: 'a different_name' },new Date())).rejects.toThrow(
      LeagueError
    );
  });

  it('tests that a team cant be added with the same id with extra whitespace', async () => {
    const strictLeague: League = new StrictLeagueAddition(league);
    await expect(strictLeague.add({ id: '    team-1   ', name: 'a different_name' },new Date())).rejects.toThrow(
      LeagueError
    );
  });

  it('tests that a team cant be added with the same name', async () => {
    const strictLeague: League = new StrictLeagueAddition(league);
    await expect(strictLeague.add({id:'team-3', name:'home'}, new Date())).rejects.toThrow(LeagueError);
  });

  it('tests that a team cant be added with the same case independent name', async () => {
    const strictLeague: League = new StrictLeagueAddition(league);
    await expect(strictLeague.add({id:'team-3', name:'HOME'}, new Date())).rejects.toThrow(LeagueError);
  });

  it('tests that a team cant be added with the same name with extra whitespace', async () => {
    const strictLeague: League = new StrictLeagueAddition(league);
    await expect(strictLeague.add({ id: 'team-3', name: '    home    ' }, new Date())).rejects.toThrow(LeagueError);
  });

  describe('tests a record is added to a league with two teams', async () => {
    let fakeRuleset: Ruleset
    let result: Result
    beforeEach(async () => {
      fakeRuleset = {
        record: vi.fn((result:Result, elo:Elo): Elo => ({
          home: elo.home+8*(2*result.homeWin-1),
          away: elo.away-8*(2*result.homeWin-1),
        }))
      }
      result = {
        homeTeamId: teams[0]?.id ?? 1,
        awayTeamId: teams[1]?.id ?? 2,
        homeWin: 1,
        date: new Date(2000,0,1)
      }
      await league.record(result, fakeRuleset)
    })
    it('tests that record calls the ruleset', async () => {
      expect(fakeRuleset.record).toHaveBeenCalledWith(result, {home: startingElo, away: startingElo})
    })

    it('tests that the home elos is correct after a win', async () => {
      expect(league.teams.getOrThrow(result.homeTeamId).elo).toBe(startingElo+8)
    })
    it('tests that the away elo is correct after a loss', async () => {
      expect(league.teams.getOrThrow(result.awayTeamId).elo).toBe(startingElo-8)
    })
    it('tests that the record with capitalised team id in the result does not error', async () => {
      const capitalisedResult: Result = {
        homeTeamId: teams[0]?.id.toString().toUpperCase() ?? 1,
        awayTeamId: teams[1]?.id.toString().toUpperCase() ?? 2,
        homeWin: 1,
        date: new Date(2000, 0, 1),
      };
      await league.record(capitalisedResult, fakeRuleset)
      expect(fakeRuleset.record).toHaveBeenCalled()
    })

    it('test that an error is raised if you try to add a record with a home team that isnt in the league', () => {
      expect(() =>
        league.record({
          ...result,
          homeTeamId: 'not-in-league',
        }, fakeRuleset)
      ).toThrowError(StrictMapError)
    })
    it('tests that an error is raised if you try to add a record with an away team that isnt in the league', () => {
      expect(() =>
        league.record({
          ...result,
          awayTeamId: 'not-in-league',
        }, fakeRuleset)
      ).toThrowError(StrictMapError)
    })
    it('tests that an error is raised if the record added occurs before the previous fixture', () =>{
      const earlyResult: Result = {
        homeTeamId: teams[0]?.id ?? 1,
        awayTeamId: teams[1]?.id ?? 2,
        homeWin: 1,
        date: new Date(1999,0,1),
      };
      const strictLeague = new StrictLeagueRecord(league)
      expect(() => strictLeague.record(earlyResult,fakeRuleset)).toThrowError(LeagueError)
    })
  })

})


describe('safe league raises only league errors', async () => {
  let erroredLeague: League
  let safeLeague: League
  beforeEach(async () => {
    erroredLeague = {
      add: vi.fn(async (_team,_date) => {throw new Error('add throws an error')}),
      record: vi.fn((_result, _ruleset) => {throw new Error('records throws an error')}),
      get teams(): ReadOnlyStrictMap<number|string, Team> {throw new Error('get teams throws an error')}
    }
    safeLeague = new SafeLeague(erroredLeague)
  })
  it('test that add raises a league error', async () =>{
    await expect(safeLeague.add({id:1,name:'a'}, new Date())).rejects.toThrowError(LeagueError)
  })
  it('tests that record raises an error', () =>{
    expect(() =>
      safeLeague.record({
        homeTeamId:1,
        awayTeamId:3,
        homeWin: 1,
        date: new Date(1999,0,1),
      }, new FakeRuleset())
    ).toThrowError(LeagueError)
  })
  it('tests that team raises an error', () =>{
    expect(() => safeLeague.teams).toThrowError(LeagueError)
  })
})