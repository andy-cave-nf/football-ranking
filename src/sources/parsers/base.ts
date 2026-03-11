import type { JsonData } from './types';

export interface JsonFixtures {
  parse(): Promise<JsonData>;
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

export class SafeJson implements JsonFixtures {
  constructor(private origin: JsonFixtures) {}
  async parse(): Promise<JsonData> {
    try {
      return await this.origin.parse();
    } catch (error) {
      throw new JsonParseError('Unable to parse json', { cause: error });
    }
  }
}