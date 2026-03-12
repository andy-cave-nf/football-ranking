import type { Result, Team } from './types';
import type { SourceTeam } from '../sources/types';
import { cleanString, type League } from './base';
import type { Ruleset } from '../rulesets/base';
import { DefaultTeamMap, type ReadOnlyTeamMap, SanitizeMap } from './team_maps';

export class InMemoryLeague implements League {
  private allTeams = new DefaultTeamMap(new SanitizeMap<number | string, Team>(cleanString));

  constructor(private ruleset: Ruleset) {}
  get teams(): ReadOnlyTeamMap<number | string, Team> {
    return this.allTeams.toReadOnly();
  }
  record(result: Result): void {
    this.addInit(result.home, result.date);
    this.addInit(result.away, result.date);
    const newRatings = this.ruleset.record(result, {
      home: {
        mu: this.allTeams.getOrThrow(result.home.id).mu,
        sigma: this.allTeams.getOrThrow(result.home.id).sigma,
      },
      away: {
        mu: this.allTeams.getOrThrow(result.away.id).mu,
        sigma: this.allTeams.getOrThrow(result.away.id).sigma,
      },
    });
    this.allTeams.set(result.home.id, {
      ...this.allTeams.getOrThrow(result.home.id),
      mu: newRatings.home.mu,
      sigma: newRatings.home.sigma,
      lastFixtureDate: result.date,
    });
    this.allTeams.set(result.away.id, {
      ...this.allTeams.getOrThrow(result.away.id),
      mu: newRatings.away.mu,
      sigma: newRatings.away.sigma,
      lastFixtureDate: result.date,
    });
  }
  private addInit(team: SourceTeam, fixtureDate: Date): void {
    this.allTeams.setInit(team.id, {
      id: team.id,
      name: team.name,
      lastFixtureDate: fixtureDate,
      ...this.ruleset.newRating(),
    });
  }
}
