import { Inject, Injectable } from '@nestjs/common';
import { NOTIFIER, STDL, STDL_REDIS } from '../../infra/infra.tokens.js';
import { LiveFinder } from '../data/live.finder.js';
import { LiveDto } from '../spec/live.dto.schema.js';
import { NodeWriter } from '../../node/service/node.writer.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { LiveRegistrar } from '../register/live.registrar.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { log } from 'jslog';
import { isValidRecStatus, RecordingStatus, Stdl } from '../../infra/stdl/stdl.client.js';
import { NodeFinder } from '../../node/service/node.finder.js';
import { NodeDto } from '../../node/spec/node.dto.schema.js';
import { LiveNodeRepository } from '../../node/storage/live-node.repository.js';
import assert from 'assert';
import { liveAttr } from '../../common/attr/attr.live.js';
import { StdlRedis } from '../../infra/stdl/stdl.redis.js';
import { Notifier } from '../../infra/notify/notifier.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { LogLevel } from '../../utils/log.js';
import { stacktrace } from '../../utils/errors/utils.js';
import { LiveInitializer } from '../register/live.initializer.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';

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
    private readonly liveFinder: LiveFinder,
    private readonly liveInitializer: LiveInitializer,
    private readonly liveRegistrar: LiveRegistrar,
    private readonly liveNodeRepo: LiveNodeRepository,
    private readonly nodeWriter: NodeWriter,
    private readonly nodeFinder: NodeFinder,
    private readonly fetcher: PlatformFetcher,
  ) {}

  async checkInvalidLives() {
    const lives = await this.liveFinder.findAllActives();
    const liveIds = lives.map((live) => live.id);
    const states = await this.stdlRedis.getLiveStates(liveIds, false);
    const ps = [];
    for (const state of states.filter((s) => s !== null)) {
      if (state.isInvalid) {
        const live = lives.find((live) => live.id === state.id);
        if (!live) throw NotFoundError.from('Live', 'id', state.id);
        ps.push(this.finishLiveWithRestart(live, 'Delete invalid live', 'error', { checkM3u8: false }));
      }
    }
    await Promise.allSettled(ps);
  }

  private async finishLiveWithRestart(live: LiveDto, logMsg: string, logLevel: LogLevel, opts: { checkM3u8: boolean }) {
    try {
      return await this.liveInitializer.createNewLiveByLive(live, opts);
    } catch (e) {
      log.error('Failed to reregister same live', { ...liveAttr(live), stack_trace: stacktrace(e) });
    }
    await this.finishLive(live.id, logMsg, logLevel);
  }

  async checkLives() {
    const promises = [];
    for (const live of await this.retrieveInvalidNodes()) {
      promises.push(this.checkInvalidLive(live));
    }
    await Promise.allSettled(promises);
  }

  private async checkInvalidLive(invalidLive: TargetLive) {
    const live = await this.liveFinder.findById(invalidLive.live.id, { nodes: true }); // latest live dto
    if (!live) {
      log.error(`Live not found`, liveAttr(invalidLive.live));
      return;
    }
    // Skip already finished live
    if (live.isDisabled) {
      log.debug('Live is already disabled', liveAttr(live));
      return;
    }
    // Skip invalid live
    if (await this.stdlRedis.isInvalidLive(live, true)) {
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

    // Finish if live is fatal
    assert(live.nodes);
    let allFailed = true;
    for (const nodeRecs of await this.stdl.getNodeRecorderStatusList(live.nodes)) {
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
    await Promise.allSettled(ps);
  }

  private finishLive(recordId: string, logMsg: string, logLevel: LogLevel) {
    return this.liveRegistrar.finishLive({ recordId, isPurge: true, exitCmd: 'finish', logMsg, logLevel });
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
        await this.nodeWriter.update(node.id, { failureCnt: 0, isCordoned: true }, tx);
        this.notifier.notify(`Node ${node.name} is cordoned due to failure count exceeded threshold`);
      } else {
        await this.nodeWriter.update(node.id, { failureCnt: node.failureCnt + 1 }, tx);
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
