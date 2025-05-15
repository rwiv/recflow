import { LiveState, StdlRedis } from './stdl.redis.js';
import { log } from 'jslog';
import { LiveDto } from '../../live/spec/live.dto.schema.js';

export class StdlRedisMock extends StdlRedis {
  async setLive(live: LiveDto): Promise<void> {
    log.info(`StdlRedisMock.setLiveDto(...)`);
    return Promise.resolve();
  }

  async getLive(liveId: string): Promise<LiveState | undefined> {
    log.info(`StdlRedisMock.getLive(${liveId})`);
    return Promise.resolve(undefined);
  }

  async getLives(liveRecordIds: string[]): Promise<(LiveState | undefined)[]> {
    log.info(`StdlRedisMock.getLives(...)`);
    return Promise.resolve([]);
  }

  async deleteLive(liveId: string): Promise<void> {
    log.info(`StdlRedisMock.delete(${liveId})`);
    return Promise.resolve();
  }

  async dropAllLives(): Promise<void> {
    log.info(`StdlRedisMock.dropAll()`);
    return Promise.resolve();
  }

  async getLivesIds(): Promise<string[]> {
    // log.info(`StdlRedisMock.getLivesIds()`);
    return Promise.resolve([]);
  }

  async getSuccessSegNums(liveId: string): Promise<string[]> {
    log.info(`StdlRedisMock.getSuccessSegNums(${liveId})`);
    return Promise.resolve([]);
  }

  async deleteSuccessSegNumSet(liveId: string): Promise<void> {
    log.info(`StdlRedisMock.deleteSuccessSegNumSet(${liveId})`);
    return Promise.resolve();
  }

  async deleteSegmentState(liveId: string, num: string): Promise<void> {
    log.info(`StdlRedisMock.deleteSegmentState(${liveId}, ${num})`);
    return Promise.resolve();
  }
}
