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
  // add(team: SourceTeam, initialisedDate: Date): Promise<void>;
  record(result: Result, ruleset: Ruleset): void;
  teams: ReadOnlyTeamMap<number | string, Team>;
}

export class InMemoryLeague implements League {
  private allTeams = new DefaultTeamMap(new SanitizeMap<number | string, Team>(cleanString));

  constructor(private elo: number) {}
  get teams(): ReadOnlyTeamMap<number|string, Team>{
    return this.allTeams.toReadOnly()
  }
  // async add(team: SourceTeam, initialisedDate:Date): Promise<void> {
  //   const cleanId: string = cleanString(team.id)
  //   const cleanName: string = team.name.trim();
  //   this.allTeams.set(cleanId, { id: cleanId, name: cleanName, elo: this.elo, lastFixtureDate: initialisedDate });
  // }
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
    this.allTeams.setInit(cleanString(team.id), {
      id: cleanString(team.id),
      name: cleanString(team.name),
      elo: this.elo,
      lastFixtureDate: fixtureDate,
    });
  }
}

abstract class StrictLeague implements League {
  protected constructor(protected origin: League) {}
  // async add(team:SourceTeam, initialisedDate:Date): Promise<void> {
  //   await this.origin.add(team, initialisedDate);
  // }
  record(result: Result, ruleset: Ruleset): void {
    this.origin.record(result, ruleset);
  }
  get teams() {
    return this.origin.teams;
  }
}
//
// export class StrictLeagueAddition extends StrictLeague {
//   constructor(protected origin: League) {
//     super(origin);
//   }
//   async add(team: SourceTeam, initialisedDate:Date): Promise<void> {
//
//     const ids = this.teams.values().map((team) => team.id);
//     const names = this.teams.values().map((team) => team.name.toLowerCase());
//     if (
//       ids.includes(team.id.toString().trim().toLowerCase())
//     ) {
//       throw new LeagueError(`id ${team.id} already exists`);
//     }
//     if (names.includes(team.name.trim().toLowerCase())) {
//       throw new LeagueError(`name ${team.name} already exists`);
//     }
//     await this.origin.add(team, initialisedDate);
//   }
// }

export class StrictLeagueRecord extends StrictLeague {
  constructor(protected origin: League) {
    super(origin);
  }
  record(result: Result, ruleset: Ruleset): void {
    const homeDate = this.origin.teams.getOrThrow(result.home.id).lastFixtureDate ;
    const awayDate = this.origin.teams.getOrThrow(result.home.id).lastFixtureDate;
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