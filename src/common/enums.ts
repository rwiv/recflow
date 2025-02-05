import { ChannelPriority } from '../channel/persistence/channel.types.js';
import { ChannelSortType } from '../channel/persistence/tag.types.js';

export const PLATFORM_TYPES = ['chzzk', 'soop', 'twitch'] as const;
export const CHANNEL_PRIORITIES = ['must', 'should', 'may', 'review', 'skip', 'none'] as const;
export const NODE_PRIORITIES = ['main', 'sub', 'extra'] as const;
export const CHANNEL_SORTED_TYPES = ['latest', 'followerCnt'] as const;

export function checkPlatformType(text: string | undefined | null) {
  if (!text) {
    throw new Error('Platform type must be provided');
  }
  if (!['chzzk', 'soop', 'twitch'].includes(text)) {
    throw new Error('Invalid platform type');
  }
}

export function checkPriority(text: string | undefined | null): ChannelPriority | undefined {
  if (!text) {
    return undefined;
  }
  if (!['must', 'should', 'may', 'review', 'skip', 'none'].includes(text)) {
    throw new Error('Invalid priority value');
  }
  return text as ChannelPriority;
}

export function checkNodePriority(text: string | undefined | null) {
  if (!text) {
    throw new Error('Node Priority must be provided');
  }
  if (!['main', 'sub', 'extra'].includes(text)) {
    throw new Error('Invalid node priority');
  }
}

export function checkChannelSortedType(text: string | undefined | null): ChannelSortType {
  if (!text) {
    return undefined;
  }
  if (!['latest', 'followerCnt'].includes(text)) {
    throw new Error('Invalid sorted type');
  }
}
