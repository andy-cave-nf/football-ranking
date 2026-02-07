import type { Team } from '../leagues/teams';
import type { Match, JsonData} from './types';
import { readFile } from 'fs/promises';

export interface Source {
  teams(): Promise<Team[]>;
  matches(start: Date, end?: Date): Promise<Match[]>;
}

export class JsonSource implements Source {
  private cache: CachedFromJsonSource;
  constructor(filepath: string) {
    this.cache = new CachedFromJsonSource(filepath)
  }
  async matches(start: Date, end?:Date):Promise<Match[]>{
    const data = await this.cache.parse(start, end) as JsonData;
    return data.fixtures.map(fixture => ({id:fixture.matchId}))
  }
}



class CachedFromJsonSource {
  private data: JsonData | null = null;
  constructor(private filepath: string) {}
  public async parse(start: Date, end?: Date) {
    if (this.data !== null ) {
      return this.data;
    }
    this.data = JSON.parse(await readFile(this.filepath, 'utf8'));
    return this.data;
  }

}