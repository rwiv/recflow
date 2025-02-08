import { TagCommandRepository } from '../../channel/tag/persistence/tag.persistence.command.js';
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

export function getChannelServices() {
  const pfRepo = new PlatformRepository();
  const priRepo = new ChannelPriorityRepository();
  const tagQuery = new TagQueryRepository();
  const tagCmd = new TagCommandRepository(tagQuery);
  const chQuery = new ChannelQueryRepository();
  const chSearch = new ChannelSearchRepository(tagQuery, priRepo);
  const chCmd = new ChannelCommandRepository(chQuery);

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
  const init = new AppInitializer(pfRepo, priRepo, chWriter);
  return { pfRepo, priRepo, chWriter, chUpdater, chFinder, chSearcher, tagWriter, tagFinder, init };
}
