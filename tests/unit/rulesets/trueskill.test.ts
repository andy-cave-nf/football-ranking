import type { TrueSkillConfig } from '../../../src/rulesets/types';
import type { Result } from '../../../src/leagues/types';
import type { Ratings, Ruleset } from '../../../src/rulesets/base';
import { DefaultTrueSkill } from '../../../src/rulesets/trueskill';

function expectValidSigma(ratings: Ratings, config: TrueSkillConfig) {
  expect(ratings.home.sigma).toBeGreaterThanOrEqual(config.tau);
  expect(ratings.away.sigma).toBeGreaterThanOrEqual(config.tau);
}

function expectDecreaseSigma(beforeRatings:Ratings,afterRatings:Ratings) {
  expect(afterRatings.home.sigma).toBeLessThanOrEqual(beforeRatings.home.sigma)
  expect(afterRatings.away.sigma).toBeLessThanOrEqual(beforeRatings.away.sigma)
}

describe('DefaultTrueSkill', () => {
  let ruleset: Ruleset;
  let config: TrueSkillConfig;

  beforeEach(() => {
    config = {
      mu0: 25,
      sigma0: 25/3,
      beta: 25/6,
      tau: 25/300,
      drawRate: 0.25
    }
    ruleset = new DefaultTrueSkill(config)
  })
  test('a new rating has the expected mu and sigma', () => {
    const actual = ruleset.newRating()
    expect(actual).toStrictEqual({mu:config.mu0,sigma:config.sigma0})
  })

  describe('given two teams with a home win', () => {
    let result: Result
    beforeEach(() => {
      result = {
        home: {id:'id-1',name:'team-1'},
        away: {id:'id-2',name:'team-2'},
        homeWin: 1,
        date: new Date(),
      }
    })
    describe('when the result is processed', () => {
      let before: Ratings;
      let after: Ratings;
      beforeEach(() => {
        before = {
          home: {mu: 25, sigma: 25/3},
          away: {mu: 25, sigma: 25/3}
        }
        after = ruleset.record(result,before)
      })
      it('increases the home mu', () => {
        expect(after.home.mu).toBeGreaterThan(before.home.mu)
        expectValidSigma(after,config)
        expectDecreaseSigma(before,after)
      })
      it('decreases the away mu', () => {
        expect(after.away.mu).toBeLessThan(before.away.mu)
      })
    })
  })

  describe('given two teams with an away win', () => {
    let result: Result
    beforeEach(() => {
      result = {
        home: { id: 'id-1', name: 'team-1' },
        away: { id: 'id-2', name: 'team-2' },
        homeWin: 0,
        date: new Date(),
      };
    })
    describe('when the result is processed', () => {
      let before: Ratings;
      let after: Ratings;
      beforeEach(() => {
        before = {
          home: { mu: 25, sigma: 25 / 3 },
          away: { mu: 25, sigma: 25 / 3 },
        };
        after = ruleset.record(result, before);
      })
      it('increases the away mu', () => {
        expect(after.away.mu).toBeGreaterThan(before.away.mu)
        expectValidSigma(after,config)
        expectDecreaseSigma(before,after)
      });
      it('decreases the home mu', () => {
        expect(after.home.mu).toBeLessThan(before.home.mu)
      });
    })
  });

  describe('given two teams with a drawn result', () => {
    let result: Result
    beforeEach(() => {
      result = {
        home: { id: 'id-1', name: 'team-1' },
        away: { id: 'id-2', name: 'team-2' },
        homeWin: 0.5,
        date: new Date(),
      };
    })
    describe('when the result is processed', () => {
      let before: Ratings;
      let after: Ratings;
      beforeEach(() => {
        before = {
          home: { mu: 30, sigma: 30 / 3 },
          away: { mu: 20, sigma: 20 / 3 },
        };
        after = ruleset.record(result, before);
      })
      it('moves the mu values closer together', () => {
        expect(after.home.mu - after.away.mu).toBeLessThan(before.home.mu-before.away.mu)
        expectValidSigma(after, config);
        expectDecreaseSigma(before, after);
      })
    })
  })

  describe('given two teams that play many matches with alternating results', () => {
    let init: Ratings
    let results: Result[]
    beforeEach(() => {
      init = {
        home: { mu: 25, sigma: 25 / 3 },
        away: { mu: 25, sigma: 25 / 3 },
      };
      results = Array.from({length:100}, (_,i) => ({
        home: {id:'home-id',name:'team-1'},
        away: {id: 'away-id',name:'team-2'},
        homeWin: (i % 2) as 1|0,
        date: new Date(),
      }))
    })

    describe('when each match is processed', () => {
      let ratings: Ratings[]
      beforeEach(() => {
        ratings = []
        let newRating = init
        for (const result of results) {
          ratings.push(newRating)
          newRating = ruleset.record(result,newRating)
        }
      })
      it('converges both sigma values to tau', () => {
        for (let i = 0; i < ratings.length-1; i++) {
          const before = ratings[i] as Ratings
          const after = ratings[i+1] as Ratings
          expect(after.home.sigma - config.tau).toBeLessThanOrEqual(before.home.sigma-config.tau);
          expect(after.away.sigma - config.tau).toBeLessThanOrEqual(before.away.sigma-config.tau);
        }
      });
      // eslint-disable-next-line vitest/expect-expect
      it('decreases both sigma values', () => {
        for (let i = 0; i < ratings.length-1; i++) {
          const before = ratings[i] as Ratings
          const after = ratings[i+1] as Ratings
          expectDecreaseSigma(before,after)
        }
      })
    })
  })

  describe('given an upset result and a non-upset result between differently rated teams',() => {
    let result: Result
    let beforeUpset: Ratings
    let beforeExpected: Ratings
    beforeEach(() => {
      result = {
        home: {id:'id-1', name: 'team-1'},
        away: {id:'id-2', name: 'team-2'},
        homeWin: 0,
        date: new Date(),
      }
      beforeUpset = {
        home: {mu:25,sigma:25/3},
        away: {mu:10,sigma:25/3}
      }
      beforeExpected = {
        home: {mu:10,sigma:25/3},
        away: {mu:25,sigma:25/3}
      }
    })
    describe('when each match is processed', () => {
      let afterUpset: Ratings
      let afterExpected: Ratings
      beforeEach(() => {
        afterUpset = ruleset.record(result, beforeUpset)
        afterExpected = ruleset.record(result, beforeExpected)
      })
      it('the upset result has a larger mu shift for the winner than the non upset result', () => {
        const upsetWinnerShift = Math.abs(afterUpset.away.mu - beforeUpset.away.mu)
        const expectedWinnerShift = Math.abs(afterExpected.away.mu - beforeExpected.away.mu)
        expect(upsetWinnerShift).toBeGreaterThan(expectedWinnerShift)
      })
      it('the upset result has a larger mu shift for the loser than the non upset result', () => {
        const upsetLoserShift = Math.abs(afterUpset.home.mu - beforeUpset.home.mu)
        const expectedLoserShift = Math.abs(afterExpected.home.mu - beforeExpected.home.mu)
        expect(upsetLoserShift).toBeGreaterThan(expectedLoserShift)
      })
    })

  })
})

