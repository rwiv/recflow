import { Inject, Injectable } from '@nestjs/common';
import { log } from 'jslog';

import { LogLevel, handleSettled } from '@/utils/log.js';

import { liveAttr } from '@/common/attr/attr.live.js';
import { ENV } from '@/common/config/config.module.js';
import { Env } from '@/common/config/env.js';

import { Recnode } from '@/external/recnode/client/recnode.client.js';
import { RecnodeRedis } from '@/external/recnode/redis/recnode.redis.js';

import { NodeRepository } from '@/node/storage/node.repository.js';

import { LiveFinder } from '@/live/data/live.finder.js';
import { LiveRegistrar } from '@/live/register/live.registrar.js';
import { LiveDtoMapped } from '@/live/spec/live.dto.schema.mapped.js';

const INIT_THRESHOLD_SEC = 5 * 60; // 5 minutes

@Injectable()
export class LiveBalancer {
  constructor(
    @Inject(ENV) private readonly env: Env,
    private readonly liveFinder: LiveFinder,
    private readonly liveRegistrar: LiveRegistrar,
    private readonly nodeRepo: NodeRepository,
    private readonly recnode: Recnode,
    private readonly recnodeRedis: RecnodeRedis,
  ) {}

  async check() {
    const ps = [];
    for (const live of await this.liveFinder.findAll()) {
      ps.push(this.checkOne(live));
    }
    handleSettled(await Promise.allSettled(ps));
  }

  private async checkOne(live: LiveDtoMapped) {
    // Check if live is disabled or too recently created
    if (live.isDisableRequested) {
      return;
    }
    if (!live.stream) {
      return;
    }
    const initWaitMs = this.env.liveAllocationInitWaitSec * 1000;
    const threshold = new Date(Date.now() - initWaitMs);
    if (live.createdAt >= threshold) {
      return;
    }
    if (await this.recnodeRedis.isInvalidLive(live)) {
      log.warn(`Skip allocation task because Live is invalid`, liveAttr(live));
      return;
    }
    const nodes = await this.nodeRepo.findByLiveId(live.id);
    if (nodes.length >= this.env.maxConcurrentLive) {
      return;
    }

    // Check if existing nodes are recording properly
    if (nodes.length === 0) {
      log.info('Live has no nodes', liveAttr(live));
    }
    if (nodes.length > 0) {
      const first = nodes.sort((a, b) => {
        return b.createdAt.getTime() - a.createdAt.getTime();
      })[0];
      const status = await this.recnode.findStatus(first.endpoint, live.id);
      if (!status || status.status !== 'recording') {
        log.debug('Live is not recording', liveAttr(live));
        return;
      }
    }

    // Register new live allocation or reallocation
    let logLevel: LogLevel = 'debug';
    let logMessage = 'Init allocation Live';
    if (live.createdAt < new Date(Date.now() - INIT_THRESHOLD_SEC * 1000)) {
      logLevel = 'warn';
      logMessage = 'Reallocation Live';
    }
    await this.liveRegistrar.register({
      live,
      nodeSelect: {
        ignoreGroupIds: nodes.map((it) => it.groupId),
      },
      logMessage,
      logLevel,
    });
  }
}
