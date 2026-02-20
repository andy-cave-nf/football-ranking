import type { JsonData, JsonFixtures, SourceTeam } from './types';
import type { Result } from '../leagues/types';
import { CachedFromJson, ParseJsonOrThrow, ParseScoresOrThrow } from './json_parse';
import type { Source } from './base';

export class JsonSource implements Source {
  private cache: CachedFromJson;
  constructor(filepath: string) {
    this.cache = new CachedFromJson(new ParseScoresOrThrow(new ParseJsonOrThrow(filepath)));
  }
  async results(start: Date, end: Date): Promise<Result[]> {
    const data: JsonData = await this.cache.parse();
    return data.fixtures
      .filter((fixture) => fixture.date >= start.toISOString() && fixture.date <= end.toISOString())
      .map((fixture) => this.convertToResults(fixture));
  }
  async teams(): Promise<SourceTeam[]> {
    const data = (await this.cache.parse()) as JsonData;
    return data.teams.map((team) => ({ id: team.id, name: team.name }));
  }
  private convertToResults(fixture: JsonFixtures): Result {
    const [home, away]: Array<number> = fixture.score
      .split('-')
      .map((char) => parseInt(char, 10)) as [number, number];
    return {
      homeTeamId: fixture.homeId,
      awayTeamId: fixture.awayId,
      homeWin: home == away ? 0.5 : home > away ? 1 : 0,
      date: new Date(fixture.date),
    };
  }
}
