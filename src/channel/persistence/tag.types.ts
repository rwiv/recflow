export type ChannelSortType = 'latest' | 'followerCnt' | undefined;

export interface TagEntAttachment {
  channelId: string;
  tagName: string;
}

export interface TagEntDetachment {
  channelId: string;
  tagId: string;
}
