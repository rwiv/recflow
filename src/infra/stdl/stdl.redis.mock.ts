import { LiveState, StdlRedis } from './stdl.redis.js';
import { log } from 'jslog';
import { LiveDto } from '../../live/spec/live.dto.schema.js';

export class StdlRedisMock extends StdlRedis {
  async createLiveState(live: LiveDto): Promise<void> {
    log.info(`StdlRedisMock.setLiveDto(...)`);
    return Promise.resolve();
  }

  async getLiveState(liveId: string): Promise<LiveState | null> {
    log.info(`StdlRedisMock.getLive(${liveId})`);
    return Promise.resolve(null);
  }

  async getLiveStates(liveRecordIds: string[]): Promise<(LiveState | null)[]> {
    log.info(`StdlRedisMock.getLives(...)`);
    return Promise.resolve([]);
  }

  async deleteLiveState(liveId: string): Promise<void> {
    log.info(`StdlRedisMock.delete(${liveId})`);
    return Promise.resolve();
  }

  async deleteAllLivesStates(): Promise<void> {
    log.info(`StdlRedisMock.dropAll()`);
    return Promise.resolve();
  }

  async getLivesIds(): Promise<string[]> {
    // log.info(`StdlRedisMock.getLivesIds()`);
    return Promise.resolve([]);
  }

  async getSegNums(liveId: string, keyword: 'success' | 'failed' | 'retrying'): Promise<string[]> {
    log.info(`StdlRedisMock.getSegNums(${liveId}, ${keyword})`);
    return Promise.resolve([]);
  }

  async deleteSegNumSet(liveId: string, keyword: 'success' | 'failed' | 'retrying'): Promise<void> {
    log.info(`StdlRedisMock.deleteSegNumSet(${liveId}, ${keyword})`);
    return Promise.resolve();
  }

  async getRetryingSegNums(liveId: string): Promise<string[]> {
    log.info(`StdlRedisMock.getRetryingSegNums(${liveId})`);
    return Promise.resolve([]);
  }

  async deleteRetryingSegNumSet(liveId: string): Promise<void> {
    log.info(`StdlRedisMock.deleteRetryingSegNumSet(${liveId})`);
    return Promise.resolve();
  }

  async deleteSegmentStates(liveId: string, nums: string[]): Promise<void> {
    log.info(`StdlRedisMock.deleteSegmentStates(${liveId}, ${nums})`);
    return Promise.resolve();
  }
}
