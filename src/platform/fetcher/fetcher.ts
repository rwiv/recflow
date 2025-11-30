import { PlatformName } from '@/platform/spec/storage/platform.enum.schema.js';
import { ChannelInfo } from '@/platform/spec/wapper/channel.js';
import { LiveInfo } from '@/platform/spec/wapper/live.js';

import { PlatformCriterionDto } from '@/criterion/spec/criterion.dto.schema.js';

export abstract class PlatformFetcher {
  abstract fetchLives(cr: PlatformCriterionDto): Promise<LiveInfo[]>;

  abstract fetchChannel(platform: PlatformName, channelUid: string, hasLiveInfo: boolean): Promise<ChannelInfo | null>;

  abstract fetchChannelNotNull(platform: PlatformName, channelUid: string, hasLiveInfo: boolean): Promise<ChannelInfo>;
}
