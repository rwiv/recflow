import { PlatformName } from '@/client/common.schema.ts';

export function getChannelUrl(type: PlatformName, channelId: string) {
  switch (type) {
    case 'chzzk':
      return `https://chzzk.naver.com/${channelId}`;
    case 'soop':
      return `https://ch.sooplive.co.kr/${channelId}`;
    case 'twitch':
      return `https://www.twitch.tv/${channelId}`;
    default:
      throw new Error(`Not supported channel type: ${type}`);
  }
}

export function getLiveUrl(type: PlatformName, channelId: string) {
  switch (type) {
    case 'chzzk':
      return `https://chzzk.naver.com/live/${channelId}`;
    case 'soop':
      return `https://play.sooplive.co.kr/${channelId}`;
    case 'twitch':
      return `https://www.twitch.tv/${channelId}`;
    default:
      throw new Error(`Not supported channel type: ${type}`);
  }
}
