import type { JsonData } from './types';
import { readFile } from 'fs/promises';

export interface ParsedJson {
  parse(): Promise<JsonData>;
}

export class ParseJsonOrThrow implements ParsedJson {
  constructor(private filepath: string) {}
  async parse(): Promise<JsonData> {
    const data = JSON.parse(await readFile(this.filepath, 'utf8'));
    if (data === undefined) {
      throw new JsonParseError('Unable to parse json');
    }
    return data as JsonData;
  }
}

export class ParseScoresOrThrow implements ParsedJson {
  constructor(private origin: ParsedJson) {}
  async parse(): Promise<JsonData> {
    const data: JsonData = await this.origin.parse();
    const allValidScores = data.fixtures.every(fixture => isDashedScore(fixture.score))
    if (!allValidScores) {
      throw new JsonParseError('Unable to parse scores')
    }
    return data;
  }
}


function isDashedScore(score: string | null): score is `${number}-${number}` {
  return typeof score === 'string' && /^\d+-\d+$/.test(score);
}



export class CachedFromJson implements ParsedJson {
  private data: JsonData | null = null;
  constructor(private origin: ParsedJson) {}
  async parse() {
    if (this.data === null) {
      this.data = await this.origin.parse();
    }
    return this.data;
  }
}

export class JsonParseError extends Error {
  constructor(
    public message: string,
    public options?: ErrorOptions
  ) {
    super(message, options);
    this.name = 'JsonParseError';
  }
}