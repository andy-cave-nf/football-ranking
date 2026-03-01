import type { Result } from '../leagues/types';

export type Ratings = {
  home: TeamRating;
  away: TeamRating;
};

export type TeamRating = { rating: number; uncertainty: number };

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
        rating:
          ratings.home.rating + Math.round(this.k * (result.homeWin - this.expected(ratings).home)),
        uncertainty: ratings.home.uncertainty,
      },
      away: {
        rating:
          ratings.away.rating - Math.round(this.k * (result.homeWin - this.expected(ratings).home)),
        uncertainty: ratings.away.uncertainty,
      },
    };
  }
  private expected(ratings: Ratings): EloRating {
    return {
      home:
        this.quotient(ratings.home.rating) /
        (this.quotient(ratings.home.rating) + this.quotient(ratings.away.rating)),
      away:
        this.quotient(ratings.away.rating) /
        (this.quotient(ratings.home.rating) + this.quotient(ratings.away.rating)),
    };
  }
  private quotient(value: number): number {
    return 10 ** (value / this.scale);
  }
}
