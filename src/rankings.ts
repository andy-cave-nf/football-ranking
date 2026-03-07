import type { Page } from './pages/pages';
import type { Result } from './leagues/types';
import type { Source } from './sources/base';
import type { League } from './leagues/base';
import type { Ruleset } from './rulesets/base';

export interface Rankings {
  run(from: Date, to?: Date): Promise<void>;
  print(page: Page): Promise<void>;
}

export class DefaultRankings implements Rankings {
  constructor(
    private league: League,
    private source: Source,
    private ruleset: Ruleset
  ) {}
  async run(from: Date, to: Date): Promise<void> {
    const results: Result[] = await this.source.results(from, to);
    results.forEach((match) => this.league.record(match, this.ruleset));
  }

  async print(page: Page): Promise<void> {
    await page.print(this.league.teams.values());
  }
}

abstract class StrictRankings implements Rankings {
  protected constructor(protected origin: Rankings) {}
  async run(from: Date, to: Date): Promise<void> {
    await this.origin.run(from, to);
  }
  async print(page: Page): Promise<void> {
    await this.origin.print(page);
  }
}

export class RankingsWithStrictDates extends StrictRankings {
  constructor(origin: Rankings) {
    super(origin);
  }
  async run(from: Date, to: Date): Promise<void> {
    if (from > to) {
      throw new RankingError(`${from} is later than ${to}`);
    }
    await this.origin.run(from, to);
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
  async print(page: Page): Promise<void> {
    try {
      await this.origin.print(page);
    } catch (error) {
      throw new RankingError('Error while printing to page', { cause: error });
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
