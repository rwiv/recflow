import { z } from 'zod';
import {
  nodeEnt,
  nodeEntAppend,
  nodeGroupEnt,
  nodeStateEnt,
  nodeTypeEnt,
} from '../storage/node.entity.schema.js';
import { nodeTypeNameEnum } from './node.enum.schema.js';
import { platformNameEnum } from '../../platform/spec/storage/platform.enum.schema.js';
import { platformDto } from '../../platform/spec/storage/platform.dto.schema.js';

export const nodeStateDto = nodeStateEnt.omit({ platformId: true }).extend({ platform: platformDto });
export type NodeStateDto = z.infer<typeof nodeStateDto>;

export const nodeTypeDto = nodeTypeEnt;
export type NodeTypeDto = z.infer<typeof nodeTypeDto>;

export const nodeDto = nodeEnt.omit({ typeId: true }).extend({
  type: nodeTypeDto,
  group: nodeGroupEnt.optional(),
  states: z.array(nodeStateDto).optional(),
});
export type NodeDto = z.infer<typeof nodeDto>;

export const nodeAppend = nodeEntAppend.omit({ typeId: true }).extend({
  typeName: nodeTypeNameEnum,
  capacities: z.array(
    z.object({
      platformName: platformNameEnum,
      capacity: z.number().nonnegative(),
    }),
  ),
});
export type NodeAppend = z.infer<typeof nodeAppend>;

export const nodeGroupDto = nodeGroupEnt;
export type NodeGroupDto = z.infer<typeof nodeGroupDto>;
