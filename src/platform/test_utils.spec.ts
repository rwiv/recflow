import { ChzzkFetcher } from './chzzk.fetcher.js';
import { Env } from '../common/env.js';
import { QueryConfig } from '../common/query.js';
import { SoopFetcher } from './soop.fetcher.js';
import { PlatformFetcher } from './fetcher.js';

export function createFetcher(env: Env, query: QueryConfig) {
  const chzzkFetcher = new ChzzkFetcher(env, query);
  const soopFetcher = new SoopFetcher(env, query);
  return new PlatformFetcher(chzzkFetcher, soopFetcher);
}
