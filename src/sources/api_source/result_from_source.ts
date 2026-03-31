import type { Result } from '../../leagues/types';
import type { FixtureResponse } from '../types';

export interface ResultFromApi {
  result(): Result
}

export class DefaultResultFromApi implements ResultFromApi {
  constructor(private raw: FixtureResponse) {}
  result(): Result {
    return {
      home: {id: this.raw.teams.home.id.toString(), name: this.raw.teams.home.name},
      away: {id: this.raw.teams.away.id.toString(), name: this.raw.teams.away.name},
      homeWin: this.raw.teams.home.winner == true ? 1 : this.raw.teams.home.winner == false ? 0 : 0.5,
      date: new Date(this.raw.fixture.date)
    }
  }
}

export class SafeResultFromApi implements ResultFromApi {
  constructor(private origin: ResultFromApi) {}
  result() {
    try {
      return this.origin.result();
    } catch (error) {
      throw new ResultsFromApiError('Unable to process result from API', { cause: error });
    }
  }
}

export class ResultsFromApiError extends Error {
  constructor(
    public message: string,
    public options?: ErrorOptions
  ) {
    super(message, options);
    this.name = 'ResultsFromApiError';
  }
}
