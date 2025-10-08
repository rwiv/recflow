import { StdlRedis } from './stdl.redis.js';
import { liveDtoToState } from './stdl.redis.utils.js';
import { LiveState, SegmentKeyword } from './stdl.redis.data.js';
import { LiveDto } from '../../../live/spec/live.dto.schema.js';
import { StdlLocationType } from '../common/stdl.types.js';

export class StdlRedisFake extends StdlRedis {
  private liveStates: Map<string, LiveState> = new Map();
  private segNums: Map<string, string[]> = new Map();

  constructor(private location: StdlLocationType) {
    super();
  }

  clear() {
    this.liveStates = new Map();
    this.segNums = new Map();
  }

  async createLiveState(live: LiveDto): Promise<void> {
    this.liveStates.set(live.id, liveDtoToState(live, this.location));
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
