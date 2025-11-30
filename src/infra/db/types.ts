import { ExtractTablesWithRelations } from 'drizzle-orm';
import { NodePgDatabase, NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import { PgTransaction } from 'drizzle-orm/pg-core';

export type Tx =
  | PgTransaction<NodePgQueryResultHKT, Record<string, never>, ExtractTablesWithRelations<Record<string, never>>>
  | NodePgDatabase;
