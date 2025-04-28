import { LiveState, StdlRedis } from './stdl.redis.js';
import { log } from 'jslog';
import { LiveDto } from '../../live/spec/live.dto.schema.js';

export class StdlRedisMock implements StdlRedis {
  async setLiveDto(live: LiveDto, enforceCreds: boolean): Promise<void> {
    log.info(`StdlRedisMock.setLiveDto(...)`, { live, enforceCreds });
    return Promise.resolve();
  }

  async set(live: LiveState): Promise<void> {
    log.info(`StdlRedisMock.setLive(${JSON.stringify(live)})`);
    return Promise.resolve();
  }

  async get(liveId: string): Promise<LiveState | undefined> {
    log.info(`StdlRedisMock.getLive(${liveId})`);
    return Promise.resolve(undefined);
  }

  async delete(liveId: string): Promise<void> {
    log.info(`StdlRedisMock.delete(${liveId})`);
    return Promise.resolve();
  }

  async dropAll(): Promise<void> {
    log.info(`StdlRedisMock.dropAll()`);
    return Promise.resolve();
  }
}
