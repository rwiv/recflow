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
  Put,
  Query,
} from '@nestjs/common';
import { ChannelWriter } from '../business/channel.writer.js';
import { TagWriter } from '../business/tag.writer.js';
import { ChannelPriority } from '../persistence/channel.types.js';
import {
  ChannelSortType,
  TagEntAttachment,
  TagEntDetachment,
  TagEntUpdate,
} from '../persistence/tag.types.js';
import { ChannelCreation, ChannelUpdate } from '../business/channel.types.js';
import { ChannelFinder } from '../business/channel.finder.js';
import { TagFinder } from '../business/tag.finder.js';

@Controller('/api/channels')
export class ChannelController {
  constructor(
    private readonly chanWriter: ChannelWriter,
    private readonly chanFinder: ChannelFinder,
    private readonly tagWriter: TagWriter,
    private readonly tagFinder: TagFinder,
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
    if (sorted && !['latest', 'followerCnt'].includes(sorted)) {
      throw new Error('Invalid sorted value');
    }
    if (priority && !['must', 'should', 'may', 'review', 'skip', 'none'].includes(priority)) {
      throw new Error('Invalid priority value');
    }
    return this.chanFinder.findByQuery(
      page,
      size,
      sorted as ChannelSortType,
      priority as ChannelPriority,
      tagName,
      withTags,
    );
  }

  @Post('/')
  createChannel(@Body() req: ChannelCreation) {
    return this.chanWriter.createWithFetch(req);
  }

  @Put('/')
  updateChannel(@Body() req: ChannelUpdate) {
    return this.chanWriter.update(req);
  }

  @Delete('/{channelId}')
  deleteChannel(@Param('channelId') channelId: string) {
    return this.chanWriter.delete(channelId);
  }

  @Put('/tags')
  updateTag(@Body() req: TagEntUpdate) {
    return this.tagWriter.update(req);
  }

  @Patch('/tags/attach')
  attachTag(@Body() req: TagEntAttachment) {
    return this.tagWriter.attach(req);
  }

  @Patch('/tags/detach')
  detachTag(@Body() req: TagEntDetachment) {
    return this.tagWriter.detach(req);
  }

  @Get('/tags')
  tags() {
    return this.tagFinder.findAll();
  }
}
