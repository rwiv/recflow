import { Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { NodeRecord } from '../node/types.js';
import { LiveInfo } from '../../platform/wapper/live.js';
import { TrackedLiveService } from '../business/tracked-live.service.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { ExitCmd } from '../event/types.js';
import { LiveScheduler } from '../scheduler/scheduler.js';

@Controller('/api/lives')
export class LiveController {
  constructor(
    private readonly liveService: TrackedLiveService,
    private readonly fetcher: PlatformFetcher,
    private readonly scheduler: LiveScheduler,
  ) {}

  @Get('/')
  allActives(): Promise<LiveInfo[]> {
    return this.liveService.findAllActives();
  }

  @Get('/all')
  all(): Promise<LiveInfo[]> {
    return this.liveService.findAll();
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

  @Get('/nodes')
  nodes(): Promise<NodeRecord[]> {
    return this.liveService.nodes();
  }

  @Post('/nodes/sync')
  async nodesSync(): Promise<void> {
    return this.liveService.syncNodes();
  }

  @Delete('/purge')
  async purge(): Promise<LiveInfo[]> {
    return this.liveService.purgeAll();
  }

  @Post('/chzzk/:channelId')
  async addChzzk(@Param('channelId') channelId: string) {
    return this.liveService.add(await this.getChzzkLive(channelId));
  }

  @Post('/soop/:userId')
  async addSoop(@Param('userId') userId: string) {
    return this.liveService.add(await this.getSoopLive(userId));
  }

  @Delete('/chzzk/:channelId')
  async deleteChzzk(@Param('channelId') channelId: string, @Query('cmd') cmd: string = 'delete') {
    return this.liveService.delete(channelId, { exitCmd: this.checkCmd(cmd) });
  }

  @Delete('/soop/:userId')
  async deleteSoop(@Param('userId') userId: string, @Query('cmd') cmd: string = 'delete') {
    return this.liveService.delete(userId, { exitCmd: this.checkCmd(cmd) });
  }

  private checkCmd(cmd: string) {
    if (!['delete', 'cancel', 'finish'].includes(cmd)) {
      throw Error(`Invalid cmd: ${cmd}`);
    }
    return cmd as ExitCmd;
  }

  private async getChzzkLive(channelId: string) {
    const live = (await this.fetcher.fetchChannel('chzzk', channelId, true))?.liveInfo;
    if (!live) throw Error(`Not found chzzkChannel.liveInfo: ${channelId}`);
    return live;
  }

  private async getSoopLive(userId: string) {
    const live = (await this.fetcher.fetchChannel('soop', userId, true))?.liveInfo;
    if (!live) throw Error('Not found soopChannel.liveInfo');
    return live;
  }
}
