import type { Result } from '../leagues/types';

export interface Source {
  results(start: Date, end: Date): Promise<Result[]>;
}

export class SortedSource implements Source {
  constructor(private readonly origin: Source) {}
  async results(start: Date, end: Date): Promise<Result[]> {
    const unsorted = await this.origin.results(start, end);
    return [...unsorted].sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}

abstract class StrictSource implements Source {
  protected constructor(protected origin: Source) {}
  async results(start: Date, end: Date): Promise<Result[]> {
    return await this.origin.results(start, end);
  }
}

export class StrictSourceDates extends StrictSource {
  constructor(protected origin: Source) {
    super(origin);
  }
  async results(start: Date, end: Date): Promise<Result[]> {
    if (start > end) {
      throw new SourceError(`${start} is not before ${end}`);
    }
    return await this.origin.results(start, end);
  }
}

export class StrictSourceIds extends StrictSource {
  constructor(protected origin: Source) {
    super(origin);
  }
  async results(start: Date, end: Date): Promise<Result[]> {
    const raw = await this.origin.results(start, end);
    const duplicates = raw.filter((result: Result) => result.home.id === result.away.id)
    if (duplicates.length > 0) {
      const duplicateIds = duplicates.map((result: Result) => result.away.id)
      throw new SourceError(`Duplicate ids ${duplicateIds.join(',')} in result`);
    }
    return raw
  }
}

export class UniqueResultsSource extends StrictSource {
  constructor(protected origin: Source) {
    super(origin);
  }
  async results(start: Date, end: Date): Promise<Result[]> {
    const raw = await this.origin.results(start, end);
    const sortedResultKeys = (result:Result) => JSON.stringify(result, Object.keys(result).sort());
    const unique = new Set(raw.map(sortedResultKeys));
    if (unique.size !== raw.length) {
      throw new SourceError(`There are duplicate results between ${start} and ${end}`);
    }
    return await this.origin.results(start, end);
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
