import type { Ruleset } from '../rulesets/rulesets';
import type { Team } from './teams';
import type { Result } from './types';
import { ReadOnlyStrictMap, StrictMap } from '../utils';
import type { SourceTeam } from '../sources/types';

export interface League {
  add(team: SourceTeam, initialisedDate:Date): Promise<void>;
  record(result: Result, ruleset: Ruleset): void;
  teams: ReadOnlyStrictMap<number|string, Team>;
}

export class InMemoryLeague implements League {
  private allTeams = new StrictMap(new Map<number | string, Team>());

  constructor(private elo: number) {}
  get teams(): ReadOnlyStrictMap<number|string, Team>{
    return this.allTeams.toReadOnly()
  }
  async add(team: SourceTeam, initialisedDate:Date): Promise<void> {
    const cleanId: string = cleanString(team.id)
    const cleanName: string = team.name.trim();
    this.allTeams.set(cleanId, { id: cleanId, name: cleanName, elo: this.elo, lastFixtureDate: initialisedDate });
  }
  record(result: Result, ruleset: Ruleset): void {
    const newElos = ruleset.record(result, {
      home: this.allTeams.getOrThrow(cleanString(result.homeTeamId)).elo,
      away: this.allTeams.getOrThrow(cleanString(result.awayTeamId)).elo,
    });
    this.allTeams.set(cleanString(result.homeTeamId), {
      ...this.allTeams.getOrThrow(cleanString(result.homeTeamId)),
      elo: newElos.home,
      lastFixtureDate: result.date
    });
    this.allTeams.set(cleanString(result.awayTeamId), {
      ...this.allTeams.getOrThrow(cleanString(result.awayTeamId)),
      elo: newElos.away,
      lastFixtureDate: result.date
    });
  }
}

abstract class StrictLeague implements League {
  protected constructor(protected origin: League) {}
  async add(team:SourceTeam, initialisedDate:Date): Promise<void> {
    await this.origin.add(team, initialisedDate);
  }
  record(result: Result, ruleset: Ruleset): void {
    this.origin.record(result, ruleset);
  }
  get teams() {
    return this.origin.teams;
  }
}

export class StrictLeagueAddition extends StrictLeague {
  constructor(protected origin: League) {
    super(origin);
  }
  async add(team: SourceTeam, initialisedDate:Date): Promise<void> {

    const ids = this.teams.values().map((team) => team.id);
    const names = this.teams.values().map((team) => team.name.toLowerCase());
    if (
      ids.includes(team.id.toString().trim().toLowerCase())
    ) {
      throw new LeagueError(`id ${team.id} already exists`);
    }
    if (names.includes(team.name.trim().toLowerCase())) {
      throw new LeagueError(`name ${team.name} already exists`);
    }
    await this.origin.add(team, initialisedDate);
  }
}

export class StrictLeagueRecord extends StrictLeague {
  constructor(protected origin: League) {
    super(origin);
  }
  record(result: Result, ruleset: Ruleset): void {
    const homeDate = this.origin.teams.getOrThrow(result.homeTeamId).lastFixtureDate ;
    const awayDate = this.origin.teams.getOrThrow(result.awayTeamId).lastFixtureDate;
    if (homeDate > result.date) {
      throw new LeagueError(`Fixture played at ${result.date} occurs before last known home date ${homeDate}`);
    }
    if (awayDate > result.date) {
      throw new LeagueError(`Fixture played at ${result.date} occurs after last known home date ${homeDate}`);
    }
    this.origin.record(result, ruleset);
  }
}

export class SafeLeague implements League {
  constructor(private origin: League) {}
  async add(team: SourceTeam, initialisedDate:Date): Promise<void> {
    try {
      await this.origin.add(team, initialisedDate);
    }
    catch (error) {
      throw new LeagueError('Unable to add team', {cause: error});
    }
  }
  record(result: Result, ruleset: Ruleset): void {
    try {
      this.origin.record(result, ruleset);
    }
    catch (error) {
      throw new LeagueError('Unable to add record', {cause: error})
    }
  }
  get teams() {
    try {
      return this.origin.teams;
    }
    catch (error) {
      throw new LeagueError('Unable to get teams', {cause: error});
    }
  }
}


function cleanString(id:string|number): string {
  return id.toString().trim().toLowerCase();
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