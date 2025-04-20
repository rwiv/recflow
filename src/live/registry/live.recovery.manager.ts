import { Inject, Injectable } from '@nestjs/common';
import { STDL } from '../../infra/infra.tokens.js';
import { LiveFinder } from '../access/live.finder.js';
import { LiveDto } from '../spec/live.dto.schema.js';
import { NodeUpdater } from '../../node/service/node.updater.js';
import { MissingValueError } from '../../utils/errors/errors/MissingValueError.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { LiveRegistrar } from './live.registrar.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { LiveWriter } from '../access/live.writer.js';
import { log } from 'jslog';
import { channelLiveInfo } from '../../platform/spec/wapper/channel.js';
import { NodeStatus, Stdl } from '../../infra/stdl/types.js';
import { NodeFinder } from '../../node/service/node.finder.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { NodeDto } from '../../node/spec/node.dto.schema.js';
import assert from 'assert';

@Injectable()
export class LiveRecoveryManager {
  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(STDL) private readonly stdl: Stdl,
    private readonly liveFinder: LiveFinder,
    private readonly liveWriter: LiveWriter,
    private readonly liveRegistrar: LiveRegistrar,
    private readonly nodeUpdater: NodeUpdater,
    private readonly nodeFinder: NodeFinder,
    private readonly fetcher: PlatformFetcher,
  ) {}

  async check(tx: Tx = db) {
    for (const invalidLive of await this.findInvalidLives()) {
      await this.checkOne(invalidLive, tx);
    }
  }

  private async checkOne(live: LiveDto, tx: Tx = db) {
    if (!live.nodeId) {
      throw new MissingValueError(`Live with no node assigned: ${live.id}`);
    }

    const chanInfo = await this.fetcher.fetchChannelWithCheckStream(live.platform.name, live.channel.pid);
    if (!chanInfo.liveInfo) {
      return tx.transaction(async (txx) => {
        const queried = await this.liveFinder.findById(live.id, { forUpdate: true }, txx);
        if (!queried) return;
        await this.liveWriter.delete(queried.id, txx);
        log.info(`Delete uncleaned live`, this.getLiveAttrs(queried));
      });
    }

    await tx.transaction(async (txx) => {
      const queried = await this.liveFinder.findById(live.id, { forUpdate: true, withNode: true }, txx);
      if (!queried) return;

      const node = queried.node;
      if (!node) {
        throw new MissingValueError(`live.node is missing: ${live.nodeId}`);
      }

      if (node.failureCnt >= this.env.nodeFailureThreshold) {
        await this.nodeUpdater.update(node.id, { failureCnt: 0, isCordoned: true }, txx);
      } else {
        await this.nodeUpdater.update(node.id, { failureCnt: node.failureCnt + 1 }, txx);
      }

      await this.liveWriter.delete(queried.id, txx);
      log.info(`Recovery live`, this.getLiveAttrs(queried));
      await this.liveRegistrar.add(channelLiveInfo.parse(chanInfo), undefined, [node.id], txx);
    });
  }

  private getLiveAttrs(live: LiveDto) {
    return {
      platform: live.platform.name,
      channel: live.channel.username,
      node: live.node?.name,
    };
  }

  private async findInvalidLives() {
    const nodes: NodeDto[] = await this.nodeFinder.findAll();
    const promises: Promise<NodeStatus[]>[] = [];
    for (const node of nodes) {
      promises.push(this.stdl.getStatus(node.endpoint));
    }
    const nodeStatusList: NodeStatus[][] = await Promise.all(promises);
    if (nodeStatusList.length !== nodes.length) {
      throw new ValidationError('Node status list length mismatch');
    }
    const nodeStatusMap = new Map<string, NodeStatus[]>();
    for (let i = 0; i < nodeStatusList.length; i++) {
      nodeStatusMap.set(nodes[i].id, nodeStatusList[i]);
    }

    const invalidLives: LiveDto[] = [];
    const lives = await this.liveFinder.findAllActives({ withNode: true });
    for (const live of lives) {
      assert(live.node);
      const targetStatus = nodeStatusMap.get(live.node.id);
      assert(targetStatus);

      const searched = targetStatus.find((status) => {
        return status.platform === live.platform.name && status.channelId === live.channel.pid;
      });
      if (searched && ['recording', 'done'].includes(searched.status)) {
        continue;
      }
      invalidLives.push(live);
      if (searched) {
        this.stdl.cancel(live.node.endpoint, searched.platform, searched.channelId);
        log.debug(`Cancel live`, {
          node: live.node.name,
          platform: searched.platform,
          channelId: searched.channelId,
        });
      }
    }
    const threshold = new Date(Date.now() - this.env.liveRecoveryWaitTimeMs);
    return invalidLives.filter((live) => live.createdAt < threshold);
  }
}
