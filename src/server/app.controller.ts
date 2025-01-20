import { Controller, Delete, Get, Inject, Param, Post } from '@nestjs/common';
import { Streamq } from '../client/streamq.js';
import {
  ChzzkLiveState,
  ChzzkTargetRepository, SoopLiveState,
  SoopTargetRepository,
} from '../storage/types.js';
import {
  TARGET_REPOSITORY_CHZZK,
  TARGET_REPOSITORY_SOOP,
} from '../storage/stroage.module.js';
import { AllocatorChzzk } from '../observer/allocator.chzzk.js';
import { AllocatorSoop } from '../observer/allocator.soop.js';

@Controller('/api')
export class AppController {
  constructor(
    private readonly streamq: Streamq,
    @Inject(TARGET_REPOSITORY_CHZZK)
    private readonly chzzkTargets: ChzzkTargetRepository,
    private readonly chzzkAllocator: AllocatorChzzk,
    @Inject(TARGET_REPOSITORY_SOOP)
    private readonly soopTargets: SoopTargetRepository,
    private readonly soopAllocator: AllocatorSoop,
  ) {}

  @Get('/health')
  health(): string {
    return 'hello';
  }

  @Get('/chzzk/lives')
  all(): Promise<ChzzkLiveState[]> {
    return this.chzzkTargets.all();
  }

  @Get('/soop/lives')
  allSoop(): Promise<SoopLiveState[]> {
    return this.soopTargets.all();
  }

  @Post('/chzzk/:channelId')
  async Add(@Param('channelId') channelId: string): Promise<ChzzkLiveState> {
    return this.chzzkAllocator.allocate(await this.getChzzkLive(channelId));
  }

  @Post('/soop/:userId')
  async AddSoop(@Param('userId') userId: string): Promise<SoopLiveState> {
    return this.soopAllocator.allocate(await this.getSoopLive(userId));
  }

  @Delete('/chzzk/:channelId')
  async delete(@Param('channelId') channelId: string): Promise<ChzzkLiveState> {
    return this.chzzkAllocator.deallocate(await this.getChzzkLive(channelId));
  }

  @Delete('/soop/:userId')
  async deleteSoop(@Param('userId') userId: string): Promise<SoopLiveState> {
    return this.soopAllocator.deallocate(await this.getSoopLive(userId));
  }

  private async getChzzkLive(channelId: string) {
    const live = (await this.streamq.getChzzkChannel(channelId, true)).liveInfo;
    if (!live) throw Error('Not found chzzkChannel.liveInfo');
    return live;
  }

  private async getSoopLive(userId: string) {
    const channel = await this.streamq.getSoopChannel(userId, true);
    if (!channel) throw Error('Not found soop channel');
    const live = channel.liveInfo;
    if (!live) throw Error('Not found soopChannel.liveInfo');
    return live;
  }
}
