import { DefaultRuleset, type Elo} from '../../../src/rulesets/rulesets';
import type { Result } from '../../../src/leagues/types';
import { expectedElo } from '../../utils';

let results: Result[];
let scores: (0|1|0.5)[]

describe('test that elos are calculated as expected from Default Ruleset', ()=>{
  const randomElos = Array.from({ length: 20 }, () => ({
    home:Math.round(Math.random() * 1500) + 500,
    away: Math.round(Math.random() * 1500) + 500,
    k: Math.round(Math.random() * 32) + 2,
    scale: Math.round(Math.random() * 32) * 25 + 200,
  }))
    .map((generatedElo) => ([
      generatedElo.home,generatedElo.away,generatedElo.k,generatedElo.scale,
    ]))
  ;

  const equalElosTable = Array.from({ length: 20 }, () => ({
    elo: Math.round(Math.random() * 1500) + 500,
    k: Math.round(Math.random() * 32) + 2,
    scale: Math.round(Math.random() * 32) * 25 + 200,
  }))
    .map((generatedElo) => ([
      generatedElo.elo,generatedElo.k,generatedElo.scale
    ]));
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
  it.each(randomElos)(
    'tests that the sum of elos before is the same as after home = %i, away = %i, k=%i, scale=%i (test case %#)',
    (home,away, k, scale) => {
      const ruleset = new DefaultRuleset(k, scale);
      for (const result of results) {
        const actual = ruleset.record(result,{home,away})
        expect(actual.home+actual.away).toEqual(home+away)
      }
    }
  );
  it.each(equalElosTable)('tests that draws do not change equal elos elo=%i, k=%i, scale=%i (test case %#)',(elo, k, scale) => {
    const ruleset = new DefaultRuleset(k,scale);
    const result: Result = {
      homeTeamId:"1",
      awayTeamId:"2",
      homeWin: 0.5,
      date: new Date()
    }
    const actual = ruleset.record(result, { home: elo, away: elo})
    expect(actual).toEqual({home:elo, away:elo})
  })

  it.each(equalElosTable)('tests win for teams with equal elo elo=%i, k=%i, scale=%i (test case %#)',(elo, k, scale) => {
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
})

