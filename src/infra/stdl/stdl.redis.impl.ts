import { liveState, LiveState, StdlRedis } from './stdl.redis.js';
import { RedisClientType } from 'redis';
import { LiveDto } from '../../live/spec/live.dto.schema.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { liveDtoToState } from './stdl.utils.js';
import { log } from 'jslog';
import { liveNodeAttr } from '../../common/attr/attr.live.js';

export const LIVE_PREFIX = 'live';
export const LIVES_KEY = 'lives';
export const SEGMENTS_PREFIX = 'segments';
export const SEGMENT_PREFIX = 'segment';

export const EXPIRATION_TIME_SEC = 60 * 60 * 24 * 7; // 7 day

export class StdlRedisImpl extends StdlRedis {
  constructor(private readonly client: RedisClientType) {
    super();
  }

  async setLive(live: LiveDto): Promise<void> {
    if (!live.streamUrl) {
      const errMsg = `streamUrl is required for liveDto`;
      log.error(errMsg, liveNodeAttr(live));
      throw new ValidationError(errMsg);
    }
    return this.set(liveDtoToState(live));
  }

  async set(state: LiveState): Promise<void> {
    const key = `${LIVE_PREFIX}:${state.id}`;
    if (await this.client.get(key)) {
      throw new ValidationError(`liveId ${state.id} already exists`);
    }
    await this.client.set(key, JSON.stringify(state), { EX: EXPIRATION_TIME_SEC });
    await this.client.zAdd(LIVES_KEY, { score: Date.now(), value: state.id });
  }

  async getLive(liveRecordId: string): Promise<LiveState | undefined> {
    const key = `${LIVE_PREFIX}:${liveRecordId}`;
    const liveData = await this.client.get(key);
    if (!liveData) {
      return undefined;
    }
    return liveState.parse(JSON.parse(liveData));
  }

  async deleteLive(liveRecordId: string): Promise<void> {
    const key = `${LIVE_PREFIX}:${liveRecordId}`;
    if (await this.client.get(key)) {
      await this.client.del(key);
    }
    await this.client.zRem(LIVES_KEY, liveRecordId);
  }

  async dropAllLives(): Promise<void> {
    const keys = await this.client.keys(`*`);
    for (const key of keys) {
      await this.client.del(key);
    }
    await this.client.del(LIVES_KEY);
  }

  async getLivesIds() {
    return await this.client.zRange(LIVES_KEY, 0, -1);
  }

  async getSuccessSegNums(liveId: string) {
    return await this.client.zRange(`${LIVE_PREFIX}:${liveId}:${SEGMENTS_PREFIX}:success`, 0, -1);
  }

  async deleteSuccessSegNumSet(liveId: string) {
    await this.client.del(`${LIVE_PREFIX}:${liveId}:${SEGMENTS_PREFIX}:success`);
  }

  async getSegmentState(liveId: string, num: string) {
    return await this.client.get(`${LIVE_PREFIX}:${liveId}:${SEGMENT_PREFIX}:${num}`);
  }

  async deleteSegmentState(liveId: string, num: string) {
    await this.client.del(`${LIVE_PREFIX}:${liveId}:${SEGMENT_PREFIX}:${num}`);
  }
}
