import { ChzzkFetcher } from '../fetcher/chzzk.fetcher.js';
import { Env } from '../../common/env.js';
import { QueryConfig } from '../../common/query.js';
import { SoopFetcher } from '../fetcher/soop.fetcher.js';
import { PlatformFetcher } from '../fetcher/fetcher.js';

export function createFetcher(env: Env, query: QueryConfig) {
  const chzzkFetcher = new ChzzkFetcher(env, query);
  const soopFetcher = new SoopFetcher(env, query);
  return new PlatformFetcher(chzzkFetcher, soopFetcher);
}
