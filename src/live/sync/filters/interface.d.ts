import { LiveInfo } from '../../../platform/wapper/live.js';

export interface LiveFilter {
  getFiltered(infos: LiveInfo[]): Promise<LiveInfo[]>;
}
