import { DefaultRuleset, type Elo, type Ruleset } from '../../../src/rulesets/rulesets';
import type { Result } from '../../../src/leagues/types';
import { expectedElo } from '../../utils';

let ruleset: Ruleset;
let results: Result[];
let scores: (0|1|0.5)[]
const scale = 400
const k = 16
const randomElos = Array.from({ length: 100 }, () => ([
  Math.round(Math.random() * 1500) + 500,
  Math.round(Math.random() * 1500) + 500,
]));
// const eloTable = randomElos.map(elo => [elo.home, elo.away])

const equalElosTable = Array.from({length: 100}, () => (Math.round(Math.random()*1500)+500))
  .map(rank => [rank, rank])

describe('test that elos are calculated as expected from Default Ruleset', ()=>{
  beforeEach(() => {
    ruleset = new DefaultRuleset(k,scale);
    scores = [0,1,0.5]
    results = scores.map((score):Result => ({
      homeTeamId:"1",
      awayTeamId:"2",
      homeWin: score,
      date: new Date(),
    }))
  })
  it.each(randomElos)('all possible results of pair home = %i, away = %i, (test case %#)',(home,away) => {
    for (const result of results) {
      const actual = ruleset.record(result,{home,away})
      const expected: Elo = expectedElo({home, away},result,scale,k)
      expect(actual).toEqual(expected)
    }
  })
  it.each(equalElosTable)('tests win for home team with equal elo home=%i away=%i (test case %#)',(home,away) => {
    const result: Result = {
      homeTeamId:"1",
      awayTeamId:"2",
      homeWin: Math.round(Math.random()) as 0 | 1,
      date: new Date(),
    }
    const actual = ruleset.record(result, {home,away})
    const expected: Elo = {
      home: home+(k/2)*(2*result.homeWin-1),
      away: away-(k/2)*(2*result.homeWin-1)}
    expect(actual).toEqual(expected)
  })
  it.todo('tests that for equal elos that wins change elo by half of k')
  it.todo('tests that for unequal elos that elos afterwards cannot be the same as before')
  it.todo('tests that for equal elos draws always give the same elos as before')
  it.todo('tests that the sum of elos before is the same as after')
})