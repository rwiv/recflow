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

export const platformTable = pgTable(
  'platform',
  {
    id: char({ length: 32 }).primaryKey(),
    name: varchar({ length: 50 }).notNull().unique(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (t) => [uniqueIndex('platform_name_idx').on(t.name)],
);

export const channelPriorityTable = pgTable(
  'channel_priority',
  {
    id: char({ length: 32 }).primaryKey(),
    name: varchar({ length: 50 }).notNull().unique(),
    description: text(),
    tier: integer().notNull(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (t) => [
    uniqueIndex('channel_priority_name_idx').on(t.name),
    index('channel_priority_tier_idx').on(t.tier),
  ],
);

export const channelTable = pgTable(
  'channel',
  {
    id: char({ length: 32 }).primaryKey(),
    platformId: varchar({ length: 50 })
      .notNull()
      .references(() => platformTable.id),
    pid: varchar({ length: 255 }).notNull(),
    username: varchar({ length: 255 }).notNull(),
    profileImgUrl: text(),
    followerCnt: integer().notNull(),
    priorityId: varchar({ length: 50 })
      .notNull()
      .references(() => channelPriorityTable.id),
    followed: boolean().notNull(),
    description: text(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
  },
  (t) => [
    index('channel_pid_idx').on(t.pid),
    index('channel_username_idx').on(t.username),
    index('channel_follow_cnt_idx').on(t.followerCnt),
    index('channel_created_at_idx').on(t.createdAt),
    index('channel_updated_at_idx').on(t.updatedAt),
  ],
);

export const channelTagMapTable = pgTable(
  'channel_tag_map',
  {
    channelId: char('channel_id', { length: 32 })
      .notNull()
      .references(() => channelTable.id),
    tagId: char('tag_id', { length: 32 })
      .notNull()
      .references(() => channelTagTable.id),
    createdAt: timestamp('created_at').notNull(),
  },
  (t) => [
    primaryKey({
      name: 'id',
      columns: [t.channelId, t.tagId],
    }),
  ],
);

export const channelTagTable = pgTable(
  'channel_tag',
  {
    id: char({ length: 32 }).primaryKey(),
    name: varchar({ length: 255 }).notNull().unique(),
    description: text(),
    createdAt: timestamp('create_at').notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (t) => [uniqueIndex('channel_tag_name_idx').on(t.name)],
);

export const nodeTypeTable = pgTable(
  'node_type',
  {
    id: char({ length: 32 }).primaryKey(),
    name: varchar({ length: 50 }).notNull().unique(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (t) => [uniqueIndex('node_type_name_idx').on(t.name)],
);

export const nodeGroupTable = pgTable(
  'node_group',
  {
    id: char({ length: 32 }).primaryKey(),
    name: varchar({ length: 50 }).notNull().unique(),
    description: text(),
    tier: integer().notNull(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (t) => [uniqueIndex('node_group_name_idx').on(t.name), index('node_group_tier_idx').on(t.tier)],
);

export const nodeTable = pgTable(
  'node',
  {
    id: char({ length: 32 }).primaryKey(),
    name: varchar({ length: 255 }).notNull().unique(),
    description: text(),
    endpoint: text().notNull(),
    weight: integer().notNull(),
    totalCapacity: integer('total_capacity').notNull(),
    typeId: char('type_id', { length: 32 })
      .notNull()
      .references(() => nodeTypeTable.id),
    groupId: char('group_id', { length: 32 })
      .notNull()
      .references(() => nodeGroupTable.id),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (t) => [uniqueIndex('node_name_idx').on(t.name), index('node_weight_idx').on(t.weight)],
);

export const nodeStateTable = pgTable('node_state', {
  id: char({ length: 32 }).primaryKey(),
  nodeId: char('node_id', { length: 32 })
    .notNull()
    .references(() => nodeTable.id),
  platformId: char('platform_id', { length: 32 })
    .notNull()
    .references(() => platformTable.id),
  capacity: integer().notNull(),
  assigned: integer().notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at'),
});

export const liveTable = pgTable('live', {
  id: char({ length: 32 }).primaryKey(),
  channelId: char('channel_id', { length: 32 })
    .notNull()
    .references(() => channelTable.id),
  platformId: char('platform_id', { length: 32 })
    .notNull()
    .references(() => platformTable.id),
  nodeId: char('node_id', { length: 32 })
    .notNull()
    .references(() => nodeTable.id),
  liveTitle: text('live_title').notNull(),
  viewCnt: integer('view_cnt').notNull(),
  adult: boolean().notNull(),
  isDeleted: boolean().notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at'),
  deletedAt: timestamp('deleted_at'),
});

export const liveCriterionTable = pgTable(
  'live_criterion',
  {
    id: char({ length: 32 }).primaryKey(),
    name: varchar({ length: 50 }).notNull().unique(),
    description: text(),
    platformId: char('platform_id', { length: 32 })
      .notNull()
      .references(() => platformTable.id),
    minUserCnt: integer('min_user_cnt').notNull(),
    minFollowCnt: integer('min_follow_cnt').notNull(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (t) => [uniqueIndex('live_criterion_name_idx').on(t.name)],
);

export const liveCriterionRuleTable = pgTable(
  'live_criterion_rule',
  {
    id: char({ length: 32 }).primaryKey(),
    name: varchar({ length: 50 }).notNull().unique(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (t) => [uniqueIndex('live_criterion_rule_name_idx').on(t.name)],
);

export const liveCriterionUnitTable = pgTable('live_criterion_unit', {
  id: char({ length: 32 }).primaryKey(),
  criterionId: char('criterion_id', { length: 32 })
    .notNull()
    .references(() => liveCriterionTable.id),
  filterTypeId: char('filter_type_id', { length: 32 })
    .notNull()
    .references(() => liveCriterionRuleTable.id),
  value: text().notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at'),
});
