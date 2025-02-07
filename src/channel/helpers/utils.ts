import { TagCommandRepository } from '../persistence/tag.command.js';
import { ChannelQueryRepository } from '../persistence/channel.query.js';
import { ChannelCommandRepository } from '../persistence/channel.command.js';
import { ChannelValidator } from '../business/channel.validator.js';
import { getFetcher } from '../../live/helpers/utils.js';
import { ChannelWriter } from '../business/channel.writer.js';
import { ChannelFinder } from '../business/channel.finder.js';
import { TagWriter } from '../business/tag.writer.js';
import { TagQueryRepository } from '../persistence/tag.query.js';
import { TagFinder } from '../business/tag.finder.js';
import { ChannelSearchRepository } from '../persistence/channel.search.js';
import { ChannelUpdater } from '../business/channel.updater.js';
import { PlatformRepository } from '../persistence/platform.repository.js';
import { ChannelPriorityRepository } from '../priority/priority.repository.js';
import { ChannelMapper } from '../business/channel.mapper.js';
import { AppInitializer } from '../../common/initializer.js';

export function getChannelServices() {
  const pfRepo = new PlatformRepository();
  const priRepo = new ChannelPriorityRepository();
  const tagQuery = new TagQueryRepository();
  const tagCmd = new TagCommandRepository(tagQuery);
  const chQuery = new ChannelQueryRepository();
  const chSearch = new ChannelSearchRepository(tagQuery, priRepo);
  const chCmd = new ChannelCommandRepository(chQuery);

  const validator = new ChannelValidator(chQuery);
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
    validator,
    chMapper,
    fetcher,
  );
  const chUpdater = new ChannelUpdater(chCmd, priRepo, chMapper);
  const chFinder = new ChannelFinder(chQuery, chSearch, chMapper, tagQuery);
  const init = new AppInitializer(pfRepo, priRepo, chWriter);
  return { pfRepo, priRepo, chWriter, chUpdater, chFinder, tagWriter, tagFinder, init };
}
