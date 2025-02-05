import { NodeType } from '@/common/enum.types.ts';

export interface NodeRecord {
  name: string;
  type: NodeType;
  url: string;
  chzzkCapacity: number;
  soopCapacity: number;
  chzzkAssignedCnt: number;
  soopAssignedCnt: number;
}
