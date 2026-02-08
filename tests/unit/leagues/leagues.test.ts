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
})