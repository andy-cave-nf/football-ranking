import type { Result } from '../leagues/types';

export type Ratings = {
  home: TeamRating;
  away: TeamRating;
};

export type TeamRating = { mu: number; sigma: number };

type EloRating = { home: number; away: number };

export interface Ruleset {
  record(result: Result, ratings: Ratings): Ratings;
}

export class EloRuleset implements Ruleset {
  constructor(
    private k: number,
    private scale: number
  ) {}
  record(result: Result, ratings: Ratings): Ratings {
    return {
      home: {
        mu:
          ratings.home.mu + Math.round(this.k * (result.homeWin - this.expected(ratings).home)),
        sigma: ratings.home.sigma,
      },
      away: {
        mu:
          ratings.away.mu - Math.round(this.k * (result.homeWin - this.expected(ratings).home)),
        sigma: ratings.away.sigma,
      },
    };
  }
  private expected(ratings: Ratings): EloRating {
    return {
      home:
        this.quotient(ratings.home.mu) /
        (this.quotient(ratings.home.mu) + this.quotient(ratings.away.mu)),
      away:
        this.quotient(ratings.away.mu) /
        (this.quotient(ratings.home.mu) + this.quotient(ratings.away.mu)),
    };
  }
  private quotient(value: number): number {
    return 10 ** (value / this.scale);
  }
}
