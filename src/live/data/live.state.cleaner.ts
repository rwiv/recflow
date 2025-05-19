import { Inject, Injectable } from '@nestjs/common';
import { STDL_REDIS } from '../../infra/infra.tokens.js';
import { StdlRedis } from '../../infra/stdl/stdl.redis.js';
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
    const states = (await this.stdlRedis.getLives(liveIds)).filter((s) => s !== null);
    const targetIds = [];
    for (const state of states) {
      const threshold = new Date(Date.now() - INIT_WAIT_THRESHOLD_MS);
      if (state.createdAt >= threshold) {
        continue;
      }
      const exists = await this.liveFinder.findById(state.id);
      if (!exists) {
        targetIds.push(state.id);
      }
      if (exists && exists.isDisabled && exists.deletedAt && exists.deletedAt < threshold) {
        targetIds.push(state.id);
      }
    }
    return targetIds;
  }

  async clearLive(liveId: string) {
    const exists = await this.liveFinder.findById(liveId);
    if (exists) {
      log.error('Live still exists', liveNodeAttr(exists));
      return;
    }

    const start = Date.now();
    const nums = await this.stdlRedis.getSuccessSegNums(liveId);
    for (const batchNums of subLists(nums, this.env.liveClearBatchSize)) {
      await this.stdlRedis.deleteSegmentStates(liveId, batchNums);
    }
    await this.stdlRedis.deleteSuccessSegNumSet(liveId);
    await this.stdlRedis.deleteLive(liveId);

    const duration = Date.now() - start;
    log.debug('Cleaned live', { liveId, duration, nums: nums.length });
  }
}
