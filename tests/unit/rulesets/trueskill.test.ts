import type { Ratings } from '../../../src/rulesets/rulesets';
import type { TrueSkillConfig } from '../../../src/rulesets/types';

test.todo('a new rating has the expected mu and sigma')

function expectValidSigma(ratings:Ratings,config:TrueSkillConfig) {
  expect(ratings.home.sigma).toBeGreaterThanOrEqual(config.tau)
  expect(ratings.away.sigma).toBeGreaterThanOrEqual(config.tau)
}

function expectDecreaseSigma(beforeRatings:Ratings,afterRatings:Ratings) {
  expect(afterRatings.home.sigma).toBeLessThanOrEqual(beforeRatings.home.sigma)
  expect(afterRatings.away.sigma).toBeLessThanOrEqual(beforeRatings.away.sigma)
}

describe.todo('given two teams with a home win, when the result is processed', () => {
  it.todo('increases the home mu')
  it.todo('decreases the away mu')
})

describe.todo('given two teams with an away win, when the result is processed', () => {
  it.todo('increases the away mu');
  it.todo('decreases the home mu');
});

describe.todo('given two teams with a drawn result, when the result is processed', () => {
  it.todo('moves the mu values closer together')
})

describe.todo('given two teams with an existing result, when a second result is processed', () => {
  it.todo('produces smaller changes in mu for both teams than the first result')
})

describe.todo('given two teams that have played many matches, when a result is processed', () => {
  it.todo('converges both sigma values to tau');
})

describe.todo('given an upset result and a non-upset result between differently rated teams',() => {
  it.todo('the upset result has a larger mu shift than the non upset result')
})
