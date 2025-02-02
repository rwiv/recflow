import {
  char,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

export const platformEnum = pgEnum('platform', ['chzzk', 'soop', 'twitch']);
export const channelPriorityEnum = pgEnum('channel_priority', ['main', 'sub', 'extra']);

export const channels = pgTable(
  'channels',
  {
    id: char({ length: 32 }).primaryKey(),
    ptype: platformEnum().notNull(),
    pid: varchar({ length: 255 }).notNull(),
    username: varchar({ length: 255 }).notNull(),
    profileImgUrl: text(),
    followerCount: integer().notNull(),
    description: text(),
    priority: channelPriorityEnum().notNull(),
    createdAt: timestamp().notNull(),
    updatedAt: timestamp(),
  },
  (t) => ({
    pidIndex: index('channels_pid_idx').on(t.pid),
    usernameIndex: index('channels_username_idx').on(t.username),
    followCntIndex: index('channels_followCnt_idx').on(t.followerCount),
    priorityIndex: index('channels_priority_idx').on(t.priority),
  }),
);

export const tags = pgTable(
  'tags',
  {
    id: char({ length: 32 }).primaryKey(),
    name: varchar({ length: 255 }).notNull().unique(),
    description: text(),
    createdAt: timestamp().notNull(),
    updatedAt: timestamp(),
  },
  (t) => ({
    nameIndex: uniqueIndex('tags_name_idx').on(t.name),
  }),
);

export const channelsToTags = pgTable(
  'channels_to_tags',
  {
    channelId: char('channel_id', { length: 32 })
      .notNull()
      .references(() => channels.id),
    tagId: char('tag_id', { length: 32 })
      .notNull()
      .references(() => tags.id),
    createdAt: timestamp().notNull(),
  },
  (t) => ({
    pk: primaryKey({
      name: 'id',
      columns: [t.channelId, t.tagId],
    }),
  }),
);
