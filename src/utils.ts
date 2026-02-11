export class ReadOnlyStrictMap<K, V> {
  protected constructor(protected origin: ReadonlyMap<K, V>) {}
  get(key: K): V | undefined {
    return this.origin.get(key);
  }
  getOrThrow(id: K): V {
    const value = this.origin.get(id);
    if (value === undefined) {
      throw new StrictMapError(`Cannot find id:${id}`);
    }
    return value;
  }
  has(id: K): boolean {
    return this.origin.has(id);
  }
  values(): V[] {
    return this.origin.values().toArray();
  }
  get size() : number{return this.origin.size}
}

export class StrictMap<K, V> extends ReadOnlyStrictMap<K, V> {
  public constructor(protected origin: Map<K, V>) {
    super(origin);
  }
  set(id: K, value: V) {
    this.origin.set(id, value);
  }
  toReadOnly(): ReadOnlyStrictMap<K, V> {
    return new ReadOnlyStrictMap<K, V>(this.origin)
  }
}


export class StrictMapError extends Error {
  constructor(
    public message: string,
    public options?: ErrorOptions
  ) {
    super(message, options);
    this.name = 'StrictMapError';
  }
}