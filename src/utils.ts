export class StrictMap<K, V> {
  constructor(private origin: Map<K, V>) {}
  get(id: K): V {
    const value = this.origin.get(id);
    if (value == undefined) {
      throw new StrictMapError(`Cannot find id:${id}`);
    }
    return value
  }
  set(id: K, value: V) {
    this.origin.set(id, value);
  }
  has(id: K): boolean {
    return this.origin.has(id);
  }
  values(): MapIterator<V>{
    return this.origin.values();
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