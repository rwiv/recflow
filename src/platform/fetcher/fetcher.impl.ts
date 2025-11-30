import { Injectable } from '@nestjs/common';

import { BaseError } from '@/utils/errors/base/BaseError.js';
import { EnumCheckError } from '@/utils/errors/errors/EnumCheckError.js';
import { HttpRequestError } from '@/utils/errors/errors/HttpRequestError.js';
import { getHttpRequestError } from '@/utils/http.js';

import { PlatformFetcher } from '@/platform/fetcher/fetcher.js';
import { ChzzkFetcher } from '@/platform/fetcher/platforms/fetcher.chzzk.js';
import { SoopFetcher } from '@/platform/fetcher/platforms/fetcher.soop.js';
import { PlatformName } from '@/platform/spec/storage/platform.enum.schema.js';

import { PlatformCriterionDto, chzzkCriterionDto, soopCriterionDto } from '@/criterion/spec/criterion.dto.schema.js';

@Injectable()
export class PlatformFetcherImpl extends PlatformFetcher {
  constructor(
    private readonly chzzkFetcher: ChzzkFetcher,
    private readonly soopFetcher: SoopFetcher,
  ) {
    super();
  }

  async fetchLives(cr: PlatformCriterionDto) {
    try {
      if (cr.platform.name === 'chzzk') {
        return await this.chzzkFetcher.fetchLives(chzzkCriterionDto.parse(cr));
      } else if (cr.platform.name === 'soop') {
        return await this.soopFetcher.fetchLives(soopCriterionDto.parse(cr));
      } else {
        throw new BaseError(`Invalid PlatformType: ${cr.platform.name}`);
      }
    } catch (err) {
      const attr = { platform: cr.platform.name, cr_name: cr.name };
      throw getHttpRequestError('Failed to fetch lives', err, attr);
    }
  }

  async fetchChannel(platform: PlatformName, channelUid: string, hasLiveInfo: boolean) {
    try {
      return await this.fetchChannelNotNull(platform, channelUid, hasLiveInfo);
    } catch (err) {
      if (err instanceof HttpRequestError && err.status === 404) {
        return null;
      } else {
        throw err;
      }
    }
  }

  async fetchChannelNotNull(platform: PlatformName, channelUid: string, hasLiveInfo: boolean) {
    try {
      if (platform === 'chzzk') {
        return await this.chzzkFetcher.fetchChannel(channelUid, hasLiveInfo);
      } else if (platform === 'soop') {
        return await this.soopFetcher.fetchChannel(channelUid, hasLiveInfo);
      } else {
        throw new EnumCheckError(`Invalid PlatformType: ${platform}`);
      }
    } catch (err) {
      if (err instanceof EnumCheckError) {
        throw err;
      }
      throw getHttpRequestError('Failed to fetch channel', err, { platform, channel_uid: channelUid });
    }
  }
}
