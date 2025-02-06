import {defineConfig} from 'drizzle-kit';
import dotenv from "dotenv";

dotenv.config({ path: 'dev/.env' });
const url = getPgUrl();

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/infra/db/schema.ts',
  dbCredentials: { url },
});

function getPgUrl() {
  const host = process.env.PG_HOST;
  const portStr = process.env.PG_PORT;
  const database = process.env.PG_DATABASE;
  const username = process.env.PG_USERNAME;
  const password = process.env.PG_PASSWORD;
  if (
    host === undefined ||
    portStr === undefined ||
    database === undefined ||
    username === undefined ||
    password === undefined
  ) {
    throw Error('pg data is undefined');
  }
  const port = parseInt(portStr);
  if (isNaN(port)) throw Error('pgPort is NaN');
  return `postgres://${username}:${password}@${host}:${port}/${database}`;
}
