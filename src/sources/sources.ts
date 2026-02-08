import type { Match, JsonData, SourceTeam } from './types';
import { readFile } from 'fs/promises';

export interface Source {
  teams(): Promise<SourceTeam[]>;
  matches(start: Date, end: Date): Promise<Match[]>;
}

export class JsonSource implements Source {
  private cache: CachedFromJson;
  constructor(filepath: string) {
    this.cache = new CachedFromJson(filepath);
  }
  async matches(start: Date, end: Date): Promise<Match[]> {
    const data = (await this.cache.parse()) as JsonData;
    return data.fixtures
      .filter((fixture) => fixture.date >= start.toISOString() && fixture.date <= end.toISOString())
      .map((fixture) => ({ id: fixture.matchId }));
  }
  async teams(): Promise<SourceTeam[]> {
    const data = (await this.cache.parse()) as JsonData;
    return data.teams.map((team) => ({ name: team.name }));
  }
}

abstract class StrictSource implements Source {
  protected constructor(protected origin: Source) {}
  async matches(start: Date, end: Date): Promise<Match[]> {
    return this.origin.matches(start, end);
  }
  async teams(): Promise<SourceTeam[]> {
    return this.origin.teams();
  }
}

export class StrictSourceDates extends StrictSource {
  constructor(protected origin: Source) {
    super(origin);
  }
  async matches(start: Date, end: Date): Promise<Match[]> {
    if (start > end) {
      throw new SourceError(`${start.toISOString()} is not before ${end.toISOString()}`);
    }
    return this.origin.matches(start, end);
  }
}

class CachedFromJson {
  private data: JsonData | null = null;
  constructor(private filepath: string) {}
  public async parse() {
    if (this.data === null) {
      this.data = JSON.parse(await readFile(this.filepath, 'utf8'));
    }
    return this.data;
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