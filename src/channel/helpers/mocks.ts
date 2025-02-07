import { ChannelPriority } from '../priority/types.js';
import { ChannelCreation } from '../business/channel.types.js';

export function mockChannel(
  n: number,
  priorityName: ChannelPriority = 'must',
  followerCnt: number = 10,
): ChannelCreation {
  return {
    platformName: 'chzzk',
    pid: `chzzk${n}`,
    username: `user${n}`,
    profileImgUrl: 'http://example.com',
    followerCnt,
    priorityName,
    followed: false,
    description: null,
  };
}
