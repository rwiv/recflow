import { Controller, Delete, Get, Inject, Param, Post } from '@nestjs/common';
import { Streamq } from '../client/streamq.js';
import { TargetRepository } from '../storage/types.js';
import { TARGET_REPOSITORY } from '../storage/stroage.module.js';
import { WebhookState } from '../webhook/types.js';
import { LiveInfo, LiveInfoWrapper } from '../platform/wrapper.live.js';
import { Allocator } from '../observer/allocator.js';

@Controller('/api')
export class AppController {
  constructor(
    private readonly streamq: Streamq,
    @Inject(TARGET_REPOSITORY)
    private readonly targets: TargetRepository,
    private readonly allocator: Allocator,
  ) {}

  @Get('/health')
  health(): string {
    return 'hello';
  }

  @Get('/webhooks')
  whStates(): Promise<WebhookState[]> {
    return this.targets.whStates();
  }

  @Get('/lives')
  all(): Promise<LiveInfo[]> {
    return this.targets.all();
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
  async deleteChzzk(@Param('channelId') channelId: string) {
    return this.allocator.deallocate(await this.getChzzkLive(channelId));
  }

  @Delete('/soop/:userId')
  async deleteSoop(@Param('userId') userId: string) {
    return this.allocator.deallocate(await this.getSoopLive(userId));
  }

  private async getChzzkLive(channelId: string) {
    const live = (await this.streamq.getChzzkChannel(channelId, true)).liveInfo;
    if (!live) throw Error(`Not found chzzkChannel.liveInfo: ${channelId}`);
    return LiveInfoWrapper.fromChzzkReq(live);
  }

  private async getSoopLive(userId: string) {
    const channel = await this.streamq.getSoopChannel(userId, true);
    if (!channel) throw Error('Not found soop channel');
    const live = channel.liveInfo;
    if (!live) throw Error('Not found soopChannel.liveInfo');
    return LiveInfoWrapper.fromSoopReq(live);
  }
}
