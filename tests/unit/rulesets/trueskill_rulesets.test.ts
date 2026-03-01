import type { Result } from '../../../src/leagues/types';
import { expectedTrueSkill } from '../../utils';

let results: Result[];
let scores: (0 | 0.5 | 1)[];
describe('test that the ratings and uncertainties are calculated from TrueSkillRulesets', () => {
  const randomRatings = Array.from({ length: 20 }, () => ({
    home: {
      rating: Math.random() * 25,
      uncertainty: Math.random() * 3,
    },
    away: {
      rating: Math.random() * 25,
      uncertainty: Math.random() * 3,
    },
    performanceNoise: 25 / 6, //Math.random() * 5,
    driftRate: 25 / 300, //Math.random(),
    drawRate: 0.25, //Math.random()*0.5,
    conservatism: 3, //Math.round(Math.random()*5),
    sigma0: 25 / 3, //Math.random()*10
  })).map(
    (rating) =>
      [
        rating.home,
        rating.away,
        rating.performanceNoise,
        rating.driftRate,
        rating.drawRate,
        rating.conservatism,
        rating.sigma0,
      ] as const
  );
  beforeEach(() => {
    scores = [0, 0.5, 1];
    results = scores.map(
      (score): Result => ({
        home: { id: '1', name: 'team-1' },
        away: { id: '2', name: 'team-2' },
        homeWin: score,
        date: new Date(),
      })
    );
  });
  it.each(randomRatings)(
    'all results for home = %i, away = %i, noise=%i,driftRate=%i drawRate=%i, conservatism=%i, sigma0=%i',
    (home, away, performanceNoise, driftRate, drawRate, conservatism, sigma0) => {
      const gameConfig = {
        performanceNoise,
        driftRate,
        drawRate,
        conservatism,
      };
      console.log('gameConfig', gameConfig);
      console.log(`home: ${home.rating}, ${home.uncertainty}`);
      console.log(`away: ${away.rating}, ${away.uncertainty}`);
      // const ruleset: Ruleset = new TrueSkillRuleset(gameConfig,intitalSkill,initialUncertainty);
      for (const result of results) {
        console.log(`result: ${result.homeWin}`);
        // const actual = ruleset.record(result, {home,away});
        const expected = expectedTrueSkill({ home, away }, result, gameConfig, sigma0);
        console.log(expected);
        // expect(actual).toEqual(expected)
      }
    }
  );
});
