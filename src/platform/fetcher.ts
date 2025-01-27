import { Injectable } from '@nestjs/common';
import { LiveInfo } from './live.js';
import { ChannelInfo } from './channel.js';
import { PlatformType } from './types.js';
import { ChzzkFetcher } from './chzzk.fetcher.js';
import { SoopFetcher } from './soop.fetcher.js';

@Injectable()
export class PlatformFetcher {
  constructor(
    private readonly chzzkFetcher: ChzzkFetcher,
    private readonly soopFetcher: SoopFetcher,
  ) {}

  fetchLives(ptype: PlatformType): Promise<LiveInfo[]> {
    if (ptype === 'chzzk') {
      return this.chzzkFetcher.fetchLives();
    } else if (ptype === 'soop') {
      return this.soopFetcher.fetchLives();
    } else {
      throw Error('Invalid PlatformType');
    }
  }

  fetchChannel(
    ptype: PlatformType,
    uid: string,
    hasLiveInfo: boolean,
  ): Promise<ChannelInfo | null> {
    if (ptype === 'chzzk') {
      return this.chzzkFetcher.fetchChannel(uid, hasLiveInfo);
    } else if (ptype === 'soop') {
      return this.soopFetcher.fetchChannel(uid, hasLiveInfo);
    } else {
      throw Error('Invalid PlatformType');
    }
  }
}
