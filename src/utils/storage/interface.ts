export interface AsyncMap<K, V> {
  get(key: K): Promise<V | null>;
  set(key: K, value: V): Promise<void>;
  delete(key: K): Promise<void>;
  clear(): Promise<void>;
  size(): Promise<number>;
  keys(): Promise<K[]>;
  values(): Promise<V[]>;
  entries(): Promise<[K, V][]>;
}

export interface AsyncSet<T> {
  add(value: T): Promise<void>;
  delete(value: T): Promise<void>;
  clear(): Promise<void>;
  size(): Promise<number>;
  has(value: T): Promise<boolean>;
  values(): Promise<T[]>;
}
