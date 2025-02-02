import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ChannelService } from '../business/channel.service.js';
import { TagService } from '../business/tag.service.js';
import { ChannelRecord } from '../persistence/channel.types.js';
import { TagAttachment, TagDetachment, TagRecord, TagUpdate } from '../persistence/tag.types.js';
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
  channels(@Query('page') page: number, @Query('size') size: number): Promise<ChannelRecord[]> {
    return this.channelService.findPage(page, size);
  }

  @Post('/')
  createChannel(@Body() req: ChannelCreationReq): Promise<ChannelRecord> {
    return this.channelService.create(req.creation, req.tagNames);
  }

  @Put('/')
  updateChannel(@Body() req: ChannelUpdateReq): Promise<ChannelRecord> {
    return this.channelService.update(req.update, req.tagNames);
  }

  @Delete('/{channelId}')
  deleteChannel(@Param('channelId') channelId: string): Promise<ChannelRecord> {
    return this.channelService.delete(channelId);
  }

  @Put('/tags')
  updateTag(@Body() req: TagUpdate): Promise<TagRecord> {
    return this.tagService.update(req);
  }

  @Patch('/tags/attach')
  attachTag(@Body() req: TagAttachment): Promise<TagRecord> {
    return this.tagService.attach(req);
  }

  @Patch('/tags/detach')
  detachTag(@Body() req: TagDetachment): Promise<void> {
    return this.tagService.detach(req);
  }

  @Get('/tags')
  tags(): Promise<TagRecord[]> {
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
