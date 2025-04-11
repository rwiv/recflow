import { Injectable } from '@nestjs/common';
import { LiveInfo } from '../spec/wapper/live.js';
import { ChannelInfo } from '../spec/wapper/channel.js';
import { ChzzkFetcher } from './fetcher.chzzk.js';
import { SoopFetcher } from './fetcher.soop.js';
import { PlatformName } from '../spec/storage/platform.enum.schema.js';
import { BaseError } from '../../utils/errors/base/BaseError.js';
import {
  PlatformCriterionDto,
  chzzkCriterionDto,
  soopCriterionDto,
} from '../../criterion/spec/criterion.dto.schema.js';
import { log } from 'jslog';
import { HttpRequestError } from '../../utils/errors/errors/HttpRequestError.js';

@Injectable()
export class PlatformFetcher {
  constructor(
    private readonly chzzkFetcher: ChzzkFetcher,
    private readonly soopFetcher: SoopFetcher,
  ) {}

  fetchLives(cr: PlatformCriterionDto): Promise<LiveInfo[]> {
    if (cr.platform.name === 'chzzk') {
      return this.chzzkFetcher.fetchLives(chzzkCriterionDto.parse(cr));
    } else if (cr.platform.name === 'soop') {
      return this.soopFetcher.fetchLives(soopCriterionDto.parse(cr));
    } else {
      throw new BaseError(`Invalid PlatformType: ${cr.platform.name}`);
    }
  }

  async fetchChannel(platform: PlatformName, pid: string, hasLiveInfo: boolean) {
    try {
      return await this.fetchChannelNotNull(platform, pid, hasLiveInfo);
    } catch (e) {
      if (e instanceof HttpRequestError && e.status === 404) {
        return null;
      } else {
        throw e;
      }
    }
  }

  fetchChannelNotNull(platform: PlatformName, pid: string, hasLiveInfo: boolean): Promise<ChannelInfo> {
    return this._fetchChannelNotNull(platform, pid, hasLiveInfo, false);
  }

  async fetchChannelWithCheckStream(platform: PlatformName, pid: string): Promise<ChannelInfo> {
    log.debug('Fetch with checkStream', { platform, pid });
    return await this._fetchChannelNotNull(platform, pid, true, true);
  }

  private _fetchChannelNotNull(
    platform: PlatformName,
    pid: string,
    hasLiveInfo: boolean,
    checkStream: boolean,
  ) {
    if (platform === 'chzzk') {
      return this.chzzkFetcher.fetchChannel(pid, hasLiveInfo, checkStream);
    } else if (platform === 'soop') {
      return this.soopFetcher.fetchChannel(pid, hasLiveInfo, checkStream);
    } else {
      throw new BaseError(`Invalid PlatformType: ${platform}`);
    }
  }
}
