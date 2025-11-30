import { AsyncSet } from '@/utils/storage/interface.js';

export class MemorySet<T> implements AsyncSet<T> {
  private set = new Set<T>();

  add(value: T): Promise<void> {
    this.set.add(value);
    return Promise.resolve();
  }

  delete(value: T): Promise<void> {
    this.set.delete(value);
    return Promise.resolve();
  }

  clear(): Promise<void> {
    this.set.clear();
    return Promise.resolve();
  }

  size(): Promise<number> {
    return Promise.resolve(this.set.size);
  }

  has(value: T): Promise<boolean> {
    return Promise.resolve(this.set.has(value));
  }

  values(): Promise<T[]> {
    return Promise.resolve(Array.from(this.set.values()));
  }
}
