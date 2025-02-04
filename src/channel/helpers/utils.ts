import { TagCommandRepository } from '../persistence/tag.command.repository.js';
import { ChannelQueryRepository } from '../persistence/channel.query.repository.js';
import { ChannelCommandRepository } from '../persistence/channel.command.repository.js';
import { ChannelValidator } from '../business/channel.validator.js';
import { getFetcher } from '../../live/helpers/utils.js';
import { ChannelWriter } from '../business/channel.writer.js';
import { ChannelFinder } from '../business/channel.finder.js';
import { TagWriter } from '../business/tag.writer.js';
import { TagQueryRepository } from '../persistence/tag.query.repository.js';
import { TagFinder } from '../business/tag.finder.js';

export function getChannelServies() {
  const tagQuery = new TagQueryRepository();
  const tagCmd = new TagCommandRepository(tagQuery);
  const chanQuery = new ChannelQueryRepository(tagQuery);
  const chanCmd = new ChannelCommandRepository(chanQuery);
  const validator = new ChannelValidator();
  const fetcher = getFetcher();
  const tagWriter = new TagWriter(tagCmd, tagQuery);
  const tagFinder = new TagFinder(tagQuery);
  const chanWriter = new ChannelWriter(chanCmd, chanQuery, tagWriter, tagQuery, validator, fetcher);
  const chanFinder = new ChannelFinder(chanQuery, tagQuery);
  return { chanFinder, chanWriter, tagWriter, tagFinder };
}
