import { TagCommandRepository } from '../persistence/tag.command.repository.js';
import { ChannelQueryRepository } from '../persistence/channel.query.repository.js';
import { ChannelCommandRepository } from '../persistence/channel.command.repository.js';
import { ChannelValidator } from '../business/channel.validator.js';
import { getFetcher } from '../../live/helpers/utils.js';
import { ChannelCommander } from '../business/channel.commander.js';
import { ChannelFinder } from '../business/channel.finder.js';
import { TagService } from '../business/tag.service.js';
import { TagQueryRepository } from '../persistence/tag.query.repository.js';

export function getServies() {
  const tagQueryRepo = new TagQueryRepository();
  const tagCmdRepo = new TagCommandRepository(tagQueryRepo);
  const chanQueryRepo = new ChannelQueryRepository(tagQueryRepo);
  const chanCmdRepo = new ChannelCommandRepository(tagCmdRepo, tagQueryRepo, chanQueryRepo);
  const validator = new ChannelValidator();
  const fetcher = getFetcher();
  const chanFinder = new ChannelFinder(chanQueryRepo, tagQueryRepo);
  const chanCommander = new ChannelCommander(chanCmdRepo, tagCmdRepo, validator, fetcher);
  const tagService = new TagService(tagCmdRepo, tagQueryRepo);
  return { chanFinder, chanCommander, tagService };
}
