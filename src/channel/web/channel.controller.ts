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
  channelSortArg,
  channelUpdate,
  channelAppendWithFetch,
  PageQuery,
  pageQuery,
} from '../business/channel.schema.js';
import { ChannelFinder } from '../business/channel.finder.js';
import { ChannelUpdater } from '../business/channel.updater.js';
import { assertNotNull } from '../../utils/null.js';
import { HttpErrorFilter } from '../../common/error.filter.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';

@UseFilters(HttpErrorFilter)
@Controller('/api/channels')
export class ChannelController {
  constructor(
    private readonly chWriter: ChannelWriter,
    private readonly chFinder: ChannelFinder,
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
    return this.chFinder.findByQuery(
      pageQuery.parse(pq),
      channelSortArg.parse(sorted),
      priority,
      tagName,
      withTags,
    );
  }

  @Post('/')
  createChannel(@Body() req: ChannelAppendWithFetch) {
    return this.chWriter.createWithFetch(channelAppendWithFetch.parse(req));
  }

  @Patch('/priority')
  patchPriority(@Body() req: ChannelUpdate) {
    req = channelUpdate.parse(req);
    return this.chUpdater.updatePriority(req.id, assertNotNull(req.form.priorityName));
  }

  @Patch('/followed')
  patchFollowed(@Body() req: ChannelUpdate) {
    req = channelUpdate.parse(req);
    return this.chUpdater.updateFollowed(req.id, assertNotNull(req.form?.followed));
  }

  @Patch('/description')
  patchDescription(@Body() req: ChannelUpdate) {
    req = channelUpdate.parse(req);
    return this.chUpdater.updateDescription(req.id, assertNotNull(req.form?.description));
  }

  @Delete('/:channelId')
  deleteChannel(@Param('channelId') channelId: string) {
    return this.chWriter.delete(channelId);
  }
}
