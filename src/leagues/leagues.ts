import type { Match } from '../sources/sources';
import type { Ruleset } from '../rulesets/rulesets';
import type { Team } from './teams';

export interface League {
  add(name: string, start: Date): Promise<void>;
  record(match: Match, ruleset: Ruleset): Promise<void>;
  teams(): Promise<Team[]>;
}
