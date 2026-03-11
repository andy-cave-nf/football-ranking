import type { Result } from '../leagues/types';
import type { Source } from './base';
import { add } from 'date-fns';
import type { JsonData, Fixtures } from './parsers/types';
import { type JsonFixtures } from './parsers/base';

export class JsonSource implements Source {
  constructor(private fixtures: JsonFixtures) {}
  async results(start: Date, end: Date): Promise<Result[]> {
    const data: JsonData = await this.fixtures.parse();
    return data.fixtures
      .filter(
        (fixture) =>
          fixture.date >= start.toISOString() && fixture.date <= add(end, { days: 1 }).toISOString()
      )
      .map((fixture) => this.convertToResults(fixture));
  }
  private convertToResults(fixture: Fixtures): Result {
    const [home, away]: Array<number> = fixture.score
      .split('-')
      .map((char) => parseInt(char, 10)) as [number, number];
    return {
      home: { id: fixture.homeId, name: fixture.homeName },
      away: { id: fixture.awayId, name: fixture.awayName },
      homeWin: home == away ? 0.5 : home > away ? 1 : 0,
      date: new Date(fixture.date),
    };
  }
}
