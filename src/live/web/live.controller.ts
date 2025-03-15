import { Body, Controller, Delete, Get, Post, UseFilters } from '@nestjs/common';
import { LiveRegistrar } from '../registry/live.registrar.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { exitCmd } from '../event/event.schema.js';
import { HttpErrorFilter } from '../../common/module/error.filter.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { LiveDto } from '../spec/live.dto.schema.js';
import { LiveFinder } from '../access/live.finder.js';
import { LiveMapOpt } from '../access/live.mapper.js';
import {
  liveAppendRequest,
  LiveAppendRequest,
  liveDeleteRequest,
  LiveDeleteRequest,
} from './live.web.schema.js';
import { channelLiveInfo } from '../../platform/spec/wapper/channel.js';

@UseFilters(HttpErrorFilter)
@Controller('/api/lives')
export class LiveController {
  constructor(
    private readonly liveService: LiveRegistrar,
    private readonly fetcher: PlatformFetcher,
    private readonly liveFinder: LiveFinder,
  ) {}

  @Get('/')
  allActives(): Promise<LiveDto[]> {
    const opt: LiveMapOpt = {
      withChannelTags: false,
      withNode: true,
      withNodeGroup: true,
      withNodeStates: false,
    };
    return this.liveFinder.findAllActives(opt);
  }

  @Get('/all')
  all(): Promise<LiveDto[]> {
    const opt: LiveMapOpt = {
      withChannelTags: false,
      withNode: true,
      withNodeGroup: true,
      withNodeStates: false,
    };
    return this.liveFinder.findAll(opt);
  }

  @Post('/')
  async add(@Body() req: LiveAppendRequest) {
    const append = liveAppendRequest.parse(req);
    const channel = channelLiveInfo.parse(
      await this.fetcher.fetchChannelNotNull(append.platformName, append.pid, true),
    );
    return this.liveService.add(channel);
  }

  @Delete('/')
  async delete(@Body() req: LiveDeleteRequest) {
    const { recordId, cmd, isPurge } = liveDeleteRequest.parse(req);
    return this.liveService.remove(recordId, { exitCmd: exitCmd.parse(cmd), isPurge });
  }
}
