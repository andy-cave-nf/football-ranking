import type { Result } from '../../../src/leagues/types';

let results: Result[];
let scores: (0|0.5|1)[]
describe('test that the ratings and uncertainties are calculated from TrueSkillRulesets', ()=>{
  const randomRatings = Array.from({ length: 20 }, () => ({
    home:{
      rating:Math.random() * 50 - 25,
      uncertainty:Math.random() * 25,
    },
    away: {
      rating:Math.random() * 50 - 25,
      uncertainty:Math.random() * 10,
    },
    performanceNoise:Math.random() * 5,
    driftRate:Math.random(),
    drawRate:Math.random()*0.5
  }))
    .map((rating) => ([
      rating.home,rating.away,rating.performanceNoise,rating.driftRate,rating.drawRate,
    ] as const))
  beforeEach(()=>{
    scores = [0,0.5,1]
    results = scores.map(
      (score): Result => ({
        home: { id: '1', name: 'team-1' },
        away: { id: '2', name: 'team-2' },
        homeWin: score,
        date: new Date(),
      })
    );
  })
  it.todo.each(randomRatings)('all results for home = %i, away = %i, noise=%i,driftRate=%i drawRate=%i', (home,away,performanceNoise,driftRate,drawRate) => {
    const ruleset: Ruleset = new TrueSkillRuleset(performanceNoise,driftRate,drawRate);
    for (const result of results) {
      const actual = ruleset.record(result, {home,away});
      const expected = expectedTrueSkill(
        {home, away},
        result,
        performanceNoise,
        driftRate,
        drawRate
      )
      expect(actual).toEqual(expected)
    }
  });
  }
)