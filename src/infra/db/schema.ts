import { boolean, index, uuid, integer, pgTable, primaryKey, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const platformTable = pgTable(
  'platform',
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull().unique(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (t) => [uniqueIndex('platform_name_idx').on(t.name)],
);

export const channelGradeTable = pgTable(
  'channel_grade',
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull().unique(),
    shouldSave: boolean('should_save').notNull(),
    description: text(),
    shouldNotify: boolean('should_notify').notNull(),
    tier: integer().notNull(),
    seq: integer().notNull(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (t) => [uniqueIndex('channel_grade_name_idx').on(t.name)],
);

export const channelTable = pgTable(
  'channel',
  {
    id: uuid().primaryKey().defaultRandom(),
    platformId: uuid('platform_id')
      .notNull()
      .references(() => platformTable.id),
    sourceId: text('source_id').notNull(),
    username: text().notNull(),
    profileImgUrl: text('profile_img_url'),
    followerCnt: integer('follower_cnt').notNull(),
    gradeId: uuid('grade_id')
      .notNull()
      .references(() => channelGradeTable.id),
    isFollowed: boolean('is_followed').notNull(),
    adultOnly: boolean('adult_only').notNull(),
    overseasFirst: boolean('overseas_first').notNull(),
    description: text(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
    lastRefreshedAt: timestamp('last_refreshed_at'),
    streamCheckedAt: timestamp('stream_checked_at'),
  },
  (t) => [
    index('channel_platform_id_idx').on(t.platformId),
    index('channel_grade_id_idx').on(t.gradeId),
    index('channel_source_id_idx').on(t.sourceId),
    index('channel_username_idx').on(t.username),
    index('channel_follow_cnt_idx').on(t.followerCnt),
    index('channel_created_at_idx').on(t.createdAt),
    index('channel_updated_at_idx').on(t.updatedAt),
    index('channel_last_refreshed_at_idx').on(t.lastRefreshedAt.nullsFirst()),
    index('channel_stream_chacked_at_idx').on(t.streamCheckedAt.nullsFirst()),
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
      name: 'channel_tag_map_id',
      columns: [t.channelId, t.tagId],
    }),
    uniqueIndex('channel_tag_map_multi_idx').on(t.tagId, t.channelId),
  ],
);

export const channelTagTable = pgTable(
  'channel_tag',
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull().unique(),
    description: text(),
    createdAt: timestamp('create_at').notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (t) => [uniqueIndex('channel_tag_name_idx').on(t.name)],
);

export const nodeGroupTable = pgTable(
  'node_group',
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull().unique(),
    description: text(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (t) => [uniqueIndex('node_group_name_idx').on(t.name)],
);

export const nodeTable = pgTable(
  'node',
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull().unique(),
    description: text(),
    endpoint: text().notNull(),
    priority: integer().notNull(),
    capacity: integer('capacity').notNull(),
    isCordoned: boolean('is_cordoned').notNull(),
    groupId: uuid('group_id')
      .notNull()
      .references(() => nodeGroupTable.id),
    livesCnt: integer('lives_cnt').notNull(),
    failureCnt: integer('failure_cnt').notNull(),
    isDomestic: boolean('is_domestic').notNull(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at'),
    lastAssignedAt: timestamp('last_assigned_at'),
  },
  (t) => [
    uniqueIndex('node_name_idx').on(t.name),
    index('node_priority_idx').on(t.priority),
    index('node_lives_cnt_idx').on(t.livesCnt),
    index('node_last_assigned_at_idx').on(t.lastAssignedAt.nullsFirst()),
  ],
);

export const liveStreamTable = pgTable(
  'live_stream',
  {
    id: uuid().primaryKey().defaultRandom(),
    channelId: uuid('channel_id')
      .notNull()
      .references(() => channelTable.id),
    sourceId: text('source_id').notNull(),
    url: text('url').notNull(),
    params: text('params'),
    headers: text('headers').notNull(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
    checkedAt: timestamp('checked_at').notNull(),
  },
  (t) => [
    index('live_stream_channel_id_idx').on(t.channelId),
    index('live_stream_source_id_idx').on(t.sourceId),
    index('live_stream_checked_at_idx').on(t.checkedAt),
  ],
);

export const liveStatusEnum = ['initializing', 'recording', 'finalizing', 'deleted'] as const;

export const liveTable = pgTable(
  'live',
  {
    id: uuid().primaryKey().defaultRandom(),
    channelId: uuid('channel_id')
      .notNull()
      .references(() => channelTable.id),
    platformId: uuid('platform_id')
      .notNull()
      .references(() => platformTable.id),
    sourceId: text('source_id').notNull(),
    liveTitle: text('live_title').notNull(),
    liveDetails: text('live_details'),
    liveStreamId: uuid('live_stream_id').references(() => liveStreamTable.id),
    fsName: text('fs_name').notNull(),
    videoName: text('video_name').notNull(),
    viewCnt: integer('view_cnt').notNull(),
    isAdult: boolean('is_adult').notNull(),
    status: text('status', { enum: liveStatusEnum }).notNull(),
    isDisabled: boolean('is_disabled').notNull(),
    domesticOnly: boolean('domestic_only').notNull(),
    overseasFirst: boolean('overseas_first').notNull(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at'),
    deletedAt: timestamp('deleted_at'),
  },
  (t) => [
    index('live_channel_id_idx').on(t.channelId),
    index('live_live_stream_id_idx').on(t.liveStreamId),
    index('live_updated_at_idx').on(t.updatedAt),
  ],
);

export const liveNodeTable = pgTable(
  'live_node',
  {
    liveId: uuid('live_id')
      .notNull()
      .references(() => liveTable.id),
    nodeId: uuid('node_id')
      .notNull()
      .references(() => nodeTable.id),
    createdAt: timestamp('created_at').notNull(),
  },
  (t) => [
    primaryKey({
      name: 'live_node_id',
      columns: [t.liveId, t.nodeId],
    }),
  ],
);

export const liveCriterionTable = pgTable(
  'live_criterion',
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull().unique(),
    description: text(),
    platformId: uuid('platform_id')
      .notNull()
      .references(() => platformTable.id),
    isDeactivated: boolean('is_deactivated').notNull(),
    enforceCreds: boolean('enforce_creds').notNull(),
    adultOnly: boolean('adult_only').notNull(),
    domesticOnly: boolean('domestic_only').notNull(),
    overseasFirst: boolean('overseas_first').notNull(),
    loggingOnly: boolean('logging_only').notNull(),
    minUserCnt: integer('min_user_cnt').notNull(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (t) => [uniqueIndex('live_criterion_name_idx').on(t.name)],
);

export const liveCriterionRuleTable = pgTable(
  'live_criterion_rule',
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull().unique(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (t) => [uniqueIndex('live_criterion_rule_name_idx').on(t.name)],
);

export const liveCriterionUnitTable = pgTable('live_criterion_unit', {
  id: uuid().primaryKey().defaultRandom(),
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
