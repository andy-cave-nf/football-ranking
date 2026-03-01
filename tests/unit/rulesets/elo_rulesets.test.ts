import { EloRuleset } from '../../../src/rulesets/rulesets';
import type { Result } from '../../../src/leagues/types';
import { expectedElo } from '../../utils';

let results: Result[];
let scores: (0 | 1 | 0.5)[];

describe('test that elos are calculated as expected from EloRuleset', () => {
  const randomElos = Array.from({ length: 20 }, () => ({
    home: Math.round(Math.random() * 1500) + 500,
    away: Math.round(Math.random() * 1500) + 500,
    k: Math.round(Math.random() * 32) + 2,
    scale: Math.round(Math.random() * 32) * 25 + 200,
  })).map((generatedElo) => [
    generatedElo.home,
    generatedElo.away,
    generatedElo.k,
    generatedElo.scale,
  ]);
  const equalElosTable = Array.from({ length: 20 }, () => ({
    elo: Math.round(Math.random() * 1500) + 500,
    k: Math.round(Math.random() * 32) + 2,
    scale: Math.round(Math.random() * 32) * 25 + 200,
  })).map((generatedElo) => [generatedElo.elo, generatedElo.k, generatedElo.scale]);
  beforeEach(() => {
    scores = [0, 1, 0.5];
    results = scores.map(
      (score): Result => ({
        home: { id: '1', name: 'team-1' },
        away: { id: '2', name: 'team-2' },
        homeWin: score,
        date: new Date(),
      })
    );
  });
  it.each(randomElos)(
    'all possible results of pair home = %i, away = %i, k=%i, scale=%i (test case %#)',
    (home, away, k, scale) => {
      const ruleset = new EloRuleset(k, scale);
      for (const result of results) {
        const actual = ruleset.record(result, {
          home: { rating: home, uncertainty: 0 },
          away: { rating: away, uncertainty: 0 },
        });
        const expected: { home: number; away: number } = expectedElo(
          { home, away },
          result,
          scale,
          k
        );
        expect({ home: actual.home.rating, away: actual.away.rating }).toEqual(expected);
      }
    }
  );
  it.each(randomElos)(
    'tests that the sum of elos before is the same as after home = %i, away = %i, k=%i, scale=%i (test case %#)',
    (home, away, k, scale) => {
      const ruleset = new EloRuleset(k, scale);
      for (const result of results) {
        const actual = ruleset.record(result, {
          home: { rating: home, uncertainty: 0 },
          away: { rating: away, uncertainty: 0 },
        });
        expect(actual.home.rating + actual.away.rating).toEqual(home + away);
      }
    }
  );
  it.each(equalElosTable)(
    'tests that draws do not change equal elos elo=%i, k=%i, scale=%i (test case %#)',
    (rating, k, scale) => {
      const ruleset = new EloRuleset(k, scale);
      const result: Result = {
        home: { id: '1', name: 'team-1' },
        away: { id: '2', name: 'team-2' },
        homeWin: 0.5,
        date: new Date(),
      };
      const actual = ruleset.record(result, {
        home: { rating, uncertainty: 0 },
        away: { rating, uncertainty: 0 },
      });
      expect({ home: actual.home.rating, away: actual.home.rating }).toEqual({
        home: rating,
        away: rating,
      });
    }
  );

  it.each(equalElosTable)(
    'tests win for teams with equal elo elo=%i, k=%i, scale=%i (test case %#)',
    (rating, k, scale) => {
      const ruleset = new EloRuleset(k, scale);

      const result: Result = {
        home: { id: '1', name: 'team-1' },
        away: { id: '2', name: 'team-2' },
        homeWin: Math.round(Math.random()) as 0 | 1,
        date: new Date(),
      };
      const actual = ruleset.record(result, {
        home: { rating, uncertainty: 0 },
        away: { rating, uncertainty: 0 },
      });
      const delta = Math.round((k / 2) * (2 * result.homeWin - 1));
      const expected = {
        home: rating + delta,
        away: rating - delta,
      };
      expect({ home: actual.home.rating, away: actual.away.rating }).toEqual(expected);
    }
  );
});
