import type { Page } from './pages/pages';
import type { Result } from './leagues/types';
import type { Source } from './sources/base';
import type { League } from './leagues/base';

export interface Rankings {
  run(from: Date, to: Date): Promise<void>;
}

export class DefaultRankings implements Rankings {
  constructor(
    private league: League,
    private source: Source,
  ) {}
  async run(from: Date, to: Date): Promise<void> {
    const results: Result[] = await this.source.results(from, to);
    results.forEach((match) => this.league.record(match));
  }
}

export class SafeRankings implements Rankings {
  constructor(private origin: Rankings) {}
  async run(from: Date, to: Date): Promise<void> {
    try {
      await this.origin.run(from, to);
    } catch (error) {
      throw new RankingError('Error while running ranking', { cause: error });
    }
  }
}

export class RankingError extends Error {
  constructor(
    public message: string,
    public options?: ErrorOptions
  ) {
    super(message, options);
    this.name = 'RankingError';
  }
}
