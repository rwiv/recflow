import { liveState, LiveState, StdlRedis } from './stdl.redis.js';
import { RedisClientType } from 'redis';
import { LiveDto } from '../../live/spec/live.dto.schema.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { log } from 'jslog';
import { liveNodeAttr } from '../../common/attr/attr.live.js';

export const LIVE_PREFIX = 'live';
export const LIVES_KEY = 'lives';
export const SEGMENTS_PREFIX = 'segments';
export const SEGMENT_PREFIX = 'segment';

export class StdlRedisImpl extends StdlRedis {
  constructor(
    private readonly client: RedisClientType,
    private readonly exSec: number,
  ) {
    super();
  }

  async createLiveState(live: LiveDto): Promise<void> {
    if (!live.streamUrl) {
      const errMsg = `streamUrl is required for liveDto`;
      log.error(errMsg, liveNodeAttr(live));
      throw new ValidationError(errMsg);
    }
    const now = new Date();
    const state: LiveState = {
      id: live.id,
      platform: live.platform.name,
      channelId: live.channel.pid,
      channelName: live.channel.username,
      liveId: live.sourceId,
      liveTitle: live.liveTitle,
      streamUrl: live.streamUrl,
      headers: live.headers,
      videoName: live.videoName,
      isInvalid: false,
      createdAt: now,
      updatedAt: now,
    };
    return this.set(state);
  }

  async set(state: LiveState): Promise<void> {
    const key = `${LIVE_PREFIX}:${state.id}`;
    if (await this.client.get(key)) {
      throw new ValidationError(`liveId ${state.id} already exists`);
    }
    await this.client.set(key, JSON.stringify(state), { EX: this.exSec });
    await this.client.zAdd(LIVES_KEY, { score: Date.now(), value: state.id });
  }

  async getLiveState(liveRecordId: string): Promise<LiveState | null> {
    const key = `${LIVE_PREFIX}:${liveRecordId}`;
    const liveData = await this.client.get(key);
    if (!liveData) {
      return null;
    }
    return liveState.parse(JSON.parse(liveData));
  }

  async getLiveStates(liveRecordIds: string[]): Promise<(LiveState | null)[]> {
    if (liveRecordIds.length === 0) {
      return [];
    }
    const keys = liveRecordIds.map((id) => `${LIVE_PREFIX}:${id}`);
    const data = await this.client.mGet(keys);
    return data.map((item) => {
      if (!item) {
        return null;
      }
      return liveState.parse(JSON.parse(item));
    });
  }

  async deleteLiveState(liveRecordId: string): Promise<void> {
    const key = `${LIVE_PREFIX}:${liveRecordId}`;
    if (await this.client.get(key)) {
      await this.client.del(key);
    }
    await this.client.zRem(LIVES_KEY, liveRecordId);
  }

  async deleteAllLivesStates(): Promise<void> {
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

  async deleteSegmentStates(liveId: string, nums: string[]): Promise<void> {
    await this.client.del(nums.map((num) => `${LIVE_PREFIX}:${liveId}:${SEGMENT_PREFIX}:${num}`));
  }
}
