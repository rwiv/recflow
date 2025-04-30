import { Injectable } from '@nestjs/common';
import { LiveRegisterRequest, LiveRegistrar } from '../../live/registry/live.registrar.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { channelLiveInfo } from '../../platform/spec/wapper/channel.js';
import { NodeFinder } from './node.finder.js';
import { NodeUpdater } from './node.updater.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import assert from 'assert';

@Injectable()
export class NodeManager {
  constructor(
    private readonly liveRegistrar: LiveRegistrar,
    private readonly nodeFinder: NodeFinder,
    private readonly nodeUpdater: NodeUpdater,
    private readonly fetcher: PlatformFetcher,
  ) {}

  async adjustByNodeGroup(groupName: string, isDrain: boolean) {
    const groups = await this.nodeFinder.findAllGroups();
    const group = groups.find((g) => g.name === groupName);
    if (!group) throw NotFoundError.from('NodeGroup', 'name', groupName);
    const nodes = await this.nodeFinder.findAll({ lives: true });
    for (const node of nodes.filter((n) => n.groupId === group.id)) {
      await this.adjustByNode(node.id, isDrain);
    }
  }

  async adjustByNode(nodeId: string, isDrain: boolean) {
    const node = await this.nodeFinder.findById(nodeId, { lives: true });
    if (!node) throw NotFoundError.from('Node', 'id', nodeId);
    assert(node.lives);
    if (isDrain) {
      await this.nodeUpdater.update(node.id, { isCordoned: true });
    }
    for (const live of node.lives) {
      const channelInfo = await this.fetcher.fetchChannelNotNull(live.platform.name, live.channel.pid, true);
      const req: LiveRegisterRequest = {
        channelInfo: channelLiveInfo.parse(channelInfo),
        live,
        failedNode: node,
      };
      await this.liveRegistrar.register(req);
    }
  }
}
