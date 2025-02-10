import { Body, Controller, Delete, Get, Param, Post, Query, UseFilters } from '@nestjs/common';
import { LiveService } from '../business/live.service.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { exitCmd } from '../event/types.js';
import { LiveScheduler } from '../scheduler/scheduler.js';
import { HttpErrorFilter } from '../../common/module/error.filter.js';
import { NotFoundError } from '../../utils/errors/errors/NotFoundError.js';
import { LiveRecord } from '../business/live.business.schema.js';
import { LiveFinder } from '../business/live.finder.js';
import { PlatformType } from '../../platform/platform.schema.js';
import { LiveMapOpt } from '../business/live.mapper.js';

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
  async add(@Body() req: { pid: string; pfName: PlatformType }) {
    const channel = await this.fetcher.fetchChannel(req.pfName, req.pid, true);
    if (!channel?.liveInfo) {
      throw new NotFoundError(`Not found chzzkChannel.liveInfo: ${req.pid}`);
    }
    return this.liveService.add(channel.liveInfo, channel);
  }

  @Delete('/delete/:recordId')
  async delete(@Param('recordId') recordId: string, @Query('cmd') cmd: string = 'delete') {
    return this.liveService.delete(recordId, { exitCmd: exitCmd.parse(cmd) });
  }

  // TODO: remove
  // @Post('/chzzk/:channelId')
  // async addChzzk(@Param('channelId') channelId: string) {
  //   const { live, channel } = await this.getChzzkLive(channelId);
  //   return this.liveService.add(live, channel);
  // }
  //
  // @Post('/soop/:userId')
  // async addSoop(@Param('userId') userId: string) {
  //   const { live, channel } = await this.getSoopLive(userId);
  //   return this.liveService.add(live, channel);
  // }

  // @Delete('/chzzk/:channelId')
  // async deleteChzzk(@Param('channelId') channelId: string, @Query('cmd') cmd: string = 'delete') {
  //   return this.liveService.delete(channelId, { exitCmd: this.checkCmd(cmd) });
  // }
  //
  // @Delete('/soop/:userId')
  // async deleteSoop(@Param('userId') userId: string, @Query('cmd') cmd: string = 'delete') {
  //   return this.liveService.delete(userId, { exitCmd: this.checkCmd(cmd) });
  // }
  //
  // private checkCmd(cmd: string) {
  //   if (!['delete', 'cancel', 'finish'].includes(cmd)) {
  //     throw Error(`Invalid cmd: ${cmd}`);
  //   }
  //   return cmd as ExitCmd;
  // }

  // private async getChzzkLive(channelId: string) {
  //   const channel = await this.fetcher.fetchChannel('chzzk', channelId, true);
  //   if (!channel?.liveInfo)
  //     throw new NotFoundError(`Not found chzzkChannel.liveInfo: ${channelId}`);
  //   return { live: channel.liveInfo, channel };
  // }
  //
  // private async getSoopLive(userId: string) {
  //   const channel = await this.fetcher.fetchChannel('soop', userId, true);
  //   if (!channel?.liveInfo) throw new NotFoundError('Not found soopChannel.liveInfo');
  //   return { live: channel.liveInfo, channel };
  // }
}
