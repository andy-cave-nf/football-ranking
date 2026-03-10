export interface ParsedJson<T> {
  parse(): Promise<T>;
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

export class SafeParse<T> implements ParsedJson<T> {
  constructor(private origin: ParsedJson<T>) {}
  async parse(): Promise<T> {
    try {
      return await this.origin.parse();
    } catch (error) {
      throw new JsonParseError('Unable to parse json', { cause: error });
    }
  }
}