import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { STDL, STDL_REDIS } from '../../infra/infra.tokens.js';
import { Stdl } from '../../infra/stdl/stdl.client.js';
import { LiveFinder } from '../data/live.finder.js';
import assert from 'assert';
import { LiveDtoWithNodes } from '../spec/live.dto.mapped.schema.js';
import { LiveRegistrar } from './live.registrar.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { channelLiveInfo } from '../../platform/spec/wapper/channel.js';
import { log } from 'jslog';
import { liveAttr } from '../../common/attr/attr.live.js';
import { LogLevel } from '../../utils/log.js';
import { StdlRedis } from '../../infra/stdl/stdl.redis.js';

const INIT_THRESHOLD_SEC = 5 * 60; // 5 minutes

@Injectable()
export class LiveAllocator {
  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(STDL) private readonly stdl: Stdl,
    @Inject(STDL_REDIS) private readonly stdlRedis: StdlRedis,
    private readonly liveFinder: LiveFinder,
    private readonly liveRegistrar: LiveRegistrar,
    private readonly fetcher: PlatformFetcher,
  ) {}

  async check() {
    const lives = await this.liveFinder.findAll({ nodes: true });
    for (const live of lives) {
      await this.checkOne(live);
    }
  }

  private async checkOne(live: LiveDtoWithNodes) {
    // Check if live is disabled or too recently created
    if (live.isDisabled) {
      return;
    }
    const initWaitMs = this.env.liveAllocationInitWaitSec * 1000;
    const threshold = new Date(Date.now() - initWaitMs);
    if (live.createdAt >= threshold) {
      return;
    }
    assert(live.nodes);
    if (live.nodes.length >= this.env.maxConcurrentLive) {
      return;
    }
    if (await this.stdlRedis.isInvalidLive(live)) {
      log.error(`Skip allocation task because Live is invalid`, liveAttr(live));
      return;
    }

    // Check if existing nodes are recording properly
    if (live.nodes.length === 0) {
      log.info('Live has no nodes', liveAttr(live));
    }
    if (live.nodes.length > 0) {
      const first = live.nodes.sort((a, b) => {
        return b.createdAt.getTime() - a.createdAt.getTime();
      })[0];
      const status = await this.stdl.findStatus(first.endpoint, live.id);
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
    const channelInfo = await this.fetcher.fetchChannelNotNull(live.platform.name, live.channel.pid, true);
    await this.liveRegistrar.register({
      reusableLive: live,
      stream: live.stream ?? undefined,
      channelInfo: channelLiveInfo.parse(channelInfo),
      ignoreGroupIds: live.nodes.map((it) => it.groupId),
      mustExistNode: false,
      logMessage,
      logLevel,
    });
  }
}
