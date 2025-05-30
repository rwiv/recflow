import { Inject, Injectable } from '@nestjs/common';
import { NOTIFIER, STDL, STDL_REDIS } from '../../infra/infra.tokens.js';
import { LiveFinder } from '../data/live.finder.js';
import { LiveDto } from '../spec/live.dto.schema.js';
import { NodeUpdater } from '../../node/service/node.updater.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { LiveRegistrar } from './live.registrar.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { log } from 'jslog';
import { ChannelLiveInfo, channelLiveInfo } from '../../platform/spec/wapper/channel.js';
import { RecorderStatus, Stdl } from '../../infra/stdl/stdl.client.js';
import { NodeFinder } from '../../node/service/node.finder.js';
import { NodeDto } from '../../node/spec/node.dto.schema.js';
import { LiveNodeRepository } from '../../node/storage/live-node.repository.js';
import { Stlink } from '../../platform/stlink/stlink.js';
import assert from 'assert';
import { liveNodeAttr } from '../../common/attr/attr.live.js';
import { StdlRedis } from '../../infra/stdl/stdl.redis.js';
import { Notifier } from '../../infra/notify/notifier.js';

interface InvalidNode {
  node: NodeDto;
  // if status is null, it means the recorder has already been canceled.
  status: RecorderStatus | null;
  mappedAt: Date;
}

interface TargetLive {
  live: LiveDto;
  invalidNodes: InvalidNode[];
}

@Injectable()
export class LiveRecoveryManager {
  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(STDL) private readonly stdl: Stdl,
    @Inject(STDL_REDIS) private readonly stdlRedis: StdlRedis,
    @Inject(NOTIFIER) private readonly notifier: Notifier,
    private readonly stlink: Stlink,
    private readonly liveFinder: LiveFinder,
    private readonly liveRegistrar: LiveRegistrar,
    private readonly liveNodeRepo: LiveNodeRepository,
    private readonly nodeUpdater: NodeUpdater,
    private readonly nodeFinder: NodeFinder,
    private readonly fetcher: PlatformFetcher,
  ) {}

  async check() {
    for (const [liveId, tgLive] of await this.retrieveInvalidNodes()) {
      await this.checkInvalidLive(tgLive);
    }
  }

  private async checkInvalidLive(tgLive: TargetLive) {
    const live = await this.liveFinder.findById(tgLive.live.id); // latest live dto
    if (!live) {
      log.error(`Live not found`, liveNodeAttr(tgLive.live));
      return;
    }

    // Skip already finished live
    if (live.isDisabled) {
      log.error('Live is disabled', liveNodeAttr(live));
      return;
    }

    // Finish if live is not invalid
    if (await this.stdlRedis.isInvalidLive(live)) {
      return this.finishLive(live.id, 'Live is not invalid');
    }

    // Finish if live not open
    const streamInfo = await this.stlink.fetchStreamInfo(live.platform.name, live.channel.pid, live.isAdult); // TODO: change check live.headers
    if (!streamInfo.openLive) {
      return this.finishLive(live.id, 'Delete uncleaned live');
    }

    // Finish if live is restarted
    const chanInfo = await this.fetcher.fetchChannelNotNull(live.platform.name, live.channel.pid, true);
    if (live.sourceId !== chanInfo.liveInfo?.liveId) {
      return this.finishLive(live.id, 'Delete restarted live');
    }

    // Finish if live m3u8 is not valid
    const m3u8Text = await this.stlink.fetchM3u8ByLive(live);
    if (!m3u8Text) {
      return this.finishLive(live.id, 'Delete live because m3u8 is not valid');
    }

    // Recovery invalid nodes in live
    for (const invalidNode of tgLive.invalidNodes) {
      await this.checkInvalidNode(live, invalidNode.node);
    }
  }

  private finishLive(liveId: string, message: string) {
    return this.liveRegistrar.finishLive(liveId, {
      isPurge: true,
      exitCmd: 'finish',
      msg: message,
    });
  }

  private async checkInvalidNode(tgLive: LiveDto, invalidNode: NodeDto) {
    const live = await this.liveFinder.findById(tgLive.id); // latest live dto
    if (!live) {
      log.error(`Live not found`, liveNodeAttr(tgLive, invalidNode));
      return;
    }

    // Skip already finished live
    if (tgLive.isDisabled) {
      log.error('Live is already disabled', liveNodeAttr(tgLive, invalidNode));
      return;
    }

    if (invalidNode.failureCnt >= this.env.nodeFailureThreshold) {
      await this.nodeUpdater.update(invalidNode.id, { failureCnt: 0, isCordoned: true });
      const alertMsg = `Node ${invalidNode.name} is cordoned due to failure count exceeded threshold`;
      this.notifier.notify(this.env.untf.topic, alertMsg);
    } else {
      await this.nodeUpdater.update(invalidNode.id, { failureCnt: invalidNode.failureCnt + 1 });
    }

    await this.liveRegistrar.deregister(tgLive, invalidNode);
  }

  private async retrieveInvalidNodes(): Promise<Map<string, TargetLive>> {
    const nodes: NodeDto[] = await this.nodeFinder.findAll({});
    const nodeRecsMap: Map<string, RecorderStatus[]> = await this.stdl.getNodeRecorderStatusListMap(nodes);

    const threshold = new Date(Date.now() - this.env.liveRecoveryWaitTimeMs);

    const invalidLiveMap = new Map<string, TargetLive>();
    for (const live of await this.liveFinder.findAllActives({ nodes: true })) {
      assert(live.nodes);
      for (const node of live.nodes) {
        const nodeRecs: RecorderStatus[] | undefined = nodeRecsMap.get(node.id);
        assert(nodeRecs);

        // Filter valid recorders in node
        const recStatus = nodeRecs.find((status) => status.id === live.id);
        if (recStatus && ['recording', 'done'].includes(recStatus.status)) {
          continue;
        }
        const liveNode = await this.liveNodeRepo.findByLiveIdAndNodeId(live.id, node.id);
        if (!liveNode) {
          log.error('LiveNode Not Found', liveNodeAttr(live, node));
          continue;
        }
        if (liveNode.createdAt >= threshold) {
          continue;
        }

        // Add invalid node to invalidLiveMap
        const invalidNode: InvalidNode = {
          node,
          status: recStatus ?? null,
          mappedAt: liveNode.createdAt,
        };
        const invalidLive = invalidLiveMap.get(live.id);
        if (invalidLive) {
          invalidLive.invalidNodes.push(invalidNode);
        } else {
          invalidLiveMap.set(live.id, { live, invalidNodes: [invalidNode] });
        }
      }
    }
    return invalidLiveMap;
  }
}
