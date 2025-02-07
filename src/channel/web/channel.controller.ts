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
import { ChannelCreationWithFetch, ChannelDefUpdate } from '../business/channel.types.js';
import { ChannelFinder } from '../business/channel.finder.js';
import { ChannelUpdater } from '../business/channel.updater.js';
import { CHANNEL_SORTED_TYPES } from '../../common/enum.consts.js';
import { assertNotNull } from '../../utils/null.js';
import { checkEnum } from '../../utils/union.js';
import { HttpErrorFilter } from '../../common/error.filter.js';
import { CHANNEL_PRIORITIES } from '../priority/consts.js';

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
      throw new Error('page and size must be provided');
    }
    return this.chFinder.findByQuery(
      page,
      size,
      checkEnum(sorted, CHANNEL_SORTED_TYPES),
      checkEnum(priority, CHANNEL_PRIORITIES),
      tagName,
      withTags,
    );
  }

  @Post('/')
  createChannel(@Body() req: ChannelCreationWithFetch) {
    return this.chWriter.createWithFetch(req);
  }

  @Patch('/priority')
  patchPriority(@Body() req: ChannelDefUpdate) {
    const priority = assertNotNull(checkEnum(req.form.priority, CHANNEL_PRIORITIES));
    return this.chUpdater.updatePriority(req.id, priority);
  }

  @Patch('/followed')
  patchFollowed(@Body() req: ChannelDefUpdate) {
    return this.chUpdater.updateFollowed(req.id, assertNotNull(req.form?.followed));
  }

  @Patch('/description')
  patchDescription(@Body() req: ChannelDefUpdate) {
    return this.chUpdater.updateDescription(req.id, assertNotNull(req.form?.description));
  }

  @Delete('/:channelId')
  deleteChannel(@Param('channelId') channelId: string) {
    return this.chWriter.delete(channelId);
  }
}
