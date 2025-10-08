import { StdlRedis } from './stdl.redis.js';
import { liveState, LiveState, SegmentKeyword } from './stdl.redis.data.js';
import { RedisClientType } from 'redis';
import { LiveDto } from '../../../live/spec/live.dto.schema.js';
import { ValidationError } from '../../../utils/errors/errors/ValidationError.js';
import { StdlLocationType } from '../common/stdl.types.js';
import { NotFoundError } from '../../../utils/errors/errors/NotFoundError.js';
import { liveDtoToState } from './stdl.redis.utils.js';

export const LIVE_PREFIX = 'live';
export const LIVES_KEY = 'lives';
export const SEGMENTS_PREFIX = 'segments';
export const SEGMENT_PREFIX = 'segment';

export class StdlRedisImpl extends StdlRedis {
  constructor(
    private readonly master: RedisClientType,
    private readonly replica: RedisClientType,
    private readonly liveStateExpireSec: number,
    private readonly defaultLocation: StdlLocationType,
    private readonly followedLocation: StdlLocationType,
  ) {
    super();
  }

  async createLiveState(live: LiveDto): Promise<void> {
    let location = this.defaultLocation;
    if (live.channel.isFollowed) {
      location = this.followedLocation;
    }
    if (live.domesticOnly) {
      location = 'local';
    }
    await this.set(liveDtoToState(live, location));
  }

  async set(state: LiveState): Promise<void> {
    const key = `${LIVE_PREFIX}:${state.id}`;
    if (await this.master.get(key)) {
      throw new ValidationError(`liveId ${state.id} already exists`);
    }
    await this.master.set(key, JSON.stringify(state), { EX: this.liveStateExpireSec });
    await this.master.zAdd(LIVES_KEY, { score: Date.now(), value: state.id });
  }

  async getLiveState(liveRecordId: string, useMaster: boolean): Promise<LiveState | null> {
    const key = `${LIVE_PREFIX}:${liveRecordId}`;
    const liveData = await this.getClient(useMaster).get(key);
    if (!liveData) {
      return null;
    }
    return liveState.parse(JSON.parse(liveData));
  }

  async getLiveStates(liveRecordIds: string[], useMaster: boolean): Promise<(LiveState | null)[]> {
    if (liveRecordIds.length === 0) {
      return [];
    }
    const keys = liveRecordIds.map((id) => `${LIVE_PREFIX}:${id}`);
    const data = await this.getClient(useMaster).mGet(keys);
    return data.map((item) => {
      if (!item) {
        return null;
      }
      return liveState.parse(JSON.parse(item));
    });
  }

  async deleteLiveState(liveRecordId: string): Promise<void> {
    const key = `${LIVE_PREFIX}:${liveRecordId}`;
    if (await this.replica.get(key)) {
      await this.master.del(key);
    }
    await this.master.zRem(LIVES_KEY, liveRecordId);
  }

  async getLivesIds(useMaster: boolean): Promise<string[]> {
    return await this.getClient(useMaster).zRange(LIVES_KEY, 0, -1);
  }

  async getSegNums(liveId: string, keyword: SegmentKeyword, useMaster: boolean): Promise<string[]> {
    return await this.getClient(useMaster).zRange(getSegKey(liveId, keyword), 0, -1);
  }

  async deleteSegNumSet(liveId: string, keyword: SegmentKeyword): Promise<void> {
    await this.master.del(getSegKey(liveId, keyword));
  }

  async deleteSegmentStates(liveId: string, nums: string[]): Promise<void> {
    await this.master.del(nums.map((num) => `${LIVE_PREFIX}:${liveId}:${SEGMENT_PREFIX}:${num}`));
  }

  async updateIsInvalid(liveId: string, isInvalid: boolean): Promise<void> {
    const state = await this.getLiveState(liveId, true);
    if (!state) {
      throw NotFoundError.from('Live', 'id', liveId);
    }
    state.isInvalid = isInvalid;
    await this.master.set(`${LIVE_PREFIX}:${state.id}`, JSON.stringify(state), { EX: this.liveStateExpireSec });
  }

  private getClient(useMaster: boolean = false) {
    return useMaster ? this.master : this.replica;
  }
}

function getSegKey(liveId: string, keyword: SegmentKeyword) {
  return `${LIVE_PREFIX}:${liveId}:${SEGMENTS_PREFIX}:${keyword}`;
}
