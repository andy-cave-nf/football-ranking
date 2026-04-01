import { format } from 'date-fns';

export interface ApiQuery {
  query(start: Date, end: Date, season: number): string
}

export type ApiUrl = {
  base: string;
  endpoint: string;
}


export class DefaultApiQuery implements ApiQuery {
  constructor(private league: string) {}
  query(from: Date, to: Date, season: number) {
    return new URLSearchParams({
      from: format(from, 'yyyy-MM-dd'),
      to: format(to, 'yyyy-MM-dd'),
      season: season.toString(),
      league: this.league,
    }).toString();
  }
}

export class SafeApiQuery implements ApiQuery {
  constructor(private origin: ApiQuery) {}
  query(from: Date, to: Date, season: number): string {
    try {
      return this.origin.query(from, to, season);
    } catch (error) {
      throw new ApiQueryError('Error while generating API query', { cause: error });
    }
  }
}

export class ApiQueryError extends Error {
  constructor(
    public message: string,
    public options?: ErrorOptions
  ) {
    super(message, options);
    this.name = 'ApiQueryError';
  }
}
