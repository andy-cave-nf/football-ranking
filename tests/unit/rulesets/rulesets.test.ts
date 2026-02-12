import { DefaultRuleset, type Elo, type Ruleset } from '../../../src/rulesets/rulesets';
import type { Result } from '../../../src/leagues/types';
import { expectedElo } from '../../utils';

let ruleset: Ruleset;
let results: Result[];
let scores: (0|1|0.5)[]
const elos: Elo[] = Array.from({ length: 500 }, () => ({
  home: Math.round(Math.random() * 1500) + 500,
  away: Math.round(Math.random() * 1500) + 500,
}));
const eloTable = elos.map(elo => [elo.home, elo.away])

describe('test that elos are calculated correctly from default rulesets', ()=>{
  beforeEach(() => {
    ruleset = new DefaultRuleset(16,400);
    scores = [0,1,0.5]
    results = scores.map((score) => ({
      homeTeamId:"1",
      awayTeamId:"2",
      homeWin: score,
      date: new Date(),
    }))
  })
  it.each(eloTable)('all possible results of pair home = %i, away = %i, (test case %#)',(home,away) => {
    for (const result of results) {
      const actual = ruleset.record(result,{home,away})
      const expected: Elo = expectedElo({home, away},result,400,16)
      expect(actual).toEqual(expected)
    }
  })
})