import { Inject, Injectable } from '@nestjs/common';
import { STDL } from '../../infra/infra.tokens.js';
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
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { NodeDto } from '../../node/spec/node.dto.schema.js';
import { LiveNodeRepository } from '../../node/storage/live-node.repository.js';
import { Stlink } from '../../platform/stlink/stlink.js';
import assert from 'assert';
import { liveNodeAttr } from '../../common/attr/attr.live.js';

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
    private readonly stlink: Stlink,
    private readonly liveFinder: LiveFinder,
    private readonly liveRegistrar: LiveRegistrar,
    private readonly liveNodeRepo: LiveNodeRepository,
    private readonly nodeUpdater: NodeUpdater,
    private readonly nodeFinder: NodeFinder,
    private readonly fetcher: PlatformFetcher,
  ) {}

  async check() {
    const promises = [];
    for (const [liveId, tgLive] of await this.retrieveInvalidNodes()) {
      promises.push(this.checkInvalidLive(tgLive));
    }
    await Promise.all(promises);
  }

  private async checkInvalidLive(tgLive: TargetLive) {
    const live = tgLive.live;

    const streamInfo = await this.stlink.fetchStreamInfo(live.platform.name, live.channel.pid, live.isAdult); // TODO: change check live.headers
    if (!streamInfo.openLive) {
      return this.liveRegistrar.finishLive(live.id, {
        isPurge: true,
        exitCmd: 'finish',
        msg: 'Delete uncleaned live',
      });
    }

    const chanInfo = await this.fetcher.fetchChannelNotNull(live.platform.name, live.channel.pid, true);
    if (live.sourceId !== chanInfo.liveInfo?.liveId) {
      return this.liveRegistrar.finishLive(live.id, {
        isPurge: true,
        exitCmd: 'finish',
        msg: 'Delete restarted live',
      });
    }

    const m3u8Text = await this.stlink.fetchM3u8ByLive(live);
    if (!m3u8Text) {
      return this.liveRegistrar.finishLive(live.id, {
        isPurge: true,
        exitCmd: 'finish',
        msg: 'Delete live because m3u8 is not valid',
      });
    }

    const chanLiveInfo = channelLiveInfo.parse(chanInfo);
    const promises = [];
    for (const invalidNode of tgLive.invalidNodes) {
      promises.push(this.checkInvalidNode(live, invalidNode.node, chanLiveInfo));
    }
    await Promise.all(promises);
  }

  private async checkInvalidNode(tgLive: LiveDto, invalidNode: NodeDto, channelInfo: ChannelLiveInfo) {
    if (tgLive.isDisabled) {
      throw new ValidationError('Live is disabled');
    }

    if (invalidNode.failureCnt >= this.env.nodeFailureThreshold) {
      await this.nodeUpdater.update(invalidNode.id, { failureCnt: 0, isCordoned: true });
    } else {
      await this.nodeUpdater.update(invalidNode.id, { failureCnt: invalidNode.failureCnt + 1 });
    }

    await this.liveRegistrar.deregister(tgLive, invalidNode);
    await this.liveRegistrar.register({
      channelInfo,
      ignoreNodeIds: [invalidNode.id],
      reusableLive: tgLive,
    });
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
