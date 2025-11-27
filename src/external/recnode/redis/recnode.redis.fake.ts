import { RecnodeRedis } from './recnode.redis.js';
import { liveDtoToState } from './recnode.redis.utils.js';
import { LiveState, SegmentKeyword } from './recnode.redis.data.js';
import { LiveDto } from '../../../live/spec/live.dto.schema.js';
import { RecnodeLocationType } from '../common/recnode.types.js';

export class RecnodeRedisFake extends RecnodeRedis {
  private liveStates: Map<string, LiveState> = new Map();
  private segNums: Map<string, string[]> = new Map();

  constructor(private location: RecnodeLocationType) {
    super();
  }

  clear() {
    this.liveStates = new Map();
    this.segNums = new Map();
  }

  async createLiveState(live: LiveDto): Promise<LiveState> {
    const liveState = liveDtoToState(live, this.location);
    this.liveStates.set(live.id, liveState);
    return liveState;
  }

  async getLiveState(liveRecordId: string, useMaster: boolean): Promise<LiveState | null> {
    return this.liveStates.get(liveRecordId) ?? null;
  }

  async getLiveStates(liveRecordIds: string[], useMaster: boolean): Promise<(LiveState | null)[]> {
    const result = [];
    for (const recordId of liveRecordIds) {
      const liveState = this.liveStates.get(recordId);
      if (liveState) {
        result.push(liveState);
      }
    }
    return result;
  }

  async deleteLiveState(liveRecordId: string): Promise<void> {
    this.liveStates.delete(liveRecordId);
  }

  async getLivesIds(useMaster: boolean): Promise<string[]> {
    return Array.from(this.liveStates.keys());
  }

  setSegNums(liveId: string, keyword: SegmentKeyword, nums: string[]) {
    this.segNums.set(getSegNumsKey(liveId, keyword), nums);
  }

  async getSegNums(liveId: string, keyword: SegmentKeyword, useMaster: boolean): Promise<string[]> {
    return this.segNums.get(getSegNumsKey(liveId, keyword)) ?? [];
  }

  async deleteSegNumSet(liveId: string, keyword: SegmentKeyword) {
    this.segNums.delete(getSegNumsKey(liveId, keyword));
  }

  async deleteSegmentStates(liveId: string, nums: string[]): Promise<void> {}
}

function getSegNumsKey(liveId: string, keyword: SegmentKeyword) {
  return `${liveId}:${keyword}`;
}
