import type { Result } from '../../leagues/types';
import type { FixtureResponse } from '../types';

export interface ApiResult {
  result(): Result
}

export class ApiProjection implements ApiResult {
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

export class ApiErrorWrappedResult implements ApiResult {
  constructor(private origin: ApiResult) {}
  result() {
    try {
      return this.origin.result();
    } catch (error) {
      throw new ApiResponseError('Unable to process result from API', { cause: error });
    }
  }
}

export class ApiResponseError extends Error {
  constructor(
    public message: string,
    public options?: ErrorOptions
  ) {
    super(message, options);
    this.name = 'ResultsFromApiError';
  }
}
