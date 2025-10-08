import { log } from 'jslog';
import { liveAttr } from '../../../common/attr/attr.live.js';
import { LiveState, SegmentKeyword } from './stdl.redis.data.js';
import { LiveDto } from '../../../live/spec/live.dto.schema.js';

export abstract class StdlRedis {
  abstract createLiveState(live: LiveDto): Promise<void>;
  abstract getLiveState(id: string, useMaster: boolean): Promise<LiveState | null>;
  abstract getLiveStates(liveRecordIds: string[], useMaster: boolean): Promise<(LiveState | null)[]>;
  abstract deleteLiveState(id: string): Promise<void>;

  abstract getLivesIds(useMaster: boolean): Promise<string[]>;
  abstract getSegNums(liveId: string, keyword: SegmentKeyword, useMaster: boolean): Promise<string[]>;
  abstract deleteSegNumSet(liveId: string, keyword: SegmentKeyword): Promise<void>;
  abstract deleteSegmentStates(liveId: string, nums: string[]): Promise<void>;

  async isInvalidLive(live: LiveDto, useMaster: boolean = false): Promise<boolean> {
    const liveState = await this.getLiveState(live.id, useMaster);
    if (!liveState) {
      log.error(`Live not found in redis`, liveAttr(live));
      return true;
    }
    return liveState.isInvalid;
  }
}
