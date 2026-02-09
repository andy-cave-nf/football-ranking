import type { Elo, Ruleset } from '../rulesets/rulesets';
import type { Team } from './teams';
import type { Result } from './types';
import { StrictMap } from '../utils';

export interface League {
  add(id: string|number, name: string): Promise<void>;
  record(result: Result, ruleset: Ruleset): Promise<void>;
  teams: Team[];
}

export class InMemoryLeague implements League {
  private allTeams = new StrictMap(new Map<number|string,Team>)

  constructor(private elo: number) {}
  get teams(): Team[] {
    return Array.from(this.allTeams.values())
  }
  async add(id: number|string, name: string): Promise<void> {
    this.allTeams.set(id, {name:name, elo:this.elo});
  }
  async record(result: Result, ruleset: Ruleset): Promise<void> {
    const newElos = ruleset.record(result, {
      home: (this.allTeams.get(result.homeTeamId)).elo,
      away: (this.allTeams.get(result.awayTeamId)).elo,
    })
  }
}