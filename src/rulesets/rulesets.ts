import type { Result } from '../leagues/types';

export type Elo = {
  home: number;
  away: number;
};

type ExpectedScore = Elo;

export interface Ruleset {
  record(result: Result, elo: Elo): Elo;
}

export class DefaultRuleset implements Ruleset {
  constructor(
    private k: number,
    private scale: number
  ) {}
  record(result: Result, elo: Elo): Elo {
    return {
      home: elo.home + Math.round(this.k * (result.homeWin - this.expected(elo).home)),
      away: elo.away - Math.round(this.k * (result.homeWin - this.expected(elo).home)),
    };
  }
  private expected(elo: Elo): ExpectedScore {
    return {
      home: this.quotient(elo.home) / (this.quotient(elo.home) + this.quotient(elo.away)),
      away: this.quotient(elo.away) / (this.quotient(elo.home) + this.quotient(elo.away)),
    };
  }
  private quotient(value: number): number {
    return 10 ** (value / this.scale);
  }
}


