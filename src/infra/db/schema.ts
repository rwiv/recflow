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
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (t) => [uniqueIndex('platforms_name_idx').on(t.name)],
);

export const channelPriorities = pgTable(
  'channel_priorities',
  {
    id: char({ length: 32 }).primaryKey(),
    name: varchar({ length: 50 }).notNull().unique(),
    tier: integer().notNull(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (t) => [
    uniqueIndex('channel_priorities_name_idx').on(t.name),
    index('channel_priorities_tier_idx').on(t.tier),
  ],
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
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
  },
  (t) => [
    index('channels_pid_idx').on(t.pid),
    index('channels_username_idx').on(t.username),
    index('channels_follow_cnt_idx').on(t.followerCnt),
    index('channels_created_at_idx').on(t.createdAt),
    index('channels_updated_at_idx').on(t.updatedAt),
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
    createdAt: timestamp('created_at').notNull(),
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
    createdAt: timestamp('create_at').notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (t) => [
    uniqueIndex('channel_tags_name_idx').on(t.name),
    index('channel_tags_created_at_idx').on(t.createdAt),
  ],
);

export const nodeTypes = pgTable(
  'node_types',
  {
    id: char({ length: 32 }).primaryKey(),
    name: varchar({ length: 50 }).notNull().unique(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (t) => [uniqueIndex('node_types_name_idx').on(t.name)],
);

export const nodeGroups = pgTable(
  'node_groups',
  {
    id: char({ length: 32 }).primaryKey(),
    name: varchar({ length: 50 }).notNull().unique(),
    tier: integer().notNull(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (t) => [uniqueIndex('node_groups_name_idx').on(t.name), index('node_groups_tier_idx').on(t.tier)],
);

export const nodes = pgTable(
  'nodes',
  {
    id: char({ length: 32 }).primaryKey(),
    name: varchar({ length: 255 }).notNull().unique(),
    endpoint: text().notNull(),
    weight: integer().notNull(),
    totalCapacity: integer('total_capacity').notNull(),
    typeId: char('type_id', { length: 32 })
      .notNull()
      .references(() => nodeTypes.id),
    groupId: char('group_id', { length: 32 })
      .notNull()
      .references(() => nodeGroups.id),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (t) => [uniqueIndex('nodes_name_idx').on(t.name)],
);

export const nodeStates = pgTable('node_states', {
  id: char({ length: 32 }).primaryKey(),
  nodeId: char('node_id', { length: 32 })
    .notNull()
    .references(() => nodes.id),
  platformId: char('platform_id', { length: 32 })
    .notNull()
    .references(() => platforms.id),
  capacity: integer().notNull(),
  assigned: integer().notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at'),
});

export const lives = pgTable('lives', {
  id: char({ length: 32 }).primaryKey(),
  channelId: char('channel_id', { length: 32 })
    .notNull()
    .references(() => channels.id),
  platformId: char('platform_id', { length: 32 })
    .notNull()
    .references(() => platforms.id),
  nodeId: char('node_id', { length: 32 })
    .notNull()
    .references(() => nodes.id),
  liveTitle: text('live_title').notNull(),
  viewCnt: integer('view_cnt').notNull(),
  adult: boolean().notNull(),
  isDeleted: boolean().notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at'),
  deletedAt: timestamp('deleted_at'),
});
