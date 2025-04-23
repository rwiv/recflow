import { LiveState, StdlRedis } from './stdl.redis.js';
import { log } from 'jslog';
import { LiveDto } from '../../live/spec/live.dto.schema.js';

export class StdlRedisMock implements StdlRedis {
  async setLiveDto(live: LiveDto): Promise<void> {
    log.info(`StdlRedisMock.setLiveDto(liveDto)`);
    return Promise.resolve();
  }

  async setLive(live: LiveState): Promise<void> {
    log.info(`StdlRedisMock.setLive(${JSON.stringify(live)})`);
    return Promise.resolve();
  }

  async getLive(liveId: string): Promise<LiveState | undefined> {
    log.info(`StdlRedisMock.getLive(${liveId})`);
    return Promise.resolve(undefined);
  }
}
