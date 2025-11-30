import { Inject, Injectable } from '@nestjs/common';
import assert from 'assert';
import { log } from 'jslog';

import { subLists } from '@/utils/list.js';
import { handleSettled } from '@/utils/log.js';
import { findMissingNums } from '@/utils/numbers.js';

import { liveAttr } from '@/common/attr/attr.live.js';
import { ENV } from '@/common/config/config.module.js';
import { Env } from '@/common/config/env.js';

import { Notifier } from '@/external/notify/notifier.js';
import { segmentKeyword } from '@/external/recnode/redis/recnode.redis.data.js';
import { RecnodeRedis } from '@/external/recnode/redis/recnode.redis.js';

import { LiveFinder } from '@/live/data/live.finder.js';

@Injectable()
export class LiveStateCleaner {
  constructor(
    @Inject(ENV) private readonly env: Env,
    private readonly liveFinder: LiveFinder,
    private readonly recnodeRedis: RecnodeRedis,
    private readonly notifier: Notifier,
  ) {}

  async cleanup() {
    const ps = [];
    for (const targetId of await this.getTargetIds()) {
      ps.push(this.clearLive(targetId));
    }
    handleSettled(await Promise.allSettled(ps));
  }

  async getTargetIds() {
    const liveIds = await this.recnodeRedis.getLivesIds(false);

    const targetIds = [];
    const rawLiveStates = await this.recnodeRedis.getLiveStates(liveIds, false);
    for (let i = 0; i < rawLiveStates.length; i++) {
      const liveState = rawLiveStates[i];
      if (!liveState) {
        await this.recnodeRedis.deleteLiveState(liveIds[i]);
        continue;
      }
      const initWaitMs = this.env.liveStateInitWaitSec * 1000;
      const threshold = new Date(Date.now() - initWaitMs);
      if (liveState.createdAt >= threshold) {
        continue;
      }
      const exists = await this.liveFinder.findById(liveState.id, { nodes: true });
      if (!exists) {
        targetIds.push(liveState.id);
        continue;
      }
      assert(exists.nodes);
      if (exists.nodes.length > 0) {
        continue;
      }
      if (exists.isDisabled && exists.deletedAt && exists.deletedAt < threshold) {
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
      const nums = await this.recnodeRedis.getSegNums(liveId, keyword, false);
      for (const batchNums of subLists(nums, this.env.recnodeClearBatchSize)) {
        await this.recnodeRedis.deleteSegmentStates(liveId, batchNums);
      }
      await this.recnodeRedis.deleteSegNumSet(liveId, keyword);

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
    await this.recnodeRedis.deleteLiveState(liveId);
  }
}
