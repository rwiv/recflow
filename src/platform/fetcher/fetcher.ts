import { Injectable } from '@nestjs/common';
import { LiveInfo } from '../wapper/live.js';
import { ChannelInfo } from '../wapper/channel.js';
import { PlatformType } from '../platform.types.js';
import { ChzzkFetcher } from './chzzk.fetcher.js';
import { SoopFetcher } from './soop.fetcher.js';

@Injectable()
export class PlatformFetcher {
  constructor(
    private readonly chzzkFetcher: ChzzkFetcher,
    private readonly soopFetcher: SoopFetcher,
  ) {}

  fetchLives(platform: PlatformType): Promise<LiveInfo[]> {
    if (platform === 'chzzk') {
      return this.chzzkFetcher.fetchLives();
    } else if (platform === 'soop') {
      return this.soopFetcher.fetchLives();
    } else {
      throw Error(`Invalid PlatformType: ${platform}`);
    }
  }

  fetchChannel(
    platform: PlatformType,
    pid: string,
    hasLiveInfo: boolean,
  ): Promise<ChannelInfo | null> {
    if (platform === 'chzzk') {
      return this.chzzkFetcher.fetchChannel(pid, hasLiveInfo);
    } else if (platform === 'soop') {
      return this.soopFetcher.fetchChannel(pid, hasLiveInfo);
    } else {
      throw Error(`Invalid PlatformType: ${platform}`);
    }
  }
}
