import { z } from 'zod';
import {
  nodeEnt,
  nodeEntAppend,
  nodeGroupEnt,
  nodeStateEnt,
} from '../persistence/node.persistence.schema.js';
import { nodeTypeEnum, nodeTypeRecord } from '../node.schema.js';
import {
  platformRecord,
  platformTypeEnum,
} from '../../platform/storage/platform.business.schema.js';

export const nodeState = nodeStateEnt
  .omit({ platformId: true })
  .extend({ platform: platformRecord });
export type NodeState = z.infer<typeof nodeState>;

export const nodeRecord = nodeEnt.omit({ typeId: true }).extend({
  type: nodeTypeRecord,
  group: nodeGroupEnt.optional(),
  states: z.array(nodeState).optional(),
});
export type NodeRecord = z.infer<typeof nodeRecord>;

export const nodeAppend = nodeEntAppend.omit({ typeId: true }).extend({
  typeName: nodeTypeEnum,
  capacities: z.array(
    z.object({
      platformName: platformTypeEnum,
      capacity: z.number().nonnegative(),
    }),
  ),
});
export type NodeAppend = z.infer<typeof nodeAppend>;

export const nodeGroup = nodeGroupEnt;
export type NodeGroup = z.infer<typeof nodeGroup>;
