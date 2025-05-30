import { Inject, Injectable } from '@nestjs/common';
import { STDL_REDIS } from '../../infra/infra.tokens.js';
import { segmentKeyword, StdlRedis } from '../../infra/stdl/stdl.redis.js';
import { log } from 'jslog';
import { LiveFinder } from './live.finder.js';
import { liveNodeAttr } from '../../common/attr/attr.live.js';
import { subLists } from '../../utils/list.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';

const INIT_WAIT_THRESHOLD_MS = 3 * 60 * 1000; // 3 min

@Injectable()
export class LiveStateCleaner {
  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(STDL_REDIS) private readonly stdlRedis: StdlRedis,
    private readonly liveFinder: LiveFinder,
  ) {}

  async cleanup() {
    const targetIds = await this.getTargetIds();
    for (const targetId of targetIds) {
      await this.clearLive(targetId);
    }
  }

  async getTargetIds() {
    const liveIds = await this.stdlRedis.getLivesIds();

    const targetIds = [];
    const rawLiveStates = await this.stdlRedis.getLiveStates(liveIds);
    for (let i = 0; i < rawLiveStates.length; i++) {
      const liveState = rawLiveStates[i];
      if (!liveState) {
        await this.stdlRedis.deleteLiveState(liveIds[i]);
        continue;
      }
      const threshold = new Date(Date.now() - INIT_WAIT_THRESHOLD_MS);
      if (liveState.createdAt >= threshold) {
        continue;
      }
      const exists = await this.liveFinder.findById(liveState.id);
      if (!exists) {
        targetIds.push(liveState.id);
      }
      if (exists && exists.isDisabled && exists.deletedAt && exists.deletedAt < threshold) {
        targetIds.push(liveState.id);
      }
    }
    return targetIds;
  }

  async clearLive(liveId: string) {
    const exists = await this.liveFinder.findById(liveId);
    if (exists && !exists.isDisabled) {
      log.error('Live still exists', liveNodeAttr(exists));
      return;
    }

    for (const keyword of segmentKeyword.options) {
      const start = Date.now();
      const nums = await this.stdlRedis.getSegNums(liveId, keyword);
      for (const batchNums of subLists(nums, this.env.liveClearBatchSize)) {
        await this.stdlRedis.deleteSegmentStates(liveId, batchNums);
      }
      await this.stdlRedis.deleteSegNumSet(liveId, keyword);
      const duration = Date.now() - start;
      log.debug('Cleaned live', { liveId, duration, keyword, nums: nums.length });
    }
    await this.stdlRedis.deleteLiveState(liveId);
  }
}
