import { channels } from '../../infra/db/schema.js';

export type ChannelEnt = typeof channels.$inferSelect;

export interface ChannelEntCreation {
  pid: string;
  username: string;
  profileImgUrl: string | null;
  followerCnt: number;
  platformId: string;
  priorityId: string;
  followed: boolean;
  description: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChannelEntUpdate {
  id: string;
  form: {
    platformId?: string;
    pid?: string;
    username?: string;
    profileImgUrl?: string | null;
    followerCount?: number;
    priorityId?: string;
    followed?: boolean;
    description?: string | null;
  };
}
