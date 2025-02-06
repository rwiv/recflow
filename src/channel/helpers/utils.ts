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

export function getChannelServies() {
  const tagQuery = new TagQueryRepository();
  const tagCmd = new TagCommandRepository(tagQuery);
  const chanQuery = new ChannelQueryRepository();
  const chanSearch = new ChannelSearchRepository(tagQuery);
  const chanCmd = new ChannelCommandRepository(chanQuery);
  const validator = new ChannelValidator(chanQuery);
  const fetcher = getFetcher();
  const tagWriter = new TagWriter(tagCmd, tagQuery, chanQuery);
  const tagFinder = new TagFinder(tagQuery);
  const chanWriter = new ChannelWriter(chanCmd, chanQuery, tagWriter, tagQuery, validator, fetcher);
  const chanUpdater = new ChannelUpdater(chanCmd, validator);
  const chanFinder = new ChannelFinder(chanQuery, chanSearch, tagQuery);
  return { chanWriter, chanUpdater, chanFinder, tagWriter, tagFinder };
}
