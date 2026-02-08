import type { Ruleset } from '../rulesets/rulesets';
import type { Team } from './teams';
import type { Match } from '../sources/types';

export interface League {
  add(name: string): Promise<void>;
  record(match: Match, ruleset: Ruleset): Promise<void>;
  teams: Team[];
  startingElo: number;
}

export class InMemoryLeague implements League {
  private allTeams: Team[] = [];
  constructor(private elo: number) {}
  get startingElo() {
    return this.elo;
  }
  get teams(): Team[] {
    return this.allTeams
  }
  async add(name: string): Promise<void> {
    this.allTeams.push({name:name, elo:this.elo});
  }
}