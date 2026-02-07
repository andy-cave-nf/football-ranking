import type { Match, JsonData, SourceTeam } from './types';
import { readFile } from 'fs/promises';

export interface Source {
  teams(): Promise<SourceTeam[]>;
  matches(start: Date, end: Date): Promise<Match[]>;
}

export class JsonSource implements Source {
  private cache: CachedFromJson;
  constructor(filepath: string) {
    this.cache = new CachedFromJson(filepath)
  }
  async matches(start: Date, end:Date):Promise<Match[]>{
    const data = await this.cache.parse() as JsonData;
    return data.fixtures
      .filter((fixture) => fixture.date >= start.toISOString() && fixture.date <= end.toISOString())
      .map(fixture => ({id:fixture.matchId}))
  }
  async teams(): Promise<SourceTeam[]>{
    const data = await this.cache.parse() as JsonData;
    return data.teams
      .map((team)=> ({name:team.name}))
  }
}



class CachedFromJson {
  private data: JsonData | null = null;
  constructor(private filepath: string) {}
  public async parse() {
    if (this.data === null) {
      this.data = JSON.parse(await readFile(this.filepath, 'utf8'));
    }
    return this.data;
  }

}