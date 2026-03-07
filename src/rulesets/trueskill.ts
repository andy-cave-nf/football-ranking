import type { Ratings, Ruleset, TeamRating } from './base';
import type { TrueSkillConfig } from './types';
import type { Result } from '../leagues/types';

export class DefaultTrueSkill implements Ruleset {
  constructor(private config: TrueSkillConfig) {}
  newRating():TeamRating{
    return {mu: this.config.mu0, sigma:this.config.sigma0}
  }
  record(result:Result,ratings:Ratings):Ratings {

  }
}