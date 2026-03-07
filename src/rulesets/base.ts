import type { Result } from '../leagues/types';

export type Ratings = {
  home: TeamRating;
  away: TeamRating;
};
export type TeamRating = { mu: number; sigma: number };

export interface Ruleset {
  record(result: Result, ratings: Ratings): Ratings;
  newRating(): TeamRating;
}