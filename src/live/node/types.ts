import { LiveInfo } from '../../platform/wapper/live.js';

export type NodePriority = 'main' | 'sub' | 'extra';
export type NodeSelectMode = 'mode1' | 'mode2' | 'mode3' | 'mode4';

export interface NodeDef {
  name: string;
  type: NodePriority;
  url: string;
  chzzkCapacity: number;
  soopCapacity: number;
}

export interface NodeRecord extends NodeDef {
  chzzkAssignedCnt: number;
  soopAssignedCnt: number;
}

export interface INodeSelector {
  match(live: LiveInfo, webhooks: NodeRecord[]): NodeRecord | null;
}
