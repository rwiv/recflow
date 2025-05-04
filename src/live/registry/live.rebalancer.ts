import { Inject, Injectable } from '@nestjs/common';
import { LiveRegistrar } from './live.registrar.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { channelLiveInfo } from '../../platform/spec/wapper/channel.js';
import { NodeFinder } from '../../node/service/node.finder.js';
import { NodeUpdater } from '../../node/service/node.updater.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import assert from 'assert';
import { NodeGroupService } from '../../node/service/node-group.service.js';
import { Stdl } from '../../infra/stdl/stdl.client.js';
import { STDL } from '../../infra/infra.tokens.js';
import { log } from 'jslog';
import { liveNodeAttr } from '../../common/attr/attr.live.js';
import { NodeDto } from '../../node/spec/node.dto.schema.js';
import { LiveDto } from '../spec/live.dto.schema.js';
import { z } from 'zod';
import { uuid } from '../../common/data/common.schema.js';
import { stacktrace } from '../../utils/errors/utils.js';

export const nodeGroupAdjustRequest = z.object({
  groupId: uuid,
  isDrain: z.boolean(),
});
export type NodeGroupAdjustRequest = z.infer<typeof nodeGroupAdjustRequest>;

export const nodeAdjustRequest = z.object({
  nodeId: uuid,
  isDrain: z.boolean(),
});
export type NodeAdjustRequest = z.infer<typeof nodeAdjustRequest>;

const RECORDING_CLOSE_WAIT_TIMEOUT_MS = 60 * 1000; // 1 min

@Injectable()
export class LiveRebalancer {
  constructor(
    private readonly liveRegistrar: LiveRegistrar,
    private readonly nodeFinder: NodeFinder,
    private readonly nodeGroupService: NodeGroupService,
    private readonly nodeUpdater: NodeUpdater,
    private readonly fetcher: PlatformFetcher,
    @Inject(STDL) private readonly stdl: Stdl,
  ) {}

  async adjustByNodeGroup(req: NodeGroupAdjustRequest) {
    const { groupId, isDrain } = req;
    const groups = await this.nodeGroupService.findAll();
    const group = groups.find((g) => g.id === groupId);
    if (!group) throw NotFoundError.from('NodeGroup', 'name', groupId);
    const ignoreGroupIds = [];
    if (isDrain) {
      ignoreGroupIds.push(group.id);
    }

    const targets = await this.nodeFinder.findByGroupId(group.id, {});
    if (targets.length === 0) {
      log.debug(`No nodes to adjust`, { groupId, groupName: group.name });
      return;
    }

    const promises = [];
    for (const node of targets) {
      promises.push(this.adjustByNode({ nodeId: node.id, isDrain }, ignoreGroupIds));
    }
    await Promise.all(promises);
    log.info(`Node group adjust completed`, { groupId, groupName: group.name });
  }

  async adjustByNode(req: NodeAdjustRequest, ignoreGroupIds: string[]) {
    const { nodeId, isDrain } = req;
    const node = await this.nodeFinder.findById(nodeId, { lives: true });
    if (!node) {
      log.error(`Node not found`, { nodeId });
      return;
    }

    try {
      if (isDrain) {
        await this.nodeUpdater.update(node.id, { isCordoned: true });
      }

      assert(node.lives);
      if (node.lives.length === 0) {
        log.debug(`No lives to adjust`, { nodeId });
        return;
      }

      const promises = node.lives.map((live) => this.adjustByLive(live, node, ignoreGroupIds));
      await Promise.all(promises);
      log.info(`Node adjust completed`, { groupId: node.groupId, nodeId, nodeName: node.name });
    } catch (e) {
      log.error(`Failed to adjusting live`, { nodeId, stacktrace: stacktrace(e) });
    }
  }

  async adjustByLive(live: LiveDto, node: NodeDto, ignoreGroupIds: string[]) {
    try {
      const channelInfo = await this.fetcher.fetchChannelNotNull(live.platform.name, live.channel.pid, true);
      await this.liveRegistrar.register({
        channelInfo: channelLiveInfo.parse(channelInfo),
        reusableLive: live,
        ignoreGroupIds,
      });
      await this.waitForRecording(live, node);

      await this.liveRegistrar.deregister(live, node);
      await this.waitForCanceled(live, node);

      log.debug(`Live adjust completed`, liveNodeAttr(live, node));
    } catch (e) {
      log.error(`Failed to adjusting live`, { ...liveNodeAttr(live, node), stacktrace: stacktrace(e) });
    }
  }

  private async waitForRecording(live: LiveDto, node: NodeDto) {
    return this.waitForRecorder(live, node, true);
  }

  private async waitForCanceled(live: LiveDto, node: NodeDto) {
    return this.waitForRecorder(live, node, false);
  }

  private async waitForRecorder(live: LiveDto, node: NodeDto, exists: boolean) {
    const startTime = Date.now();
    while (true) {
      if (Date.now() - startTime > RECORDING_CLOSE_WAIT_TIMEOUT_MS) {
        log.error(`Timeout while waiting for recording to finish`, liveNodeAttr(live));
        return;
      }
      const status = await this.stdl.findStatus(node.endpoint, live.id);
      if (exists && status) {
        return;
      }
      if (!exists && !status) {
        return;
      }
    }
  }
}
