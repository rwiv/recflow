import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { STDL } from '../../infra/infra.tokens.js';
import { Stdl } from '../../infra/stdl/stdl.client.js';
import { LiveFinder } from '../data/live.finder.js';
import assert from 'assert';
import { LiveDtoWithNodes } from '../spec/live.dto.mapped.schema.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { LiveRegistrar } from './live.registrar.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { channelLiveInfo } from '../../platform/spec/wapper/channel.js';
import { log } from 'jslog';
import { liveNodeAttr } from '../../common/attr/attr.live.js';

const INIT_WAIT_THRESHOLD_MS = 5 * 1000; // 5 seconds

@Injectable()
export class LiveAllocator {
  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(STDL) private readonly stdl: Stdl,
    private readonly liveFinder: LiveFinder,
    private readonly liveRegistrar: LiveRegistrar,
    private readonly fetcher: PlatformFetcher,
  ) {}

  async check() {
    const lives = await this.liveFinder.findAll({ nodes: true });
    for (const live of lives) {
      if (live.isDisabled) {
        continue;
      }
      const threshold = new Date(Date.now() - INIT_WAIT_THRESHOLD_MS);
      if (live.createdAt >= threshold) {
        continue;
      }
      await this.checkOne(live);
    }
  }

  private async checkOne(live: LiveDtoWithNodes) {
    assert(live.nodes);
    if (live.nodes.length >= this.env.maxConcurrentLive) {
      return;
    }

    if (live.nodes.length === 0) {
      log.info('Live has no nodes', liveNodeAttr(live));
    }
    if (live.nodes.length > 0) {
      const first = live.nodes[0];
      const status = await this.stdl.findStatus(first.endpoint, live.id);
      if (!status) {
        throw NotFoundError.from('LiveStatus', 'id', first.id);
      }
      if (status.status !== 'recording') {
        log.debug('Live is not recording', liveNodeAttr(live));
        return;
      }
    }

    const channelInfo = await this.fetcher.fetchChannelNotNull(live.platform.name, live.channel.pid, true);
    await this.liveRegistrar.register({
      reusableLive: live,
      channelInfo: channelLiveInfo.parse(channelInfo),
      ignoreGroupIds: live.nodes.map((it) => it.groupId),
      mustExistNode: false,
    });
  }
}
