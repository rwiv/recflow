import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseFilters,
} from '@nestjs/common';
import { ChannelWriter } from '../service/channel.writer.js';
import {
  ChannelAppendWithFetch,
  ChannelUpdate,
  channelUpdate,
  channelAppendWithFetch,
  channelPageResult,
  channelSortTypeEnum,
  ChannelSortType,
} from '../spec/channel.dto.schema.js';
import { ChannelFinder } from '../service/channel.finder.js';
import { ChannelUpdater } from '../service/channel.updater.js';
import { notNull } from '../../utils/null.js';
import { HttpErrorFilter } from '../../common/module/error.filter.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { ChannelSearcher } from '../service/channel.searcher.js';
import { PageQuery, pageQuery } from '../../common/data/common.schema.js';

@UseFilters(HttpErrorFilter)
@Controller('/api/channels')
export class ChannelController {
  constructor(
    private readonly chWriter: ChannelWriter,
    private readonly chFinder: ChannelFinder,
    private readonly chSearcher: ChannelSearcher,
    private readonly chUpdater: ChannelUpdater,
  ) {}

  @Get('/')
  async channels(
    @Query('st') st?: string,
    @Query('pri') priority?: string,
    @Query('tn') tagName?: string,
    @Query('pid') pid?: string,
    @Query('uname') username?: string,
    @Query('p', new ParseIntPipe({ optional: true })) page?: number,
    @Query('s', new ParseIntPipe({ optional: true })) size?: number,
    @Query('wt', new ParseBoolPipe({ optional: true })) withTags?: boolean,
  ) {
    if (pid) {
      const channels = await this.chFinder.findByPid(pid, withTags);
      return channelPageResult.parse({ channels, total: 1 });
    }
    if (username) {
      const channels = await this.chFinder.findByUsernameLike(username, withTags);
      return channelPageResult.parse({ channels, total: 1 });
    }

    if (!page || !size) {
      throw new ValidationError('page and size must be provided');
    }
    let sortBy: ChannelSortType = 'updatedAt';
    if (st) {
      sortBy = channelSortTypeEnum.parse(st);
    }
    const pq: PageQuery = { page, size };
    return this.chSearcher.findByQuery(pageQuery.parse(pq), sortBy, priority, tagName, withTags);
  }

  @Post('/')
  createChannel(@Body() req: ChannelAppendWithFetch) {
    return this.chWriter.createWithFetch(channelAppendWithFetch.parse(req));
  }

  @Patch('/priority')
  patchPriority(@Body() req: ChannelUpdate) {
    const update = channelUpdate.parse(req);
    return this.chUpdater.updatePriority(update.id, notNull(update.form.priorityName));
  }

  @Patch('/isFollowed')
  patchFollowed(@Body() req: ChannelUpdate) {
    const update = channelUpdate.parse(req);
    return this.chUpdater.updateFollowed(update.id, notNull(update.form?.isFollowed));
  }

  @Patch('/description')
  patchDescription(@Body() req: ChannelUpdate) {
    const update = channelUpdate.parse(req);
    return this.chUpdater.updateDescription(update.id, update.form.description ?? null);
  }

  @Delete('/:channelId')
  deleteChannel(@Param('channelId') channelId: string) {
    return this.chWriter.delete(channelId);
  }
}
