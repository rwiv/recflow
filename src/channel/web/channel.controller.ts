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
} from '@nestjs/common';
import { ChannelWriter } from '../business/channel.writer.js';
import { ChannelCreation, ChannelDefUpdate } from '../business/channel.types.js';
import { ChannelFinder } from '../business/channel.finder.js';
import { ChannelUpdater } from '../business/channel.updater.js';
import { CHANNEL_PRIORITIES, CHANNEL_SORTED_TYPES } from '../../common/enums.js';
import { assertNotNull } from '../../utils/null.js';
import { checkType } from '../../utils/union.js';

@Controller('/api/channels')
export class ChannelController {
  constructor(
    private readonly chanWriter: ChannelWriter,
    private readonly chanFinder: ChannelFinder,
    private readonly chanUpdater: ChannelUpdater,
  ) {}

  @Get('/')
  channels(
    @Query('p', ParseIntPipe) page: number,
    @Query('s', ParseIntPipe) size: number,
    @Query('st') sorted?: string,
    @Query('pri') priority?: string,
    @Query('tn') tagName?: string,
    @Query('wt', new ParseBoolPipe({ optional: true })) withTags?: boolean,
  ) {
    if (!page || !size) {
      throw new Error('page and size must be provided');
    }
    return this.chanFinder.findByQuery(
      page,
      size,
      checkType(sorted, CHANNEL_SORTED_TYPES),
      checkType(priority, CHANNEL_PRIORITIES),
      tagName,
      withTags,
    );
  }

  @Post('/')
  createChannel(@Body() req: ChannelCreation) {
    return this.chanWriter.createWithFetch(req);
  }

  @Patch('/priority')
  patchPriority(@Body() req: ChannelDefUpdate) {
    const priority = assertNotNull(checkType(req.form.priority, CHANNEL_PRIORITIES));
    return this.chanUpdater.updatePriority(req.id, priority);
  }

  @Patch('/followed')
  patchFollowed(@Body() req: ChannelDefUpdate) {
    return this.chanUpdater.updateFollowed(req.id, assertNotNull(req.form?.followed));
  }

  @Patch('/description')
  patchDescription(@Body() req: ChannelDefUpdate) {
    return this.chanUpdater.updateDescription(req.id, assertNotNull(req.form?.description));
  }

  @Delete('/:channelId')
  deleteChannel(@Param('channelId') channelId: string) {
    return this.chanWriter.delete(channelId);
  }
}
