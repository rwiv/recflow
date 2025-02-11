import { LiveInfo } from '../../../platform/data/wapper/live.js';

export interface LiveFilter {
  getFiltered(infos: LiveInfo[]): Promise<LiveInfo[]>;
}
