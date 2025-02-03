import { channelsToTags, tags } from './schema.js';

export type TagEnt = typeof tags.$inferSelect;
export type ChannelToTagEnt = typeof channelsToTags.$inferSelect;

export type ChannelSortType = 'latest' | 'followerCnt' | undefined;

export interface TagCreation {
  name: string;
  description?: string;
}

export interface TagUpdate {
  tagId: string;
  form: {
    name: string;
    description?: string | null;
  };
}

export interface TagAttachment {
  channelId: string;
  tagName: string;
}

export interface TagDetachment {
  channelId: string;
  tagId: string;
}
