import { Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { WebhookRecord } from '../webhook/types.js';
import { LiveInfo } from '../../platform/wapper/live.js';
import { TrackedLiveService } from '../service/tracked-live.service.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { ExitCmd } from '../event/types.js';

@Controller('/api')
export class LiveController {
  constructor(
    private readonly liveService: TrackedLiveService,
    private readonly fetcher: PlatformFetcher,
  ) {}

  @Get('/health')
  health(): string {
    return 'hello';
  }

  @Get('/webhooks')
  webhooks(): Promise<WebhookRecord[]> {
    return this.liveService.webhooks();
  }

  @Post('/webhooks/sync')
  async webhookSync(): Promise<void> {
    const lives = await this.liveService.findAllActives();
    return this.liveService.webhookService.synchronize(lives);
  }

  @Get('/lives')
  all(): Promise<LiveInfo[]> {
    return this.liveService.findAllActives();
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
    return this.liveService.delete(channelId, this.checkCmd(cmd));
  }

  @Delete('/soop/:userId')
  async deleteSoop(@Param('userId') userId: string, @Query('cmd') cmd: string = 'delete') {
    return this.liveService.delete(userId, this.checkCmd(cmd));
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
