import { ChzzkFetcher } from '../../platform/fetcher/chzzk.fetcher.js';
import { SoopFetcher } from '../../platform/fetcher/soop.fetcher.js';
import { PlatformFetcher } from '../../platform/fetcher/fetcher.js';
import { getConf } from '../../common/helpers.js';

const [env, query] = getConf();

export function getFetcher() {
  const chzzkFetcher = new ChzzkFetcher(env, query);
  const soopFetcher = new SoopFetcher(env, query);
  return new PlatformFetcher(chzzkFetcher, soopFetcher);
}
