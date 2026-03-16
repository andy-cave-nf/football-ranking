export class SanitizeMap<K, V> extends Map<K, V> {
  private readonly idempotentSanitize: (key: K) => K;
  constructor(sanitize: (key: K) => K, entries?: Iterable<[K, V]>) {
    super();
    this.idempotentSanitize = sanitize;
    if (entries) {
      for (const [k, v] of entries) {
        super.set(this.idempotentSanitize(k), v);
      }
    }
  }
  get(key: K): V | undefined {
    return super.get(this.idempotentSanitize(key));
  }
  set(key: K, value: V): this {
    return super.set(this.idempotentSanitize(key), value);
  }
  has(key: K): boolean {
    return super.has(this.idempotentSanitize(key));
  }
}

export interface ReadOnlyTeamMap<K, V> {
  get(id: K): V | undefined;
  getOrThrow(id: K): V;
  has(id: K): boolean;
  values(): V[];
  size: number;
}

export class ReadOnlyDefaultTeamMap<K,V> implements ReadOnlyTeamMap<K, V> {
  constructor(protected readonly origin: Map<K, V>) {}
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
}

export interface TeamMap<K, V> extends ReadOnlyTeamMap<K, V> {
  set(id: K, value: V): void;
  setInitOrIgnore(id: K, value: V): void;
  toReadOnly(): ReadOnlyTeamMap<K, V>;
}

export class DefaultTeamMap<K, V> extends ReadOnlyDefaultTeamMap<K,V> implements TeamMap<K, V> {
  constructor(origin: Map<K, V>) {
    super(origin)
  }
  set(id: K, value: V) {
    this.origin.set(id, value);
  }
  setInitOrIgnore(id: K, value: V): void {
    if (!this.has(id)) {
      this.origin.set(id, value);
    }
  }
  toReadOnly(): ReadOnlyTeamMap<K, V> {
    return new ReadOnlyDefaultTeamMap(new Map(this.origin));
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