import type { Result, Team } from './types';

import type { ReadOnlyTeamMap } from './team_maps';

export interface League {
  record(result: Result): void;
  teams: ReadOnlyTeamMap<number | string, Team>;
}

abstract class StrictLeague implements League {
  protected constructor(protected origin: League) {}
  record(result: Result): void {
    this.origin.record(result);
  }
  get teams() {
    return this.origin.teams;
  }
}

export class StrictLeagueRecord extends StrictLeague {
  constructor(protected origin: League) {
    super(origin);
  }
  record(result: Result): void {
    const homeDate = this.origin.teams.get(result.home.id)?.lastFixtureDate ?? result.date;
    const awayDate = this.origin.teams.get(result.home.id)?.lastFixtureDate ?? result.date;
    if (homeDate > result.date) {
      throw new LeagueError(
        `Fixture played at ${result.date} occurs before last known home date ${homeDate}`
      );
    }
    if (awayDate > result.date) {
      throw new LeagueError(
        `Fixture played at ${result.date} occurs after last known home date ${homeDate}`
      );
    }
    this.origin.record(result);
  }
}

export class SafeLeague implements League {
  constructor(private origin: League) {}
  record(result: Result): void {
    try {
      this.origin.record(result);
    } catch (error) {
      throw new LeagueError('Unable to add record', { cause: error });
    }
  }
  get teams() {
    try {
      return this.origin.teams;
    } catch (error) {
      throw new LeagueError('Unable to get teams', { cause: error });
    }
  }
}

export function cleanString(id: string | number): string {
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
