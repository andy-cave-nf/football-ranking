import { InMemoryLeague, type League } from '../../../src/leagues/leagues';

describe('test empty in memory leagues', async () => {
  let league: League;
  let startingElo: number;
  beforeEach(async () => {
    startingElo = 1100
    league = new InMemoryLeague(startingElo);
  })
  it('test that in memory league returns correct starting elo', async () => {
    expect(league.startingElo).toBe(startingElo);
  })
  it('tests that an empty league returns an empty array of teams', async () => {
    expect(league.teams).toHaveLength(0)
  })
  it('tests a team is added', async () => {
    league.add('test-name')
    expect(league.teams).toHaveLength(1)
  })
  it('tests that a team is added with correct elo', async () => {
    league.add('test-name')
    expect(league.teams[0]?.elo).toBe(startingElo)
  })
  it('tests that a team is added with correct name', async () => {
    league.add('test-name')
    expect(league.teams[0]?.name).toBe('test-name')
  })
})

describe('tests that errors are raised correctly with strict leagues', async () => {

  it.todo('test that an error is raised if you try to add a record with teams that arent in the league', async () => {

  })
  it.todo('tests strict leagues stops a record to be added with no teams', async () => {

  })
})
