import { NotFoundError } from '@/utils/errors/errors/NotFoundError.js';

import { PlatformFetcher } from '@/platform/fetcher/fetcher.js';
import { PlatformName } from '@/platform/spec/storage/platform.enum.schema.js';
import { ChannelInfo } from '@/platform/spec/wapper/channel.js';
import { LiveInfo } from '@/platform/spec/wapper/live.js';

import { PlatformCriterionDto } from '@/criterion/spec/criterion.dto.schema.js';

export class PlatformFetcherFake extends PlatformFetcher {
  private lives: LiveInfo[] = [];
  private channels: ChannelInfo[] = [];

  async fetchLives(cr: PlatformCriterionDto) {
    return this.lives;
  }

  async fetchChannel(platform: PlatformName, channelUid: string, hasLiveInfo: boolean) {
    return this.findChannel(platform, channelUid) ?? null;
  }

  async fetchChannelNotNull(platform: PlatformName, channelUid: string, hasLiveInfo: boolean) {
    const result = this.findChannel(platform, channelUid);
    if (!result) {
      throw new NotFoundError('Not found ChannelInfo');
    }
    return result;
  }

  private findChannel(platform: PlatformName, channelUid: string) {
    return this.channels.find((ch) => {
      return ch.platform === platform && ch.sourceId === channelUid;
    });
  }

  setMockLiveInfos(lives: LiveInfo[]) {
    this.lives = lives;
  }

  setMockChannelInfos(channels: ChannelInfo[]) {
    this.channels = channels;
  }
}
