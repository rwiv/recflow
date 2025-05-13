import { Inject, Injectable } from '@nestjs/common';
import { STDL_REDIS } from '../../infra/infra.tokens.js';
import { StdlRedis } from '../../infra/stdl/stdl.redis.js';
import { log } from 'jslog';
import { LiveFinder } from './live.finder.js';
import { liveNodeAttr } from '../../common/attr/attr.live.js';
import { subLists } from '../../utils/list.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';

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
    for (const liveId of liveIds) {
      const exists = await this.liveFinder.findById(liveId);
      if (!exists) {
        targetIds.push(liveId);
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
    for (const batch of subLists(nums, this.env.liveClearBatchSize)) {
      const promises = [];
      for (const num of batch) {
        promises.push(this.stdlRedis.deleteSegmentState(liveId, num));
      }
      await Promise.all(promises);
    }
    await this.stdlRedis.deleteSuccessSegNumSet(liveId);
    await this.stdlRedis.deleteLive(liveId);

    const duration = Date.now() - start;
    log.info('Cleaned live', { liveId, duration, nums: nums.length });
  }
}
