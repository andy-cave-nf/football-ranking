import type { Ruleset } from '../rulesets/rulesets';
import type { Result, Team } from './types';
import { DefaultTeamMap, type ReadOnlyTeamMap, SanitizeMap } from '../utils';
import type { SourceTeam } from '../sources/types';
import { cleanString, type League } from './base';

export class InMemoryLeague implements League {
  private allTeams = new DefaultTeamMap(new SanitizeMap<number | string, Team>(cleanString));

  constructor(
    private initialRating: number,
    private initialUncertainty: number
  ) {}
  get teams(): ReadOnlyTeamMap<number | string, Team> {
    return this.allTeams.toReadOnly();
  }
  record(result: Result, ruleset: Ruleset): void {
    this.addInit(result.home, result.date);
    this.addInit(result.away, result.date);
    const newElos = ruleset.record(result, {
      home: {
        rating: this.allTeams.getOrThrow(result.home.id).rating,
        uncertainty: this.allTeams.getOrThrow(result.home.id).uncertainty,
      },
      away: {
        rating: this.allTeams.getOrThrow(result.away.id).rating,
        uncertainty: this.allTeams.getOrThrow(result.away.id).uncertainty,
      },
    });
    this.allTeams.set(result.home.id, {
      ...this.allTeams.getOrThrow(result.home.id),
      rating: newElos.home.rating,
      uncertainty: newElos.home.uncertainty,
      lastFixtureDate: result.date,
    });
    this.allTeams.set(result.away.id, {
      ...this.allTeams.getOrThrow(result.away.id),
      rating: newElos.away.rating,
      uncertainty: newElos.away.uncertainty,
      lastFixtureDate: result.date,
    });
  }
  private addInit(team: SourceTeam, fixtureDate: Date): void {
    this.allTeams.setInit(team.id, {
      id: team.id,
      name: team.name,
      rating: this.initialRating,
      uncertainty: this.initialUncertainty,
      lastFixtureDate: fixtureDate,
    });
  }
}
