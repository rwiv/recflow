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
import { ChannelService } from '../business/channel.service.js';
import { TagService } from '../business/tag.service.js';
import { ChannelPriority } from '../persistence/channel.types.js';
import {
  ChannelSortType,
  TagAttachment,
  TagDetachment,
  TagUpdate,
} from '../persistence/tag.types.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { ChannelCreationReq, ChannelUpdateReq } from './channel.controller.types.js';

@Controller('/api/channels')
export class ChannelController {
  constructor(
    private readonly channelService: ChannelService,
    private readonly tagService: TagService,
    private readonly fetcher: PlatformFetcher,
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
    return this.channelService.findByQuery(
      page,
      size,
      sorted as ChannelSortType,
      priority as ChannelPriority,
      tagName,
      withTags,
    );
  }

  @Post('/')
  createChannel(@Body() req: ChannelCreationReq) {
    return this.channelService.create(req.creation, req.tagNames);
  }

  @Put('/')
  updateChannel(@Body() req: ChannelUpdateReq) {
    return this.channelService.update(req.update, req.tagNames);
  }

  @Delete('/{channelId}')
  deleteChannel(@Param('channelId') channelId: string) {
    return this.channelService.delete(channelId);
  }

  @Put('/tags')
  updateTag(@Body() req: TagUpdate) {
    return this.tagService.update(req);
  }

  @Patch('/tags/attach')
  attachTag(@Body() req: TagAttachment) {
    return this.tagService.attach(req);
  }

  @Patch('/tags/detach')
  detachTag(@Body() req: TagDetachment) {
    return this.tagService.detach(req);
  }

  @Get('/tags')
  tags() {
    return this.tagService.findAll();
  }

  @Get('/fetch/chzzk/{channelId}')
  fetchChzzk(@Param('channelId') channelId: string) {
    return this.fetcher.fetchChannel('chzzk', channelId, false);
  }

  @Get('/fetch/soop/{channelId}')
  fetchSoop(@Param('channelId') channelId: string) {
    return this.fetcher.fetchChannel('soop', channelId, false);
  }
}
