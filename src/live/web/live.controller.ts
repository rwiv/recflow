import { Body, Controller, Delete, Get, Post, UseFilters } from '@nestjs/common';
import { LiveService } from '../business/live.service.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { exitCmd } from '../event/event.schema.js';
import { LiveScheduler } from '../scheduler/scheduler.js';
import { HttpErrorFilter } from '../../common/module/error.filter.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { LiveRecord } from '../business/live.business.schema.js';
import { LiveFinder } from '../business/live.finder.js';
import { LiveMapOpt } from '../business/live.mapper.js';
import {
  liveAppendRequest,
  LiveAppendRequest,
  liveDeleteRequest,
  LiveDeleteRequest,
} from './live.web.schema.js';

@UseFilters(HttpErrorFilter)
@Controller('/api/lives')
export class LiveController {
  constructor(
    private readonly liveService: LiveService,
    private readonly fetcher: PlatformFetcher,
    private readonly scheduler: LiveScheduler,
    private readonly liveFinder: LiveFinder,
  ) {}

  @Get('/')
  allActives(): Promise<LiveRecord[]> {
    const opt: LiveMapOpt = {
      withChannelTags: false,
      withNode: true,
      withNodeGroup: true,
      withNodeStates: false,
    };
    return this.liveFinder.findAllActives(opt);
  }

  @Get('/all')
  all(): Promise<LiveRecord[]> {
    const opt: LiveMapOpt = {
      withChannelTags: false,
      withNode: true,
      withNodeGroup: true,
      withNodeStates: false,
    };
    return this.liveFinder.findAll(opt);
  }

  @Get('/schedule/stat')
  scheduled() {
    return {
      status: this.scheduler.isObserving,
    };
  }

  @Post('/schedule/start')
  startSchedule() {
    this.scheduler.run();
  }

  @Post('/schedule/stop')
  stopSchedule() {
    this.scheduler.stop();
  }

  @Delete('/purge')
  async purge(): Promise<LiveRecord[]> {
    return this.liveService.purgeAll();
  }

  @Post('/')
  async add(@Body() req: LiveAppendRequest) {
    const append = liveAppendRequest.parse(req);
    const channel = await this.fetcher.fetchChannel(append.platformName, append.pid, true);
    if (!channel?.liveInfo) {
      throw new NotFoundError(`Not found chzzkChannel.liveInfo: ${req.pid}`);
    }
    return this.liveService.add(channel.liveInfo, channel);
  }

  @Delete('/')
  async delete(@Body() req: LiveDeleteRequest) {
    const { recordId, cmd } = liveDeleteRequest.parse(req);
    return this.liveService.delete(recordId, { exitCmd: exitCmd.parse(cmd) });
  }
}
