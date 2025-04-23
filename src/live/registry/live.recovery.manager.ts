import { Inject, Injectable } from '@nestjs/common';
import { STDL } from '../../infra/infra.tokens.js';
import { LiveFinder } from '../access/live.finder.js';
import { LiveDto } from '../spec/live.dto.schema.js';
import { NodeUpdater } from '../../node/service/node.updater.js';
import { Tx } from '../../infra/db/types.js';
import { db } from '../../infra/db/db.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { LiveRegisterRequest, LiveRegistrar } from './live.registrar.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { LiveWriter } from '../access/live.writer.js';
import { log } from 'jslog';
import { channelLiveInfo } from '../../platform/spec/wapper/channel.js';
import { NodeRecorderStatus, Stdl } from '../../infra/stdl/stdl.client.js';
import { NodeFinder } from '../../node/service/node.finder.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { NodeDto } from '../../node/spec/node.dto.schema.js';
import assert from 'assert';

interface LiveNodePair {
  live: LiveDto;
  node: NodeDto;
}

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
    for (const invalidPair of await this.retrieveAndCancelInvalidPairs()) {
      await this.checkOne(invalidPair, tx);
    }
  }

  private async checkOne(pair: LiveNodePair, tx: Tx = db) {
    const live = pair.live;
    const node = pair.node;

    const chanInfo = await this.fetcher.fetchChannelWithCheckStream(live.platform.name, live.channel.pid);
    if (!chanInfo.liveInfo) {
      return tx.transaction(async (txx) => {
        const queried = await this.liveFinder.findById(live.id, { forUpdate: true }, txx);
        if (!queried) return;
        await this.liveWriter.delete(queried.id, txx);
        log.info(`Delete uncleaned live`, this.getLiveAttrs(queried, node));
      });
    }
    // else
    await tx.transaction(async (txx) => {
      const queried = await this.liveFinder.findById(live.id, { forUpdate: true }, txx);
      if (!queried) return;

      if (node.failureCnt >= this.env.nodeFailureThreshold) {
        await this.nodeUpdater.update(node.id, { failureCnt: 0, isCordoned: true }, txx);
      } else {
        await this.nodeUpdater.update(node.id, { failureCnt: node.failureCnt + 1 }, txx);
      }

      await this.liveWriter.delete(queried.id, txx);
      log.info(`Recovery live`, this.getLiveAttrs(queried, node));
      const req: LiveRegisterRequest = {
        channelInfo: channelLiveInfo.parse(chanInfo),
        ignoreNodeIds: [node.id],
        live: queried,
      };
      await this.liveRegistrar.register(req, txx);
    });
  }

  private getLiveAttrs(live: LiveDto, node: NodeDto) {
    return {
      platform: live.platform.name,
      channel: live.channel.username,
      node: node.name,
    };
  }

  private async retrieveAndCancelInvalidPairs(): Promise<LiveNodePair[]> {
    const nodes: NodeDto[] = await this.nodeFinder.findAll({});
    const promises: Promise<NodeRecorderStatus[]>[] = [];
    for (const node of nodes) {
      promises.push(this.stdl.getStatus(node.endpoint));
    }
    const nodeStatusList: NodeRecorderStatus[][] = await Promise.all(promises);
    if (nodeStatusList.length !== nodes.length) {
      throw new ValidationError('Node status list length mismatch');
    }
    const nodeStatusMap = new Map<string, NodeRecorderStatus[]>();
    for (let i = 0; i < nodeStatusList.length; i++) {
      nodeStatusMap.set(nodes[i].id, nodeStatusList[i]);
    }

    const stdlCancelPromises: Promise<void>[] = [];
    const invalidPairs: LiveNodePair[] = [];
    const lives = await this.liveFinder.findAllActives({ nodes: true });
    for (const live of lives) {
      assert(live.nodes);
      for (const node of live.nodes) {
        const targetStatus = nodeStatusMap.get(node.id);
        assert(targetStatus);

        const searched = targetStatus.find((status) => {
          return status.platform === live.platform.name && status.channelId === live.channel.pid;
        });
        if (searched && ['recording', 'done'].includes(searched.status)) {
          continue;
        }
        invalidPairs.push({ live, node });
        if (searched) {
          stdlCancelPromises.push(this.stdl.cancel(node.endpoint, searched.platform, searched.channelId));
          log.debug(`Cancel liveNode`, {
            platform: searched.platform,
            channelId: searched.channelId,
            node: node.name,
          });
        }
      }
    }
    await Promise.all(stdlCancelPromises);
    const threshold = new Date(Date.now() - this.env.liveRecoveryWaitTimeMs);
    return invalidPairs.filter((pair) => pair.live.createdAt < threshold);
  }
}
