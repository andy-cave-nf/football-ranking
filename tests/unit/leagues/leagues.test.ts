import { InMemoryLeague, type League } from '../../../src/leagues/leagues';
import type { Elo, Ruleset } from '../../../src/rulesets/rulesets';
import type { Result } from '../../../src/leagues/types';
import type { SourceTeam } from '../../../src/sources/types';

let league: League;
let startingElo: number;

beforeEach(async () => {
  startingElo = 100
  league = new InMemoryLeague(startingElo);
})

describe('test empty in memory leagues', async () => {
  it('tests that an empty league returns an empty array of teams', async () => {
    expect(league.teams).toHaveLength(0)
  })
})

describe('tests in memory leagues with a single team', async () => {
  let name: string
  beforeEach(async () => {
    name = 'test-name'
    await league.add(1,name)
  })
  it('tests a team has been added', async () => {
    expect(league.teams).toHaveLength(1)
  })
  it('tests that a team is added correctly', async () => {
    expect(league.teams[0]).toStrictEqual({name:name, elo:startingElo})
  })
})

describe('tests in memory leagues with two teams', async () => {
  let teams: SourceTeam[]
  beforeEach(async () => {
    teams = [{id:'team-1', name: 'home'},{id:'team-2', name: 'away'}]
    for (const team of teams) {await league.add(team.id, team.name)}
  })
  it('tests there are two teams in the league', async () => {
    expect(league.teams).toHaveLength(2)
  })
  it('tests that the teams have the correct starting elo', async () => {
    league.teams.forEach((team) => {
      expect(team.elo).toBe(startingElo)
    })
  })
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
        date: new Date()
      }
      await league.record(result, fakeRuleset)
    })
    it('tests that record calls the ruleset', async () => {
      expect(fakeRuleset.record).toHaveBeenCalledWith(result, {home: startingElo, away: startingElo})
    })

    it('tests that the home elos is correct after a win', async () => {
      expect(league.teams[0]?.elo).toBe(startingElo+8)
    })
    it('tests that the away elo is correct after a loss', async () => {
      expect(league.teams[1]?.elo).toBe(startingElo-8)
    })
  })
  it.todo('test that an error is raised if you try to add a record with teams that arent in the league', async () => {

  })
})


describe('tests that errors are raised correctly within leagues', async () => {

  it.todo('tests an empty leagues stops a record to be added with no teams', async () => {

  })
  it.todo('tests that a team cant be added with the same name or the same id', async () => {

  })
  it.todo('tests that an error is raised if the record added occurs before the previous fixture', async () =>{

  })
})
