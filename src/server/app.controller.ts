import { Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { WebhookRecord } from '../webhook/types.js';
import { LiveInfo } from '../platform/live.js';
import { LiveAllocator } from '../observer/allocator.js';
import { ExitCmd } from '../observer/dispatcher.js';
import { TrackedLiveRepository } from '../storage/repositories/tracked-live-repository.service.js';
import { PlatformFetcher } from '../platform/fetcher.js';

@Controller('/api')
export class AppController {
  constructor(
    private readonly tracked: TrackedLiveRepository,
    private readonly allocator: LiveAllocator,
    private readonly fetcher: PlatformFetcher,
  ) {}

  @Get('/health')
  health(): string {
    return 'hello';
  }

  @Get('/webhooks')
  webhooks(): Promise<WebhookRecord[]> {
    return this.tracked.webhooks();
  }

  @Post('/webhooks/sync')
  async webhookSync(): Promise<void> {
    const lives = await this.tracked.all();
    return this.tracked.whRepo.synchronize(lives);
  }

  @Get('/lives')
  all(): Promise<LiveInfo[]> {
    return this.tracked.all();
  }

  @Post('/chzzk/:channelId')
  async addChzzk(@Param('channelId') channelId: string) {
    return this.allocator.allocate(await this.getChzzkLive(channelId));
  }

  @Post('/soop/:userId')
  async addSoop(@Param('userId') userId: string) {
    return this.allocator.allocate(await this.getSoopLive(userId));
  }

  @Delete('/chzzk/:channelId')
  async deleteChzzk(@Param('channelId') channelId: string, @Query('cmd') cmd: string = 'delete') {
    return this.allocator.deallocate(await this.getChzzkLive(channelId), this.checkCmd(cmd));
  }

  @Delete('/soop/:userId')
  async deleteSoop(@Param('userId') userId: string, @Query('cmd') cmd: string = 'delete') {
    return this.allocator.deallocate(await this.getSoopLive(userId), this.checkCmd(cmd));
  }

  private checkCmd(cmd: string) {
    if (!['delete', 'cancel'].includes(cmd)) {
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
