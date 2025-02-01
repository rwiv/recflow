import { char, integer, pgTable, primaryKey, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const channels = pgTable('channels', {
  id: char({ length: 32 }).primaryKey(),
  ptype: varchar({ length: 255 }).notNull(),
  pid: varchar({ length: 255 }).notNull(),
  username: varchar({ length: 255 }).notNull(),
  followerCount: integer().notNull(),
  description: text(),
  priority: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp(),
});

export const tags = pgTable('tags', {
  id: char({ length: 32 }).primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp(),
});

export const channelsToTags = pgTable(
  'channels_to_tags',
  {
    channelId: char('channel_id', { length: 32 })
      .notNull()
      .references(() => channels.id),
    tagId: char('tag_id', { length: 32 })
      .notNull()
      .references(() => tags.id),
  },
  (t) => ({
    pk: primaryKey({
      name: 'id',
      columns: [t.channelId, t.tagId],
    }),
  }),
);
