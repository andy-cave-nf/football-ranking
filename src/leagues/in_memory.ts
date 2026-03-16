import type { Result, Team } from './types';
import type { SourceTeam } from '../sources/types';
import { type League } from './base';
import type { Ruleset } from '../rulesets/base';
import { type ReadOnlyTeamMap, type TeamMap } from './team_maps';

export class InMemoryLeague implements League {
  constructor(private ruleset: Ruleset, private _teams: TeamMap<string, Team>) {}
  get teams(): ReadOnlyTeamMap<string, Team> {
    return this._teams.toReadOnly();
  }
  record(result: Result): void {
    this.addInit(result.home, result.date);
    this.addInit(result.away, result.date);
    const newRatings = this.ruleset.record(result, {
      home: {
        mu: this._teams.getOrThrow(result.home.id).mu,
        sigma: this._teams.getOrThrow(result.home.id).sigma,
      },
      away: {
        mu: this._teams.getOrThrow(result.away.id).mu,
        sigma: this._teams.getOrThrow(result.away.id).sigma,
      },
    });
    this._teams.set(result.home.id, {
      ...this._teams.getOrThrow(result.home.id),
      mu: newRatings.home.mu,
      sigma: newRatings.home.sigma,
      lastFixtureDate: result.date,
    });
    this._teams.set(result.away.id, {
      ...this._teams.getOrThrow(result.away.id),
      mu: newRatings.away.mu,
      sigma: newRatings.away.sigma,
      lastFixtureDate: result.date,
    });
  }
  private addInit(team: SourceTeam, fixtureDate: Date): void {
    this._teams.setInitOrIgnore(team.id, {
      id: team.id,
      name: team.name,
      lastFixtureDate: fixtureDate,
      ...this.ruleset.newRating(),
    });
  }
}
