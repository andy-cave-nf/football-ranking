import type { JsonData, SourceTeam, JsonFixtures} from './types';
import type { Result } from '../leagues/types';
import { CachedFromJson, ParseJsonOrThrow, ParseScoresOrThrow } from './json_parse';

export interface Source {
  teams(): Promise<SourceTeam[]>;
  results(start: Date, end: Date): Promise<Result[]>;
}

export class JsonSource implements Source {
  private cache: CachedFromJson;
  constructor(filepath: string) {
    this.cache = new CachedFromJson(new ParseScoresOrThrow(new ParseJsonOrThrow(filepath)));
  }
  async results(start: Date, end: Date): Promise<Result[]> {
    const data: JsonData = (await this.cache.parse());
    return data.fixtures
      .filter((fixture) => fixture.date >= start.toISOString() && fixture.date <= end.toISOString())
      .map((fixture) => (this.convertToResults(fixture)));
  }
  async teams(): Promise<SourceTeam[]> {
    const data = (await this.cache.parse()) as JsonData;
    return data.teams.map((team) => ({id:team.id, name: team.name }));
  }
  private convertToResults(fixture: JsonFixtures): Result {
    const [home, away]:Array<number> = fixture.score.split('-').map((char) => parseInt(char, 10)) as [number,number]
    return {
      homeTeamId: fixture.homeId,
      awayTeamId: fixture.awayId,
      homeWin: home == away ? 0.5 : home > away ? 1 : 0,
      date: new Date(fixture.date),
    }
  }
}

abstract class StrictSource implements Source {
  protected constructor(protected origin: Source) {}
  async results(start: Date, end: Date): Promise<Result[]> {
    return this.origin.results(start, end);
  }
  async teams(): Promise<SourceTeam[]> {
    return this.origin.teams();
  }
}

export class StrictSourceDates extends StrictSource {
  constructor(protected origin: Source) {
    super(origin);
  }
  async results(start: Date, end: Date): Promise<Result[]> {
    if (start > end) {
      throw new SourceError(`${start.toISOString()} is not before ${end.toISOString()}`);
    }
    return this.origin.results(start, end);
  }
}

export class SafeSource implements Source {
  constructor(private origin: Source) {}
  async results(start: Date, end: Date): Promise<Result[]> {
    try {
      return await this.origin.results(start, end);
    }
    catch (error) {
      throw new SourceError('Source error in results', {cause:error})
    }
  }
  async teams(): Promise<SourceTeam[]> {
    try {
      return await this.origin.teams();
    }
    catch (error) {
      throw new SourceError('Source error in teams', {cause:error})
    }
  }
}

export class SourceError extends Error {
  constructor(
    public message: string,
    public options?: ErrorOptions
  ) {
    super(message, options);
    this.name = 'SourceError';
  }
}