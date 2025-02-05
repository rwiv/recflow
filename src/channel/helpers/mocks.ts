import { ChannelEntCreation } from '../persistence/channel.types.js';
import { ChannelPriority } from '../priority/types.js';

export function mockChannel(
  n: number,
  priority: ChannelPriority = 'must',
  followerCnt: number = 10,
): ChannelEntCreation {
  return {
    platform: 'chzzk',
    pid: `chzzk${n}`,
    username: `user${n}`,
    profileImgUrl: 'http://example.com',
    followerCnt,
    priority,
    followed: false,
    description: '',
  };
}
