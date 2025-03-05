import { ChannelAppend, channelAppend } from '../../channel/spec/channel.dto.schema.js';
import { PlatformDto } from '../../platform/spec/storage/platform.dto.schema.js';
import { ValidationError } from '../../utils/errors/errors/ValidationError.js';
import { PriorityDto } from '../../channel/spec/priority.schema.js';

export function mockChannel(
  n: number,
  platform: PlatformDto | undefined,
  priority: PriorityDto | undefined,
  followerCnt: number = 10,
): ChannelAppend {
  if (!platform) {
    throw new ValidationError('platform is required');
  }
  if (!priority) {
    throw new ValidationError('priority is required');
  }
  const append: ChannelAppend = {
    platformId: platform.id,
    pid: `chzzk${n}`,
    username: `user${n}`,
    profileImgUrl: 'http://example.com',
    followerCnt,
    priorityId: priority.id,
    isFollowed: false,
    description: null,
  };
  return channelAppend.parse(append);
}
