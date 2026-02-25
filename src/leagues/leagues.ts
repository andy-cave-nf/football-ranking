import type { Ruleset } from '../rulesets/rulesets';
import type { Result, Team } from './types';
import {
  DefaultTeamMap,
  ReadOnlyStrictMap,
  type ReadOnlyTeamMap,
  SanitizeMap,
  StrictMap,
} from '../utils';
import type { SourceTeam } from '../sources/types';

export interface League {
  record(result: Result, ruleset: Ruleset): void;
  teams: ReadOnlyTeamMap<number | string, Team>;
}

export class InMemoryLeague implements League {
  private allTeams = new DefaultTeamMap(new SanitizeMap<number | string, Team>(cleanString));

  constructor(private elo: number) {}
  get teams(): ReadOnlyTeamMap<number|string, Team>{
    return this.allTeams.toReadOnly()
  }
  record(result: Result, ruleset: Ruleset): void {
    this.addInit(result.home, result.date)
    this.addInit(result.away, result.date)
    const newElos = ruleset.record(result, {
      home: this.allTeams.getOrThrow(result.home.id).elo,
      away: this.allTeams.getOrThrow(result.away.id).elo,
    });
    this.allTeams.set(result.home.id, {
      ...this.allTeams.getOrThrow(result.home.id),
      elo: newElos.home,
      lastFixtureDate: result.date
    });
    this.allTeams.set(result.away.id, {
      ...this.allTeams.getOrThrow(result.away.id),
      elo: newElos.away,
      lastFixtureDate: result.date
    });
  }
  private addInit(team: SourceTeam, fixtureDate: Date): void {
    this.allTeams.setInit(team.id, {
      id: team.id,
      name: team.name,
      elo: this.elo,
      lastFixtureDate: fixtureDate,
    });
  }
}

abstract class StrictLeague implements League {
  protected constructor(protected origin: League) {}
  record(result: Result, ruleset: Ruleset): void {
    this.origin.record(result, ruleset);
  }
  get teams() {
    return this.origin.teams;
  }
}

export class StrictLeagueRecord extends StrictLeague {
  constructor(protected origin: League) {
    super(origin);
  }
  record(result: Result, ruleset: Ruleset): void {
    const homeDate = this.origin.teams.get(result.home.id)?.lastFixtureDate ?? result.date ;
    const awayDate = this.origin.teams.get(result.home.id)?.lastFixtureDate ?? result.date;
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


export function cleanString(id:string|number): string {
  return id.toString().trim().toUpperCase();
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