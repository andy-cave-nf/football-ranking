import { DefaultRuleset, type Elo} from '../../../src/rulesets/rulesets';
import type { Result } from '../../../src/leagues/types';
import { expectedElo } from '../../utils';

let results: Result[];
let scores: (0|1|0.5)[]
const randomElos = Array.from({ length: 100 }, () => [
  Math.round(Math.random() * 1500) + 500,
  Math.round(Math.random() * 1500) + 500,
  Math.round(Math.random() * 32) + 2,
  Math.round(Math.random() * 32) * 25 + 200,
]);

const equalElosTable = Array.from({ length: 100 }, () => [
  Math.round(Math.random() * 1500) + 500,
  Math.round(Math.random() * 32) + 2,
  Math.round(Math.random() * 32) * 25 + 200,
]);

describe('test that elos are calculated as expected from Default Ruleset', ()=>{
  beforeEach(() => {
    scores = [0,1,0.5]
    results = scores.map((score):Result => ({
      homeTeamId:"1",
      awayTeamId:"2",
      homeWin: score,
      date: new Date(),
    }))
  })
  it.each(randomElos)('all possible results of pair home = %i, away = %i, k=%i, scale=%i (test case %#)',(home,away,k,scale) => {
    const ruleset = new DefaultRuleset(k,scale);
    for (const result of results) {
      const actual = ruleset.record(result,{home,away})
      const expected: Elo = expectedElo({home, away},result,scale,k)
      expect(actual).toEqual(expected)
    }
  })
  it.each(equalElosTable)('tests win for home team with equal elo home=%i, k=%i, scale=%i (test case %#)',(elo, k, scale) => {
    const ruleset = new DefaultRuleset(k, scale);

    const result: Result = {
      homeTeamId:"1",
      awayTeamId:"2",
      homeWin: Math.round(Math.random()) as 0 | 1,
      date: new Date(),
    }
    const actual = ruleset.record(result, { home: elo,away: elo})
    const delta = Math.round((k / 2) * (2 * result.homeWin - 1));
    const expected: Elo = {
      home: elo+delta,
      away: elo-delta
    }
    expect(actual).toEqual(expected)
  })
  it.todo('tests that for equal elos that wins change elo by half of k')
  it.todo('tests that for unequal elos that elos afterwards cannot be the same as before')
  it.todo('tests that for equal elos draws always give the same elos as before')
  it.todo('tests that the sum of elos before is the same as after')
})