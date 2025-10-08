import { LiveInfo } from '../spec/wapper/live.js';
import { PlatformName } from '../spec/storage/platform.enum.schema.js';
import { PlatformCriterionDto } from '../../criterion/spec/criterion.dto.schema.js';
import { ChannelInfo } from '../spec/wapper/channel.js';

export abstract class PlatformFetcher {
  abstract fetchLives(cr: PlatformCriterionDto): Promise<LiveInfo[]>;
  abstract fetchChannel(platform: PlatformName, channelUid: string, hasLiveInfo: boolean): Promise<ChannelInfo | null>;
  abstract fetchChannelNotNull(platform: PlatformName, channelUid: string, hasLiveInfo: boolean): Promise<ChannelInfo>;
}
