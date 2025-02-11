import { AsyncMap } from './interface.js';
import { NotFoundError } from '../errors/errors/NotFoundError.js';

export class MemoryMap<K, V> implements AsyncMap<K, V> {
  private map = new Map<K, V>();

  get(key: K): Promise<V | undefined> {
    return Promise.resolve(this.map.get(key));
  }

  async set(key: K, value: V): Promise<void> {
    this.map.set(key, value);
    return Promise.resolve();
  }

  async delete(key: K): Promise<void> {
    if (!this.map.has(key)) {
      throw new NotFoundError('Value not found by key');
    }
    this.map.delete(key);
    return Promise.resolve();
  }

  clear(): Promise<void> {
    this.map.clear();
    return Promise.resolve();
  }

  size(): Promise<number> {
    return Promise.resolve(this.map.size);
  }

  keys(): Promise<K[]> {
    return Promise.resolve(Array.from(this.map.keys()));
  }

  values(): Promise<V[]> {
    return Promise.resolve(Array.from(this.map.values()));
  }

  entries(): Promise<[K, V][]> {
    return Promise.resolve(Array.from(this.map.entries()));
  }
}
