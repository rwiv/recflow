import { TagCommandRepository } from '../../channel/persistence/tag.command.js';
import { ChannelQueryRepository } from '../../channel/persistence/channel.query.js';
import { ChannelCommandRepository } from '../../channel/persistence/channel.command.js';
import { getFetcher } from '../../live/helpers/utils.js';
import { ChannelWriter } from '../../channel/business/channel.writer.js';
import { ChannelFinder } from '../../channel/business/channel.finder.js';
import { TagWriter } from '../../channel/business/tag.writer.js';
import { TagQueryRepository } from '../../channel/persistence/tag.query.js';
import { TagFinder } from '../../channel/business/tag.finder.js';
import { ChannelSearchRepository } from '../../channel/persistence/channel.search.js';
import { ChannelUpdater } from '../../channel/business/channel.updater.js';
import { PlatformRepository } from '../../platform/persistence/platform.repository.js';
import { ChannelPriorityRepository } from '../../channel/priority/priority.repository.js';
import { ChannelMapper } from '../../channel/business/channel.mapper.js';
import { AppInitializer } from '../module/initializer.js';
import { ChannelSolver } from '../../channel/business/channel.solver.js';
import { ChannelSearcher } from '../../channel/business/channel.searcher.js';

export function getChannelServices() {
  const pfRepo = new PlatformRepository();
  const priRepo = new ChannelPriorityRepository();
  const tagQuery = new TagQueryRepository();
  const tagCmd = new TagCommandRepository(tagQuery);
  const chQuery = new ChannelQueryRepository();
  const chSearch = new ChannelSearchRepository(tagQuery, priRepo);
  const chCmd = new ChannelCommandRepository(chQuery);

  const chMapper = new ChannelMapper(pfRepo, priRepo);
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
  const chSolver = new ChannelSolver(tagQuery);
  const chUpdater = new ChannelUpdater(chCmd, priRepo, chMapper);
  const chFinder = new ChannelFinder(chQuery, chMapper, tagQuery, chSolver);
  const chSearcher = new ChannelSearcher(chSearch, chMapper, chSolver);
  const init = new AppInitializer(pfRepo, priRepo, chWriter);
  return { pfRepo, priRepo, chWriter, chUpdater, chFinder, chSearcher, tagWriter, tagFinder, init };
}
