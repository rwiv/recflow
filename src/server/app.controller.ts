import { Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { Streamq } from '../client/streamq.js';
import { WebhookState } from '../webhook/types.js';
import { LiveInfo } from '../platform/live.js';
import { Allocator } from '../observer/allocator.js';
import { ExitCmd } from '../observer/dispatcher.js';
import { TargetedLiveRepository } from '../storage/targeted/targeted-live.repository.js';

@Controller('/api')
export class AppController {
  constructor(
    private readonly streamq: Streamq,
    private readonly targeted: TargetedLiveRepository,
    private readonly allocator: Allocator,
  ) {}

  @Get('/health')
  health(): string {
    return 'hello';
  }

  @Get('/webhooks')
  whStates(): Promise<WebhookState[]> {
    return this.targeted.webhooks();
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
    if (!['delete', 'cancel', 'finish'].includes(cmd)) {
      throw Error(`Invalid cmd: ${cmd}`);
    }
    return cmd as ExitCmd;
  }

  private async getChzzkLive(channelId: string) {
    const live = (await this.streamq.getChzzkChannel(channelId, true))?.liveInfo;
    if (!live) throw Error(`Not found chzzkChannel.liveInfo: ${channelId}`);
    return LiveInfo.fromChzzk(live);
  }

  private async getSoopLive(userId: string) {
    const live = (await this.streamq.getSoopChannel(userId, true))?.liveInfo;
    if (!live) throw Error('Not found soopChannel.liveInfo');
    return LiveInfo.fromSoop(live);
  }
}
