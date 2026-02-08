import { InMemoryLeague, type League } from '../../../src/leagues/leagues';
import type { Elo, Ruleset } from '../../../src/rulesets/rulesets';
import type { Result } from '../../../src/leagues/types';

let league: League;
let startingElo: number;

beforeEach(async () => {
  startingElo = 1100
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
    await league.add(name)
  })
  it('tests a team has been added', async () => {
    expect(league.teams).toHaveLength(1)
  })
  it('tests that a team is added correctly', async () => {
    expect(league.teams[0]).toStrictEqual({name:name, elo:startingElo})
  })
})

describe('tests in memory leagues with two teams', async () => {
  let team1:string
  let team2:string
  beforeEach(async () => {
    team1 = 'home'
    team2 = 'away'
    await league.add(team1)
    await league.add(team2)
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
        record: vi.fn((result:Result, elo:Elo) => ({
          home: elo.home+8*(2*result.homeWin-1),
          away: elo.away-8*(1-2*result.homeWin),
        }))
      }
      result = {
        homeTeamId: 'team-1',
        awayTeamId: 'team-2',
        homeWin: 1,
        date: new Date()
      }
      league.record(result, fakeRuleset)
    })
    it.todo('tests that record calls the ruleset', async () => {
      expect(fakeRuleset.record).toHaveBeenCalledWith(result, startingElo)
    })

  })
  it('tests that a match is recorded', async () => {

  })
})


describe('tests that errors are raised correctly with strict leagues', async () => {

  it.todo('test that an error is raised if you try to add a record with teams that arent in the league', async () => {

  })
  it.todo('tests strict leagues stops a record to be added with no teams', async () => {

  })
})
