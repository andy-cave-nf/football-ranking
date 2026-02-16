import type { Team } from '../leagues/teams';

export interface Page {
  print(teams: Team[]): void
}
