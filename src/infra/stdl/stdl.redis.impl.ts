import { liveState, LiveState, StdlRedis } from './stdl.redis.js';
import { RedisClientType } from 'redis';
import { LiveDto } from '../../live/spec/live.dto.schema.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { Authed } from '../authed/authed.js';
import { liveDtoToState } from './stdl.utils.js';

export const LIVE_PREFIX = 'live';
export const EXPIRATION_TIME_SEC = 60 * 60 * 24 * 7; // 7 day

export class StdlRedisImpl implements StdlRedis {
  constructor(
    private readonly client: RedisClientType,
    private readonly authed: Authed,
  ) {}

  async setLiveDto(live: LiveDto, enforceCreds: boolean): Promise<void> {
    if (!live.streamUrl) {
      throw new ValidationError(`streamUrl is required for liveDto`);
    }
    let cookie = null;
    if (live.isAdult || enforceCreds) {
      cookie = await this.authed.requestCookie(live.platform.name);
    }
    return this.set(liveDtoToState(live, cookie));
  }

  async set(state: LiveState): Promise<void> {
    const key = `${LIVE_PREFIX}:${state.id}`;
    if (await this.client.get(key)) {
      throw new ValidationError(`liveId ${state.liveId} already exists`);
    }
    await this.client.set(key, JSON.stringify(state), {
      EX: EXPIRATION_TIME_SEC,
    });
  }

  async get(liveRecordId: string): Promise<LiveState | undefined> {
    const key = `${LIVE_PREFIX}:${liveRecordId}`;
    const liveData = await this.client.get(key);
    if (!liveData) {
      return undefined;
    }
    return liveState.parse(JSON.parse(liveData));
  }

  async delete(liveRecordId: string): Promise<void> {
    const key = `${LIVE_PREFIX}:${liveRecordId}`;
    if (await this.client.get(key)) {
      await this.client.del(key);
    }
  }

  async dropAll(): Promise<void> {
    const keys = await this.client.keys(`*`);
    for (const key of keys) {
      await this.client.del(key);
    }
  }
}
