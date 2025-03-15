import { Injectable } from '@nestjs/common';
import { LiveInfo } from '../spec/wapper/live.js';
import { ChzzkFetcher } from './fetcher.chzzk.js';
import { SoopFetcher } from './fetcher.soop.js';
import { PlatformName } from '../spec/storage/platform.enum.schema.js';
import { BaseError } from '../../utils/errors/base/BaseError.js';
import {
  PlatformCriterionDto,
  chzzkCriterionDto,
  soopCriterionDto,
} from '../../criterion/spec/criterion.dto.schema.js';

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

  fetchChannel(platform: PlatformName, pid: string, hasLiveInfo: boolean, checkStream: boolean = false) {
    try {
      return this.fetchChannelNotNull(platform, pid, hasLiveInfo, checkStream);
    } catch (e) {
      return null;
    }
  }

  fetchChannelNotNull(
    platform: PlatformName,
    pid: string,
    hasLiveInfo: boolean,
    checkStream: boolean = false,
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
