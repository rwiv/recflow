import { LiveInfo } from '../../../platform/spec/wapper/live.js';

export interface LiveFilter {
  getFiltered(infos: LiveInfo[]): Promise<LiveInfo[]>;
}
