import { readFile } from 'fs/promises';
import _ from 'lodash';
import type { JsonData } from './types';
import { JsonParseError, type JsonFixtures } from './base';

export class DefaultJsonFixtures<T> implements JsonFixtures<T> {
  constructor(private filepath: string) {}
  async parse(): Promise<T> {
    return JSON.parse(await readFile(this.filepath, 'utf8'));
  }
}

export class ValidatedJsonShape implements JsonFixtures<JsonData> {
  constructor(private origin: JsonFixtures<JsonData>) {}
  async parse(): Promise<JsonData> {
    const data = await this.origin.parse();
    if (!Array.isArray(data.fixtures)) {
      throw new JsonParseError('Invalid fixtures')
    }
    return data;
  }
}

export class ValidatedJsonScores implements JsonFixtures<JsonData> {
  constructor(private origin: JsonFixtures<JsonData>) {}
  async parse(): Promise<JsonData> {
    const data: JsonData = await this.origin.parse();
    const allValidScores = data.fixtures.every((fixture) => isDashedScore(fixture.score));
    if (!allValidScores) {
      throw new JsonParseError('Unable to parse scores');
    }
    return data;
  }
}

function isDashedScore(score: string | null): score is `${number}-${number}` {
  return typeof score === 'string' && /^\d+-\d+$/.test(score);
}

export class CachedFromJson<T> implements JsonFixtures<T> {
  private data: T | null = null;
  constructor(private origin: JsonFixtures<T>) {}
  async parse(): Promise<T> {
    if (this.data === null) {
      this.data = await this.origin.parse();
    }
    return this.data;
  }
}
