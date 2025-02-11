import { Injectable } from '@nestjs/common';
import { LiveInfo } from '../wapper/live.js';
import { ChzzkFetcher } from './chzzk.fetcher.js';
import { SoopFetcher } from './soop.fetcher.js';
import { PlatformType } from '../platform.schema.js';
import { BaseError } from '../../utils/errors/base/BaseError.js';

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
      throw new BaseError(`Invalid PlatformType: ${platform}`);
    }
  }

  fetchChannel(platform: PlatformType, pid: string, hasLiveInfo: boolean) {
    try {
      return this.fetchChannelNotNull(platform, pid, hasLiveInfo);
    } catch (e) {
      return null;
    }
  }

  fetchChannelNotNull(platform: PlatformType, pid: string, hasLiveInfo: boolean) {
    if (platform === 'chzzk') {
      return this.chzzkFetcher.fetchChannel(pid, hasLiveInfo);
    } else if (platform === 'soop') {
      return this.soopFetcher.fetchChannel(pid, hasLiveInfo);
    } else {
      throw new BaseError(`Invalid PlatformType: ${platform}`);
    }
  }
}
