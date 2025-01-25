import { LiveInfo } from '../../platform/live.js';

export interface LiveFilter {
  getFiltered(infos: LiveInfo[]): Promise<LiveInfo[]>;
}
