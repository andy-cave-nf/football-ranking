import type { Ratings, Ruleset, TeamRating } from './base';
import type { TrueSkillConfig } from './types';
import type { Result } from '../leagues/types';
import { Rating, TrueSkill } from 'ts-trueskill';

export class DefaultTrueSkill implements Ruleset {
  private trueSkill: TrueSkill
  constructor(private config: TrueSkillConfig) {
    this.trueSkill = new TrueSkill(
      config.mu0,
      config.sigma0,
      config.beta,
      config.tau,
      config.drawRate
    )
  }
  newRating():TeamRating{
    return {mu: this.config.mu0, sigma:this.config.sigma0}
  }
  record(result:Result,ratings:Ratings):Ratings {
    const home = new Rating(ratings.home.mu,ratings.home.sigma);
    const away = new Rating(ratings.away.mu,ratings.away.sigma);
    const [newHome, newAway] = this.trueSkill.rate(
      [[home],[away]],
      [
        Math.floor(1-result.homeWin),
        Math.floor(result.homeWin)
      ]
    );
    return {
      home: {mu:newHome[0].mu,sigma:newHome[0].sigma},
      away: {mu:newAway[0].mu,sigma:newAway[0].sigma},
    }

  }
}