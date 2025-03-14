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
} from 'drizzle-orm/pg-core';

function uuid(name?: string) {
  if (name) {
    return char(name, { length: 36 });
  } else {
    return char({ length: 36 });
  }
}

export const platformTable = pgTable(
  'platform',
  {
    id: uuid().primaryKey(),
    name: text().notNull().unique(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (t) => [uniqueIndex('platform_name_idx').on(t.name)],
);

export const channelPriorityTable = pgTable(
  'channel_priority',
  {
    id: uuid().primaryKey(),
    name: text().notNull().unique(),
    description: text(),
    tier: integer().notNull(),
    seq: integer().notNull(),
    shouldNotify: boolean('should_notify').notNull(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (t) => [uniqueIndex('channel_priority_name_idx').on(t.name), index('channel_priority_tier_idx').on(t.tier)],
);

export const channelTable = pgTable(
  'channel',
  {
    id: uuid().primaryKey(),
    platformId: uuid('platform_id')
      .notNull()
      .references(() => platformTable.id),
    pid: text().notNull(),
    username: text().notNull(),
    profileImgUrl: text('profile_img_url'),
    followerCnt: integer('follower_cnt').notNull(),
    priorityId: uuid('priority_id')
      .notNull()
      .references(() => channelPriorityTable.id),
    isFollowed: boolean('is_followed').notNull(),
    description: text(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
    lastRefreshedAt: timestamp('last_refreshed_at'),
  },
  (t) => [
    index('channel_pid_idx').on(t.pid),
    index('channel_username_idx').on(t.username),
    index('channel_follow_cnt_idx').on(t.followerCnt),
    index('channel_created_at_idx').on(t.createdAt),
    index('channel_updated_at_idx').on(t.updatedAt),
    index('channel_last_refreshed_at_idx').on(t.lastRefreshedAt.nullsFirst()),
  ],
);

export const channelTagMapTable = pgTable(
  'channel_tag_map',
  {
    channelId: uuid('channel_id')
      .notNull()
      .references(() => channelTable.id),
    tagId: uuid('tag_id')
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
    id: uuid().primaryKey(),
    name: text().notNull().unique(),
    description: text(),
    createdAt: timestamp('create_at').notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (t) => [uniqueIndex('channel_tag_name_idx').on(t.name)],
);

export const nodeTypeTable = pgTable(
  'node_type',
  {
    id: uuid().primaryKey(),
    name: text().notNull().unique(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (t) => [uniqueIndex('node_type_name_idx').on(t.name)],
);

export const nodeGroupTable = pgTable(
  'node_group',
  {
    id: uuid().primaryKey(),
    name: text().notNull().unique(),
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
    id: uuid().primaryKey(),
    name: text().notNull().unique(),
    description: text(),
    endpoint: text().notNull(),
    weight: integer().notNull(),
    isCordoned: boolean('is_cordoned').notNull(),
    typeId: uuid('type_id')
      .notNull()
      .references(() => nodeTypeTable.id),
    groupId: uuid('group_id')
      .notNull()
      .references(() => nodeGroupTable.id),
    failureCnt: integer('failure_cnt').notNull(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at'),
    lastAssignedAt: timestamp('last_assigned_at'),
  },
  (t) => [
    uniqueIndex('node_name_idx').on(t.name),
    index('node_weight_idx').on(t.weight),
    index('node_last_assigned_at_idx').on(t.lastAssignedAt.nullsFirst()),
  ],
);

export const nodeStateTable = pgTable('node_state', {
  id: uuid().primaryKey(),
  nodeId: uuid('node_id')
    .notNull()
    .references(() => nodeTable.id),
  platformId: uuid('platform_id')
    .notNull()
    .references(() => platformTable.id),
  capacity: integer().notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at'),
});

export const liveTable = pgTable('live', {
  id: uuid().primaryKey(),
  channelId: uuid('channel_id')
    .notNull()
    .references(() => channelTable.id),
  platformId: uuid('platform_id')
    .notNull()
    .references(() => platformTable.id),
  nodeId: uuid('node_id').references(() => nodeTable.id),
  liveTitle: text('live_title').notNull(),
  viewCnt: integer('view_cnt').notNull(),
  isAdult: boolean('is_adult').notNull(),
  isDisabled: boolean('is_disabled').notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at'),
  deletedAt: timestamp('deleted_at'),
  // disconnectedAt: timestamp('disconnected_at'),
});

export const liveCriterionTable = pgTable(
  'live_criterion',
  {
    id: uuid().primaryKey(),
    name: text().notNull().unique(),
    description: text(),
    platformId: uuid('platform_id')
      .notNull()
      .references(() => platformTable.id),
    enforceCreds: boolean('enforce_creds').notNull(),
    isDeactivated: boolean('is_deactivated').notNull(),
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
    id: uuid().primaryKey(),
    name: text().notNull().unique(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (t) => [uniqueIndex('live_criterion_rule_name_idx').on(t.name)],
);

export const liveCriterionUnitTable = pgTable('live_criterion_unit', {
  id: uuid().primaryKey(),
  criterionId: uuid('criterion_id')
    .notNull()
    .references(() => liveCriterionTable.id),
  ruleId: uuid('rule_id')
    .notNull()
    .references(() => liveCriterionRuleTable.id),
  value: text().notNull(),
  isPositive: boolean('is_positive').notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at'),
});
