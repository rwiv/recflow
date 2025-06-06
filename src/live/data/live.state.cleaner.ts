import { Inject, Injectable } from '@nestjs/common';
import { NOTIFIER, STDL_REDIS } from '../../infra/infra.tokens.js';
import { segmentKeyword, StdlRedis } from '../../infra/stdl/stdl.redis.js';
import { log } from 'jslog';
import { LiveFinder } from './live.finder.js';
import { liveAttr } from '../../common/attr/attr.live.js';
import { subLists } from '../../utils/list.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { Notifier } from '../../infra/notify/notifier.js';
import { findMissingNums } from '../../utils/numbers.js';

@Injectable()
export class LiveStateCleaner {
  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(STDL_REDIS) private readonly stdlRedis: StdlRedis,
    @Inject(NOTIFIER) private readonly notifier: Notifier,
    private readonly liveFinder: LiveFinder,
  ) {}

  async cleanup() {
    const targetIds = await this.getTargetIds();
    for (const targetId of targetIds) {
      await this.clearLive(targetId);
    }
  }

  async getTargetIds() {
    const liveIds = await this.stdlRedis.getLivesIds(false);

    const targetIds = [];
    const rawLiveStates = await this.stdlRedis.getLiveStates(liveIds, false);
    for (let i = 0; i < rawLiveStates.length; i++) {
      const liveState = rawLiveStates[i];
      if (!liveState) {
        await this.stdlRedis.deleteLiveState(liveIds[i]);
        continue;
      }
      const initWaitMs = this.env.liveStateInitWaitSec * 1000;
      const threshold = new Date(Date.now() - initWaitMs);
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
      log.error('Live still exists', liveAttr(exists));
      return;
    }

    for (const keyword of segmentKeyword.options) {
      const start = Date.now();
      const nums = await this.stdlRedis.getSegNums(liveId, keyword, false);
      for (const batchNums of subLists(nums, this.env.stdlClearBatchSize)) {
        await this.stdlRedis.deleteSegmentStates(liveId, batchNums);
      }
      await this.stdlRedis.deleteSegNumSet(liveId, keyword);

      const live_id = liveId;
      if (keyword == 'retrying' && nums.length > 0) {
        this.notifier.notify(`Invalid retrying segments found: live_id=${liveId}`);
      }
      if (keyword === 'success') {
        const missingNums = findMissingNums(nums.map((numStr) => parseInt(numStr)));
        const missing_nums = missingNums.join(', ');
        if (missingNums.length > 0) {
          log.warn('Missing segment numbers found', { live_id, keyword, missing_nums });
        }
      }
      log.debug('Cleaned live', { live_id, keyword, duration: Date.now() - start, nums_size: nums.length });
    }
    await this.stdlRedis.deleteLiveState(liveId);
  }
}
