import { channelsToTags, tags } from './schema.js';

export type TagEnt = typeof tags.$inferSelect;
export type ChannelToTagEnt = typeof channelsToTags.$inferSelect;

export type ChannelSortType = 'latest' | 'followerCnt' | undefined;

export interface TagEntCreation {
  name: string;
  description?: string;
}

export interface TagEntUpdate {
  tagId: string;
  form: {
    name?: string;
    description?: string | null;
  };
}

export interface TagEntAttachment {
  channelId: string;
  tagName: string;
}

export interface TagEntDetachment {
  channelId: string;
  tagId: string;
}
