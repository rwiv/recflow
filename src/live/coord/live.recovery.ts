import { Inject, Injectable } from '@nestjs/common';
import { NOTIFIER, STDL, STDL_REDIS } from '../../infra/infra.tokens.js';
import { LiveFinder } from '../data/live.finder.js';
import { LiveDto } from '../spec/live.dto.schema.js';
import { NodeUpdater } from '../../node/service/node.updater.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { LiveRegistrar } from '../register/live.registrar.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { log } from 'jslog';
import { RecordingStatus, Stdl } from '../../infra/stdl/stdl.client.js';
import { NodeFinder } from '../../node/service/node.finder.js';
import { NodeDto } from '../../node/spec/node.dto.schema.js';
import { LiveNodeRepository } from '../../node/storage/live-node.repository.js';
import { Stlink } from '../../platform/stlink/stlink.js';
import assert from 'assert';
import { liveAttr } from '../../common/attr/attr.live.js';
import { StdlRedis } from '../../infra/stdl/stdl.redis.js';
import { Notifier } from '../../infra/notify/notifier.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { LogLevel } from '../../utils/log.js';
import { stacktrace } from '../../utils/errors/utils.js';
import { LiveInitializer } from '../register/live.initializer.js';

interface InvalidNode {
  node: NodeDto;
  // if status is null, it means the recording has already been canceled.
  status: RecordingStatus | null;
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
    private readonly liveInitializer: LiveInitializer,
    private readonly liveRegistrar: LiveRegistrar,
    private readonly liveNodeRepo: LiveNodeRepository,
    private readonly nodeUpdater: NodeUpdater,
    private readonly nodeFinder: NodeFinder,
    private readonly fetcher: PlatformFetcher,
  ) {}

  async check() {
    const promises = [];
    for (const live of await this.retrieveInvalidNodes()) {
      promises.push(this.checkInvalidLive(live));
    }
    await Promise.allSettled(promises);
  }

  private async checkInvalidLive(invalidLive: TargetLive) {
    const live = await this.liveFinder.findById(invalidLive.live.id); // latest live dto
    if (!live) {
      log.error(`Live not found`, liveAttr(invalidLive.live));
      return;
    }

    // Skip already finished live
    if (live.isDisabled) {
      log.error('Live is disabled', liveAttr(live));
      return;
    }

    // Finish if live is invalid
    if (await this.stdlRedis.isInvalidLive(live)) {
      this.notifier.notify(`Live is invalid: channel=${live.channel.username}, title=${live.liveTitle}`);
      if (live.platform.name === 'soop') {
        await this.registerSameLive(live);
      }
      await this.finishLive(live.id, 'Live is invalid', 'error');
      return;
    }

    // Finish if live not open
    let withAuth = live.isAdult;
    if (live.channel.isFollowed && this.env.stlink.enforceAuthForFollowed) {
      withAuth = true;
    }
    const streamInfo = await this.stlink.fetchStreamInfo(live.platform.name, live.channel.pid, withAuth);
    if (!streamInfo.openLive) {
      await this.finishLive(live.id, 'Delete uncleaned live', 'info');
      return;
    }

    // Finish if live is restarted
    const chanInfo = await this.fetcher.fetchChannelNotNull(live.platform.name, live.channel.pid, true);
    if (live.sourceId !== chanInfo.liveInfo?.liveId) {
      if (live.platform.name === 'soop') {
        await this.registerSameLive(live);
      }
      await this.finishLive(live.id, 'Delete restarted live', 'warn');
      return;
    }

    // Finish if live m3u8 is not valid
    const m3u8Text = await this.stlink.fetchM3u8ByLive(live);
    if (!m3u8Text) {
      await this.finishLive(live.id, 'Delete live because m3u8 is not valid', 'error');
      return;
    }

    // Recovery invalid nodes in live
    const ps = invalidLive.invalidNodes.map((ivNode) => this.checkInvalidNode(live, ivNode.node));
    await Promise.allSettled(ps);
  }

  private finishLive(liveId: string, message: string, logLevel: LogLevel) {
    return this.liveRegistrar.finishLive({
      recordId: liveId,
      isPurge: true,
      exitCmd: 'finish',
      msg: message,
      logLevel: logLevel,
    });
  }

  private async registerSameLive(live: LiveDto) {
    try {
      return await this.liveInitializer.createNewLiveByLive(live);
    } catch (e) {
      log.error('Failed to reregister same live', { ...liveAttr(live), stack_trace: stacktrace(e) });
    }
  }

  private async checkInvalidNode(tgtLive: LiveDto, invalidNode: NodeDto) {
    const live = await this.liveFinder.findById(tgtLive.id, {}); // latest live dto
    if (!live) {
      log.error(`Live not found`, liveAttr(tgtLive, { node: invalidNode }));
      return;
    }
    // Skip already finished live
    if (live.isDisabled) {
      log.error('Live is already disabled', liveAttr(live, { node: invalidNode }));
      return;
    }

    await this.liveRegistrar.deregister(live, invalidNode);

    await db.transaction(async (tx: Tx) => {
      const node = await this.nodeFinder.findByIdForUpdate(invalidNode.id, {}, tx);
      if (!node) {
        log.error(`Node not found`, liveAttr(live, { node }));
        return;
      }
      if (node.failureCnt >= this.env.nodeFailureThreshold) {
        await this.nodeUpdater.update(node.id, { failureCnt: 0, isCordoned: true }, tx);
        this.notifier.notify(`Node ${node.name} is cordoned due to failure count exceeded threshold`);
      } else {
        await this.nodeUpdater.update(node.id, { failureCnt: node.failureCnt + 1 }, tx);
      }
    });
  }

  private async retrieveInvalidNodes(): Promise<TargetLive[]> {
    const nodes: NodeDto[] = await this.nodeFinder.findAll({});
    const nodeRecsMap: Map<string, RecordingStatus[]> = await this.stdl.getNodeRecorderStatusListMap(nodes);

    const initWaitMs = this.env.liveRecoveryInitWaitSec * 1000;
    const threshold = new Date(Date.now() - initWaitMs);

    const invalidLiveMap = new Map<string, TargetLive>();
    for (const live of await this.liveFinder.findAllActives({ nodes: true })) {
      assert(live.nodes);
      for (const node of live.nodes) {
        const nodeRecs: RecordingStatus[] | undefined = nodeRecsMap.get(node.id);
        assert(nodeRecs);

        // Filter valid recordings in node
        const recStatus = nodeRecs.find((status) => status.id === live.id);
        if (recStatus && ['recording', 'completed'].includes(recStatus.status)) {
          continue;
        }
        const liveNode = await this.liveNodeRepo.findByLiveIdAndNodeId(live.id, node.id);
        if (!liveNode) {
          log.error('LiveNode Not Found', liveAttr(live, { node }));
          continue;
        }
        if (liveNode.createdAt >= threshold) {
          continue;
        }

        // Add invalid node to invalidLiveMap
        const invalidNode: InvalidNode = { node, status: recStatus ?? null, mappedAt: liveNode.createdAt };
        const invalidLive = invalidLiveMap.get(live.id);
        if (invalidLive) {
          invalidLive.invalidNodes.push(invalidNode);
        } else {
          invalidLiveMap.set(live.id, { live, invalidNodes: [invalidNode] });
        }
      }
    }
    return Array.from(invalidLiveMap.values());
  }
}
