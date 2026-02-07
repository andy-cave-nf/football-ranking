import type { League } from './leagues/leagues';
import type { Ruleset } from './rulesets/rulesets';
import type { Source } from './sources/sources';
import type { Page } from './pages/pages';
import type { Team } from './leagues/teams';

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
  async run(from: Date, to?: Date): Promise<void> {
    await this.initialiseTeams(from);
    const matches = await this.source.matches(from, to);
    matches.forEach((match) => this.league.record(match, this.ruleset));
  }
  private async initialiseTeams(from: Date): Promise<void> {
    const teamInfo: Team[] = await this.source.teams();
    teamInfo.map(async (team) => await this.league.add(team.name, from));
  }

  async print(page: Page): Promise<void> {
    this.printTeams(await this.league.teams(), page);
  }
  private printTeams(teams: Team[], page:Page) {
    for (const team of teams) {
      const printedTeam = { [team.name]: team.elo };
      page = page.with(printedTeam);
    }
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
    }
    catch (error) {
      throw new RankingError('Error while running ranking', {cause: error});
    }
  }
  async print(page: Page): Promise<void> {
    try {
      await this.origin.print(page);
    }
    catch (error) {
      throw new RankingError('Error while printing to page', {cause: error});
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