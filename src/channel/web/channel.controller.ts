import { Controller, Get, Query } from '@nestjs/common';
import { ChannelService } from '../business/channel.service.js';
import { TagService } from '../business/tag.service.js';
import { ChannelRecord } from '../persistence/channel.types.js';
import { TagRecord } from '../persistence/tag.types.js';

@Controller('/api/channels')
export class ChannelController {
  constructor(
    private readonly channelService: ChannelService,
    private readonly tagService: TagService,
  ) {}

  @Get('/all')
  all(): Promise<ChannelRecord[]> {
    return this.channelService.findAll();
  }

  @Get('/')
  channels(@Query('page') page: number, @Query('size') size: number): Promise<ChannelRecord[]> {
    return this.channelService.findPage(page, size);
  }

  @Get('/tags')
  tags(): Promise<TagRecord[]> {
    return this.tagService.findAll();
  }
}
