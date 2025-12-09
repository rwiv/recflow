import { Inject, Injectable } from '@nestjs/common';
import assert from 'assert';
import { log } from 'jslog';

import { NotFoundError } from '@/utils/errors/errors/NotFoundError.js';
import { stacktrace } from '@/utils/errors/utils.js';
import { LogLevel, handleSettled } from '@/utils/log.js';

import { liveAttr } from '@/common/attr/attr.live.js';
import { ENV } from '@/common/config/config.module.js';
import { Env } from '@/common/config/env.js';

import { db } from '@/infra/db/db.js';
import { Tx } from '@/infra/db/types.js';

import { Notifier } from '@/external/notify/notifier.js';
import { Recnode, RecordingStatus, isValidRecStatus } from '@/external/recnode/client/recnode.client.js';
import { RecnodeRedis } from '@/external/recnode/redis/recnode.redis.js';

import { PlatformFetcher } from '@/platform/fetcher/fetcher.js';

import { NodeFinder } from '@/node/service/node.finder.js';
import { NodeWriter } from '@/node/service/node.writer.js';
import { NodeDto } from '@/node/spec/node.dto.schema.js';
import { LiveNodeRepository } from '@/node/storage/live-node.repository.js';

import { LiveFinder } from '@/live/data/live.finder.js';
import { LiveWriter } from '@/live/data/live.writer.js';
import { LiveInitializer } from '@/live/register/live.initializer.js';
import { LiveRegistrar } from '@/live/register/live.registrar.js';
import { LiveDto } from '@/live/spec/live.dto.schema.js';

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
    private readonly liveFinder: LiveFinder,
    private readonly liveWriter: LiveWriter,
    private readonly liveInitializer: LiveInitializer,
    private readonly liveRegistrar: LiveRegistrar,
    private readonly liveNodeRepo: LiveNodeRepository,
    private readonly nodeWriter: NodeWriter,
    private readonly nodeFinder: NodeFinder,
    private readonly fetcher: PlatformFetcher,
    private readonly recnode: Recnode,
    private readonly recnodeRedis: RecnodeRedis,
    private readonly notifier: Notifier,
  ) {}

  async checkInvalidLives() {
    const lives = await this.liveFinder.findAllActives();
    const liveIds = lives.map((live) => live.id);
    const states = await this.recnodeRedis.getLiveStates(liveIds, false);
    const ps = [];
    for (const state of states.filter((s) => s !== null)) {
      if (state.isInvalid) {
        const live = lives.find((live) => live.id === state.id);
        if (!live) throw NotFoundError.from('Live', 'id', state.id);
        this.notifier.notify(`Live is invalid: channel=${live.channel.username}, title=${live.liveTitle}`);
        ps.push(this.finishLiveWithRestart(live, 'Delete invalid live', 'error'));
      }
    }
    handleSettled(await Promise.allSettled(ps));
  }

  async checkLives() {
    const ps = [];
    for (const live of await this.retrieveInvalidNodes()) {
      ps.push(this.checkInvalidLive(live));
    }
    handleSettled(await Promise.allSettled(ps));
  }

  private async checkInvalidLive(invalidLive: TargetLive) {
    const live = await this.liveFinder.findById(invalidLive.live.id, { nodes: true }); // latest live dto
    if (!live) {
      log.error(`Live not found`, liveAttr(invalidLive.live));
      return;
    }
    // Skip already finished live
    if (live.isDisableRequested) {
      log.debug('Live is already disabled', liveAttr(live));
      return;
    }
    // Skip invalid live
    if (await this.recnodeRedis.isInvalidLive(live, true)) {
      log.debug('Skip invalid live recovery', liveAttr(live));
      return;
    }

    // Finish if live is restarted
    const chanInfo = await this.fetcher.fetchChannelNotNull(live.platform.name, live.channel.sourceId, true);
    const liveInfo = chanInfo.liveInfo;
    if (!liveInfo) {
      await this.finishLive(live.id, 'Delete uncleaned live', 'warn');
      return;
    }
    if (live.sourceId !== liveInfo.liveUid) {
      await this.liveWriter.update(live.id, { sourceId: liveInfo.liveUid });
      live.sourceId = liveInfo.liveUid; // TODO: danger
      await this.finishLiveWithRestart(live, 'Delete restarted live', 'warn');
      return;
    }

    // Finish if live is fatal
    assert(live.nodes);
    let allFailed = true;
    for (const nodeRecs of await this.recnode.getNodeRecorderStatusList(live.nodes)) {
      const recStatus = nodeRecs.find((status) => status.id === live.id);
      if (recStatus && isValidRecStatus(recStatus)) {
        allFailed = false;
        break;
      }
    }
    if (allFailed) {
      await this.finishLive(live.id, 'Delete fatal live', 'info');
      return;
    }

    // Recovery invalid nodes in live
    const ps = invalidLive.invalidNodes.map((ivNode) => this.checkInvalidNode(live, ivNode.node));
    handleSettled(await Promise.allSettled(ps));
  }

  private finishLive(recordId: string, logMsg: string, logLevel: LogLevel) {
    return this.liveRegistrar.finishLive({ recordId, isPurge: true, exitCmd: 'finish', logMsg, logLevel });
  }

  private async finishLiveWithRestart(live: LiveDto, logMsg: string, logLevel: LogLevel) {
    try {
      const opts = { checkM3u8: true };
      if (live.platform.name === 'soop') {
        // soop doesn't have enough time to check m3u8
        opts.checkM3u8 = false;
      }
      await this.liveInitializer.createNewLiveByLive(live, opts);
    } catch (e) {
      log.error('Failed to reregister same live', { ...liveAttr(live), stack_trace: stacktrace(e) });
    }
    await this.finishLive(live.id, logMsg, logLevel);
  }

  private async checkInvalidNode(tgtLive: LiveDto, invalidNode: NodeDto) {
    const live = await this.liveFinder.findById(tgtLive.id, {}); // latest live dto
    if (!live) {
      log.error(`Live not found`, liveAttr(tgtLive, { node: invalidNode }));
      return;
    }
    // Skip already finished live
    if (live.isDisableRequested) {
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
        await this.nodeWriter.update(node.id, { failureCnt: 0, isCordoned: true }, tx);
        this.notifier.notify(`Node ${node.name} is cordoned due to failure count exceeded threshold`);
      } else {
        await this.nodeWriter.update(node.id, { failureCnt: node.failureCnt + 1 }, tx);
      }
    });
  }

  private async retrieveInvalidNodes(): Promise<TargetLive[]> {
    const nodes: NodeDto[] = await this.nodeFinder.findAll({});
    const nodeRecsMap: Map<string, RecordingStatus[]> = await this.recnode.getNodeRecorderStatusListMap(nodes);

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
        if (recStatus && isValidRecStatus(recStatus)) {
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
