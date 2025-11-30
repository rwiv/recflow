import { CacheStore, SetOptions } from '@/infra/cache/cache.store.js';

export class MemoryCacheStore extends CacheStore {
  private readonly strMap: Map<string, string> = new Map();
  private readonly listMap: Map<string, string[]> = new Map();

  async get(key: string): Promise<string | null> {
    return this.strMap.get(key) ?? null;
  }

  async mGet(keys: string[]): Promise<(string | null)[]> {
    const result = [];
    for (const key of keys) {
      result.push(this.strMap.get(key) ?? null);
    }
    return result;
  }

  async exists(key: string): Promise<boolean> {
    if (this.strMap.has(key)) return true;
    return this.listMap.has(key);
  }

  async set(key: string, value: string, opts: SetOptions): Promise<void> {
    this.strMap.set(key, value);
  }

  async addItem(key: string, value: string): Promise<void> {
    const lst = this.listMap.get(key);
    if (lst) {
      this.listMap.set(key, [...lst, value]);
    } else {
      this.listMap.set(key, [value]);
    }
  }

  async deleteItem(key: string, value: string): Promise<void> {
    const lst = this.listMap.get(key);
    if (!lst) return;

    const filtered = lst.filter((v) => v !== value);
    this.listMap.set(key, filtered);
  }

  async list(key: string): Promise<string[]> {
    const lst = this.listMap.get(key);
    if (!lst) return [];
    return lst;
  }

  async delete(key: string): Promise<void> {
    this.strMap.delete(key);
    this.listMap.delete(key);
  }

  async deleteBatch(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.delete(key)));
  }

  async dropAllKeys() {
    const keys = [...this.strMap.keys(), ...this.listMap.keys()];
    if (keys.length > 0) {
      await this.deleteBatch(keys);
    }
  }
}
