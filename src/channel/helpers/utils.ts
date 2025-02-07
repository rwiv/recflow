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

export function getChannelServices() {
  const pfRepo = new PlatformRepository();
  const cpRepo = new ChannelPriorityRepository();
  const tagQuery = new TagQueryRepository();
  const tagCmd = new TagCommandRepository(tagQuery);
  const chQuery = new ChannelQueryRepository();
  const chSearch = new ChannelSearchRepository(tagQuery, cpRepo);
  const chCmd = new ChannelCommandRepository(chQuery);

  const validator = new ChannelValidator(chQuery);
  const chMapper = new ChannelMapper(pfRepo, cpRepo);
  const fetcher = getFetcher();
  const tagWriter = new TagWriter(tagCmd, tagQuery, chQuery);
  const tagFinder = new TagFinder(tagQuery);
  const chWriter = new ChannelWriter(
    chCmd,
    chQuery,
    pfRepo,
    cpRepo,
    tagWriter,
    tagQuery,
    validator,
    chMapper,
    fetcher,
  );
  const chUpdater = new ChannelUpdater(chCmd, chMapper, validator);
  const chFinder = new ChannelFinder(chQuery, chSearch, chMapper, tagQuery);
  return { pfRepo, cpRepo, chWriter, chUpdater, chFinder, tagWriter, tagFinder };
}
