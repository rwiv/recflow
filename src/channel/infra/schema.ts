import { char, integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const channels = pgTable('channels', {
  id: char({ length: 32 }).primaryKey().notNull(),
  ptype: varchar({ length: 255 }).notNull(),
  pid: varchar({ length: 255 }).notNull(),
  username: varchar({ length: 255 }).notNull(),
  followerCount: integer().notNull(),
  priority: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp(),
});
