export class SanitizeMap<K, V> extends Map<K, V> {
  private readonly sanitize: (key: K) => K;
  constructor(sanitize: (key: K) => K, entries?: Iterable<[K, V]>) {
    super();
    this.sanitize = sanitize;
    if (entries) {
      for (const [k, v] of entries) {
        super.set(this.sanitize(k), v);
      }
    }
  }
  get(key: K): V | undefined {
    return super.get(this.sanitize(key));
  }
  set(key: K, value: V): this {
    return super.set(this.sanitize(key), value);
  }
  has(key: K): boolean {
    return super.has(this.sanitize(key));
  }
}

export interface ReadOnlyTeamMap<K, V> {
  get(id: K): V | undefined;
  getOrThrow(id: K): V;
  has(id: K): boolean;
  values(): V[];
  size: number;
}

export interface TeamMap<K, V> extends ReadOnlyTeamMap<K, V> {
  set(id: K, value: V): void;
  setInit(id: K, value: V): void;
  toReadOnly(): ReadOnlyTeamMap<K, V>;
}

export class DefaultTeamMap<K, V> implements TeamMap<K, V> {
  constructor(protected origin: Map<K, V>) {}
  getOrThrow(id: K): V {
    const value = this.origin.get(id);
    if (value === undefined) {
      throw new TeamMapError(`Cannot find id:${id}`);
    }
    return value;
  }
  get(id: K): V | undefined {
    return this.origin.get(id);
  }

  has(id: K): boolean {
    return this.origin.has(id);
  }
  values(): V[] {
    return this.origin.values().toArray();
  }
  get size(): number {
    return this.origin.size;
  }
  set(id: K, value: V) {
    this.origin.set(id, value);
  }
  setInit(id: K, value: V): void {
    if (!this.has(id)) {
      this.origin.set(id, value);
    }
  }
  toReadOnly(): ReadOnlyTeamMap<K, V> {
    return this;
  }
}

export class TeamMapError extends Error {
  constructor(
    public message: string,
    public options?: ErrorOptions
  ) {
    super(message, options);
    this.name = 'StrictMapError';
  }
}
export function cleanString(id: string): string {
  return id.trim().toUpperCase();
}