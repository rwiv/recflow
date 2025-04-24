import { z } from 'zod';
import { nodeEnt, nodeEntAppend, nodeEntUpdate, nodeGroupEnt, nodeTypeEnt } from './node.entity.schema.js';
import { nodeTypeNameEnum } from './node.enum.schema.js';

export const nodeTypeDto = nodeTypeEnt;
export type NodeTypeDto = z.infer<typeof nodeTypeDto>;

export const nodeDto = nodeEnt.omit({ typeId: true }).extend({
  type: nodeTypeDto,
  group: nodeGroupEnt.optional(),
});
export type NodeDto = z.infer<typeof nodeDto>;

export const nodeUpdate = nodeEntUpdate;
export type NodeUpdate = z.infer<typeof nodeUpdate>;

export const nodeAppend = nodeEntAppend.omit({ typeId: true }).extend({
  typeName: nodeTypeNameEnum,
});
export type NodeAppend = z.infer<typeof nodeAppend>;

export const nodeGroupDto = nodeGroupEnt;
export type NodeGroupDto = z.infer<typeof nodeGroupDto>;

export interface NodeFieldsReq {
  group?: boolean;
  lives?: boolean;
}
