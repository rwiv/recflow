import { Controller, Delete, Get, Inject, Param, Post, Query } from '@nestjs/common';
import { WebhookState } from '../webhook/types.js';
import { LiveInfo } from '../platform/live.js';
import { Allocator } from '../observer/allocator.js';
import { ExitCmd } from '../observer/dispatcher.js';
import { TargetedLiveRepository } from '../storage/repositories/targeted-live.repository.js';
import { ChzzkFetcher } from '../platform/chzzk.fetcher.js';
import { ENV, QUERY } from '../common/common.module.js';
import { Env } from '../common/env.js';
import { QueryConfig } from '../common/query.js';
import { SoopFetcher } from '../platform/soop.fetcher.js';

@Controller('/api')
export class AppController {
  private readonly chzzkFetcher: ChzzkFetcher;
  private readonly soopFetcher: SoopFetcher;

  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(QUERY) private readonly query: QueryConfig,
    private readonly targeted: TargetedLiveRepository,
    private readonly allocator: Allocator,
  ) {
    this.chzzkFetcher = new ChzzkFetcher(this.env, this.query);
    this.soopFetcher = new SoopFetcher(this.env, this.query);
  }

  @Get('/health')
  health(): string {
    return 'hello';
  }

  @Get('/webhooks')
  webhooks(): Promise<WebhookState[]> {
    return this.targeted.webhooks();
  }

  @Post('/webhooks/sync')
  async webhookSync(): Promise<void> {
    const lives = await this.targeted.all();
    return this.targeted.whRepo.synchronize(lives);
  }

  @Get('/lives')
  all(): Promise<LiveInfo[]> {
    return this.targeted.all();
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
    const live = (await this.chzzkFetcher.fetchChannel(channelId, true))?.liveInfo;
    if (!live) throw Error(`Not found chzzkChannel.liveInfo: ${channelId}`);
    return live;
  }

  private async getSoopLive(userId: string) {
    const live = (await this.soopFetcher.fetchChannel(userId, true))?.liveInfo;
    if (!live) throw Error('Not found soopChannel.liveInfo');
    return live;
  }
}
