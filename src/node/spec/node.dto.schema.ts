import { z } from 'zod';
import { nodeEnt, nodeEntAppend, nodeEntUpdate, nodeGroupEnt } from './node.entity.schema.js';

export const nodeDto = nodeEnt.extend({
  group: nodeGroupEnt.optional(),
});
export type NodeDto = z.infer<typeof nodeDto>;

export const nodeUpdate = nodeEntUpdate;
export type NodeUpdate = z.infer<typeof nodeUpdate>;

export const nodeAppend = nodeEntAppend;
export type NodeAppend = z.infer<typeof nodeAppend>;

export const nodeGroupDto = nodeGroupEnt;
export type NodeGroupDto = z.infer<typeof nodeGroupDto>;

export interface NodeFieldsReq {
  group?: boolean;
  lives?: boolean;
}
