import type { Ruleset } from '../rulesets/rulesets';
import type { Team } from './teams';
import type { Match } from '../sources/types';

export interface League {
  add(name: string, start: Date): Promise<void>;
  record(match: Match, ruleset: Ruleset): Promise<void>;
  teams(): Promise<Team[]>;
  startingElo: number;
}

export class InMemoryLeague implements League {
  constructor(private elo: number) {}
  get startingElo() {
    return this.elo;
  }
  async teams(): Promise<Team[]> {
    return []
  }
}