import { TagCommandRepository } from '../../channel/tag/persistence/tag.command.js';
import { ChannelQueryRepository } from '../../channel/channel/persistence/channel.query.js';
import { ChannelCommandRepository } from '../../channel/channel/persistence/channel.command.js';
import { getFetcher } from './platform.deps.js';
import { ChannelWriter } from '../../channel/channel/business/channel.writer.js';
import { ChannelFinder } from '../../channel/channel/business/channel.finder.js';
import { TagWriter } from '../../channel/tag/business/tag.writer.js';
import { TagQueryRepository } from '../../channel/tag/persistence/tag.query.js';
import { TagFinder } from '../../channel/tag/business/tag.finder.js';
import { ChannelSearchRepository } from '../../channel/channel/persistence/channel.search.js';
import { ChannelUpdater } from '../../channel/channel/business/channel.updater.js';
import { PlatformRepository } from '../../platform/persistence/platform.repository.js';
import { ChannelPriorityRepository } from '../../channel/priority/priority.repository.js';
import { ChannelMapper } from '../../channel/channel/business/channel.mapper.js';
import { AppInitializer } from '../module/initializer.js';
import { ChannelSearcher } from '../../channel/channel/business/channel.searcher.js';
import { NodeTypeRepository } from '../../node/persistence/node-type.repository.js';
import { NodeRepository } from '../../node/persistence/node.repository.js';
import { NodeGroupRepository } from '../../node/persistence/node-group.repository.js';
import { NodeStateRepository } from '../../node/persistence/node-state.repository.js';
import { NodeWriter } from '../../node/business/node.writer.js';
import { NodeMapper } from '../../node/business/node.mapper.js';
import { NodeFinder } from '../../node/business/node.finder.js';
import { NodeUpdater } from '../../node/business/node.updater.js';

export function getChannelServices() {
  const pfRepo = new PlatformRepository();
  const priRepo = new ChannelPriorityRepository();
  const tagQuery = new TagQueryRepository();
  const tagCmd = new TagCommandRepository(tagQuery);
  const chQuery = new ChannelQueryRepository();
  const chSearch = new ChannelSearchRepository(tagQuery, priRepo);
  const chCmd = new ChannelCommandRepository(chQuery);

  const nodeRepo = new NodeRepository();
  const ngRepo = new NodeGroupRepository();
  const nsRepo = new NodeStateRepository();
  const ntRepo = new NodeTypeRepository();
  const nodeMapper = new NodeMapper(ngRepo, ntRepo, nsRepo);
  const nodeWriter = new NodeWriter(nodeRepo, ntRepo, nsRepo, pfRepo, nodeMapper);
  const nodeFinder = new NodeFinder(nodeRepo, nodeMapper);
  const nodeUpdater = new NodeUpdater(nsRepo, pfRepo, nodeFinder);

  const chMapper = new ChannelMapper(pfRepo, priRepo, tagQuery);
  const fetcher = getFetcher();
  const tagWriter = new TagWriter(tagCmd, tagQuery, chQuery);
  const tagFinder = new TagFinder(tagQuery);
  const chWriter = new ChannelWriter(
    chCmd,
    chQuery,
    pfRepo,
    priRepo,
    tagWriter,
    tagQuery,
    chMapper,
    fetcher,
  );
  const chUpdater = new ChannelUpdater(chCmd, priRepo, chMapper);
  const chFinder = new ChannelFinder(chQuery, chMapper, tagQuery);
  const chSearcher = new ChannelSearcher(chSearch, chMapper);

  const init = new AppInitializer(pfRepo, priRepo, chWriter, ntRepo, ngRepo);
  return {
    init,
    pfRepo,
    priRepo,
    ngRepo,
    chWriter,
    chUpdater,
    chFinder,
    chSearcher,
    tagWriter,
    tagFinder,
    nodeWriter,
    nodeFinder,
    nodeUpdater,
  };
}
