import { Injectable } from '@nestjs/common';
import { LiveInfo } from '../spec/wapper/live.js';
import { ChzzkFetcher } from './fetcher.chzzk.js';
import { SoopFetcher } from './fetcher.soop.js';
import { PlatformName } from '../spec/storage/platform.enum.schema.js';
import { BaseError } from '../../utils/errors/base/BaseError.js';

@Injectable()
export class PlatformFetcher {
  constructor(
    private readonly chzzkFetcher: ChzzkFetcher,
    private readonly soopFetcher: SoopFetcher,
  ) {}

  fetchLives(platform: PlatformName): Promise<LiveInfo[]> {
    if (platform === 'chzzk') {
      return this.chzzkFetcher.fetchLives();
    } else if (platform === 'soop') {
      return this.soopFetcher.fetchLives();
    } else {
      throw new BaseError(`Invalid PlatformType: ${platform}`);
    }
  }

  fetchChannel(platform: PlatformName, pid: string, hasLiveInfo: boolean) {
    try {
      return this.fetchChannelNotNull(platform, pid, hasLiveInfo);
    } catch (e) {
      return null;
    }
  }

  // TODO: implement using zod
  fetchChannelWithLiveInfo(platform: PlatformName, pid: string) {
    throw new BaseError('Not implemented');
  }

  fetchChannelNotNull(platform: PlatformName, pid: string, hasLiveInfo: boolean) {
    if (platform === 'chzzk') {
      return this.chzzkFetcher.fetchChannel(pid, hasLiveInfo);
    } else if (platform === 'soop') {
      return this.soopFetcher.fetchChannel(pid, hasLiveInfo);
    } else {
      throw new BaseError(`Invalid PlatformType: ${platform}`);
    }
  }
}
