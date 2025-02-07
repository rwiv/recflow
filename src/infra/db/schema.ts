import {
  boolean,
  char,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

export const platforms = pgTable(
  'platforms',
  {
    id: char({ length: 32 }).primaryKey(),
    name: varchar({ length: 50 }).notNull().unique(),
    createdAt: timestamp().notNull(),
    updatedAt: timestamp(),
  },
  (t) => [uniqueIndex('platforms_name_idx').on(t.name)],
);

export const channelPriorities = pgTable(
  'channel_priorities',
  {
    id: char({ length: 32 }).primaryKey(),
    name: varchar({ length: 50 }).notNull().unique(),
    createdAt: timestamp().notNull(),
    updatedAt: timestamp(),
  },
  (t) => [uniqueIndex('channel_priorities_name_idx').on(t.name)],
);

export const channels = pgTable(
  'channels',
  {
    id: char({ length: 32 }).primaryKey(),
    platformId: varchar({ length: 50 })
      .notNull()
      .references(() => platforms.id),
    pid: varchar({ length: 255 }).notNull(),
    username: varchar({ length: 255 }).notNull(),
    profileImgUrl: text(),
    followerCnt: integer().notNull(),
    priorityId: varchar({ length: 50 })
      .notNull()
      .references(() => channelPriorities.id),
    followed: boolean().notNull(),
    description: text(),
    createdAt: timestamp().notNull(),
    updatedAt: timestamp().notNull(),
  },
  (t) => [
    index('channels_pid_idx').on(t.pid),
    index('channels_username_idx').on(t.username),
    index('channels_followCnt_idx').on(t.followerCnt),
    index('channels_createdAt_idx').on(t.createdAt),
    index('channels_updatedAt_idx').on(t.updatedAt),
  ],
);

export const channelsToTags = pgTable(
  'channels_to_tags',
  {
    channelId: char('channel_id', { length: 32 })
      .notNull()
      .references(() => channels.id),
    tagId: char('tag_id', { length: 32 })
      .notNull()
      .references(() => channelTags.id),
    createdAt: timestamp().notNull(),
  },
  (t) => [
    primaryKey({
      name: 'id',
      columns: [t.channelId, t.tagId],
    }),
  ],
);

export const channelTags = pgTable(
  'channel_tags',
  {
    id: char({ length: 32 }).primaryKey(),
    name: varchar({ length: 255 }).notNull().unique(),
    description: text(),
    createdAt: timestamp().notNull(),
    updatedAt: timestamp(),
  },
  (t) => [uniqueIndex('tags_name_idx').on(t.name), index('tags_createdAt_idx').on(t.createdAt)],
);

// export const nodePriorities = pgTable(
//   'node_priorities',
//   {
//     id: char({ length: 32 }).primaryKey(),
//     name: varchar({ length: 20 }).notNull(),
//     createdAt: timestamp().notNull(),
//     updatedAt: timestamp(),
//   },
//   (t) => [index('node_priorities_name_idx').on(t.name)],
// );
//
// export const nodes = pgTable(
//   'nodes',
//   {
//     id: char({ length: 32 }).primaryKey(),
//     name: varchar({ length: 255 }).notNull(),
//     endpoint: text(),
//     priority: char({ length: 32 })
//       .notNull()
//       .references(() => nodePriorities.id),
//     createdAt: timestamp().notNull(),
//     updatedAt: timestamp(),
//   },
//   (t) => [index('nodes_name_idx').on(t.name)],
// );
