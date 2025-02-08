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
import { ChannelWriter } from '../business/channel.writer.js';
import {
  ChannelAppendWithFetch,
  ChannelUpdate,
  chSortArg,
  chUpdate,
  chAppendWithFetch,
  PageQuery,
  pageQuery,
} from '../business/channel.schema.js';
import { ChannelFinder } from '../business/channel.finder.js';
import { ChannelUpdater } from '../business/channel.updater.js';
import { notNull } from '../../utils/null.js';
import { HttpErrorFilter } from '../../common/error.filter.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { ChannelSearcher } from '../business/channel.searcher.js';

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
  channels(
    @Query('st') sorted?: string,
    @Query('pri') priority?: string,
    @Query('tn') tagName?: string,
    @Query('pid') pid?: string,
    @Query('uname') username?: string,
    @Query('p', new ParseIntPipe({ optional: true })) page?: number,
    @Query('s', new ParseIntPipe({ optional: true })) size?: number,
    @Query('wt', new ParseBoolPipe({ optional: true })) withTags?: boolean,
  ) {
    if (pid) {
      return this.chFinder.findByPid(pid, withTags);
    }
    if (username) {
      return this.chFinder.findByUsername(username, withTags);
    }

    if (!page || !size) {
      throw new ValidationError('page and size must be provided');
    }
    const pq: PageQuery = { page, size };
    return this.chSearcher.findByQuery(
      pageQuery.parse(pq),
      chSortArg.parse(sorted),
      priority,
      tagName,
      withTags,
    );
  }

  @Post('/')
  createChannel(@Body() req: ChannelAppendWithFetch) {
    return this.chWriter.createWithFetch(chAppendWithFetch.parse(req));
  }

  @Patch('/priority')
  patchPriority(@Body() req: ChannelUpdate) {
    const update = chUpdate.parse(req);
    return this.chUpdater.updatePriority(update.id, notNull(update.form.priorityName));
  }

  @Patch('/followed')
  patchFollowed(@Body() req: ChannelUpdate) {
    const update = chUpdate.parse(req);
    return this.chUpdater.updateFollowed(update.id, notNull(update.form?.followed));
  }

  @Patch('/description')
  patchDescription(@Body() req: ChannelUpdate) {
    const update = chUpdate.parse(req);
    return this.chUpdater.updateDescription(update.id, notNull(update.form?.description));
  }

  @Delete('/:channelId')
  deleteChannel(@Param('channelId') channelId: string) {
    return this.chWriter.delete(channelId);
  }
}
