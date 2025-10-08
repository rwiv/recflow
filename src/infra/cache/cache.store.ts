export interface SetOptions {
  keepEx?: boolean;
  exSec?: number;
}

export abstract class CacheStore {
  abstract get(key: string): Promise<string | null>;
  abstract mGet(keys: string[]): Promise<(string | null)[]>;
  abstract exists(key: string): Promise<boolean>;
  abstract set(key: string, value: string, opts: SetOptions): Promise<void>;

  abstract addItem(key: string, value: string): Promise<void>;
  abstract deleteItem(key: string, value: string): Promise<void>;
  abstract list(key: string): Promise<string[]>;

  abstract delete(key: string): Promise<void>;
  abstract deleteBatch(keys: string[]): Promise<void>;

  abstract dropAllKeys(): Promise<void>;
}
