import type { Elo, Ruleset } from '../rulesets/rulesets';
import type { Team } from './teams';
import type { Result } from './types';
import { StrictMap } from '../utils';
import type { SourceTeam } from '../sources/types';

export interface League {
  add(team: SourceTeam): Promise<void>;
  record(result: Result, ruleset: Ruleset): Promise<void>;
  teams: Team[];
}

export class InMemoryLeague implements League {
  private allTeams = new StrictMap(new Map<number | string, Team>());

  constructor(private elo: number) {}
  get teams(): Team[] {
    return Array.from(this.allTeams.values());
  }
  async add(team: SourceTeam): Promise<void> {
    const cleanId: string = team.id.toString().trim().toLowerCase();
    const cleanName: string = team.name.trim();
    this.allTeams.set(cleanId, { id: cleanId, name: cleanName, elo: this.elo });
  }
  async record(result: Result, ruleset: Ruleset): Promise<void> {
    const newElos = ruleset.record(result, {
      home: this.allTeams.getOrThrow(result.homeTeamId).elo,
      away: this.allTeams.getOrThrow(result.awayTeamId).elo,
    });
    this.allTeams.set(result.homeTeamId, {
      ...this.allTeams.getOrThrow(result.homeTeamId),
      elo: newElos.home,
    });
    this.allTeams.set(result.awayTeamId, {
      ...this.allTeams.getOrThrow(result.awayTeamId),
      elo: newElos.away,
    });
  }
}

abstract class StrictLeague implements League {
  protected constructor(protected origin: League) {}
  async add(team:SourceTeam): Promise<void> {
    await this.origin.add(team);
  }
  async record(result: Result, ruleset: Ruleset): Promise<void> {
    await this.origin.record(result, ruleset);
  }
  get teams() {
    return this.origin.teams;
  }
}

export class StrictLeagueAddition extends StrictLeague {
  constructor(protected origin: League) {
    super(origin);
  }
  async add(team: SourceTeam): Promise<void> {
    const ids = this.teams.map((team) => team.id);
    const names = this.teams.map((team) => team.name.toLowerCase());
    if (
      ids.includes(team.id.toString().trim().toLowerCase())
    ) {
      throw new LeagueError(`id ${team.id} already exists`);
    }
    if (names.includes(team.name.trim().toLowerCase())) {
      throw new LeagueError(`name ${team.name} already exists`);
    }
    await this.origin.add(team);
  }
}

export class LeagueError extends Error {
  constructor(
    public message: string,
    public options?: ErrorOptions
  ) {
    super(message, options);
    this.name = 'LeagueError';
  }
}