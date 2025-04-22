import { liveState, LiveState, StdlRedis } from './stdl.redis.js';
import { RedisClientType } from 'redis';
import { LiveDto } from '../../live/spec/live.dto.schema.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { Authed } from '../authed/authed.js';

export const LIVE_PREFIX = 'live';

export class StdlRedisImpl implements StdlRedis {
  constructor(
    private readonly client: RedisClientType,
    private readonly authed: Authed,
  ) {}

  async setLiveDto(live: LiveDto): Promise<void> {
    if (!live.streamUrl) {
      throw new ValidationError(`streamUrl is required for liveDto`);
    }
    let cookie = null;
    if (live.isAdult) {
      cookie = await this.authed.requestCookie(live.platform.name);
    }
    const liveState: LiveState = {
      platfrom: live.platform.name,
      channelId: live.channel.pid,
      channelName: live.channel.username,
      liveId: live.sourceId,
      liveTitle: live.liveTitle,
      streamUrl: live.streamUrl,
      latestNum: null,
      cookie,
      videoName: live.videoName,
    };
    return this.setLive(liveState);
  }

  async setLive(live: LiveState): Promise<void> {
    const key = `${LIVE_PREFIX}:${live.liveId}`;
    await this.client.set(key, JSON.stringify(live));
  }

  async getLive(liveId: string): Promise<LiveState | undefined> {
    const key = `${LIVE_PREFIX}:${liveId}`;
    const liveData = await this.client.get(key);
    if (!liveData) {
      return undefined;
    }
    return liveState.parse(JSON.parse(liveData));
  }
}
