import { readFile } from 'fs/promises';
import { type JsonData, JsonDataSchema } from './types';
import { JsonParseError, type JsonFixtures } from './base';

export class DefaultJsonFixtures implements JsonFixtures {
  constructor(private filepath: string) {}
  async parse(): Promise<JsonData> {
    return JSON.parse(await readFile(this.filepath, 'utf8'));
  }
}

export class ValidatedJsonShape implements JsonFixtures {
  constructor(private origin: JsonFixtures) {}
  async parse(): Promise<JsonData> {
    const data = await this.origin.parse();
    return JsonDataSchema.parse(data);
  }
}

export class ValidatedJsonScores implements JsonFixtures {
  constructor(private origin: JsonFixtures) {}
  async parse(): Promise {
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

export class CachedFromJson implements JsonFixtures {
  private data: JsonData | null = null;
  constructor(private origin: JsonFixtures) {}
  async parse(): Promise<JsonData> {
    if (this.data === null) {
      this.data = await this.origin.parse();
    }
    return this.data;
  }
}
