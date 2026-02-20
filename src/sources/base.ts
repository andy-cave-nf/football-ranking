import type { Result } from '../leagues/types';
import type { SourceTeam } from './types';

export interface Source {
  teams(): Promise<SourceTeam[]>;
  results(start: Date, end: Date): Promise<Result[]>;
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
    } catch (error) {
      throw new SourceError('Source error in results', { cause: error });
    }
  }
  async teams(): Promise<SourceTeam[]> {
    try {
      return await this.origin.teams();
    } catch (error) {
      throw new SourceError('Source error in teams', { cause: error });
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