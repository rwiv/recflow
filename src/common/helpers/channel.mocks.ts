import { ChannelPriority } from '../../channel/priority/types.js';
import { ChannelAppend, chAppend } from '../../channel/channel/business/channel.schema.js';

export function mockChannel(
  n: number,
  priorityName: ChannelPriority = 'must',
  followerCnt: number = 10,
): ChannelAppend {
  const append: ChannelAppend = {
    platformName: 'chzzk',
    pid: `chzzk${n}`,
    username: `user${n}`,
    profileImgUrl: 'http://example.com',
    followerCnt,
    priorityName,
    followed: false,
    description: null,
  };
  return chAppend.parse(append);
}
