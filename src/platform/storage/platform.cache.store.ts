import { Inject, Injectable } from '@nestjs/common';
import { SERVER_REDIS } from '../../infra/infra.tokens.js';
import { CacheStore } from '../../infra/cache/cache.store.js';
import { platformDto, PlatformDto } from '../spec/storage/platform.dto.schema.js';

export const KEY_PREFIX = 'platform';

@Injectable()
export class PlatformCacheStore {
  constructor(@Inject(SERVER_REDIS) private readonly cache: CacheStore) {}

  async findById(id: string): Promise<PlatformDto | null> {
    const data = await this.cache.get(`${KEY_PREFIX}:${id}`);
    if (!data) return null;
    return platformDto.parse(JSON.parse(data));
  }

  async findByName(name: string): Promise<PlatformDto | null> {
    const data = await this.cache.get(`${KEY_PREFIX}:${name}`);
    if (!data) return null;
    return platformDto.parse(JSON.parse(data));
  }

  async set(data: PlatformDto): Promise<void> {
    const text = JSON.stringify(data);
    const p1 = this.cache.set(`${KEY_PREFIX}:${data.id}`, text, {});
    const p2 = this.cache.set(`${KEY_PREFIX}:${data.name}`, text, {});
    await Promise.all([p1, p2]);
  }

  async delete(data: PlatformDto) {
    await this.cache.deleteBatch([`${KEY_PREFIX}:${data.id}`, `${KEY_PREFIX}:${data.name}`]);
  }
}
