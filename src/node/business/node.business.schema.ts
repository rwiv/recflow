import { z } from 'zod';
import {
  nodeEnt,
  nodeEntAppend,
  nodeGroupEnt,
  nodeStateEnt,
} from '../persistence/node.persistence.schema.js';
import { nodeTypeEnum } from '../node.schema.js';
import { platformTypeEnum } from '../../platform/platform.schema.js';

const nodeState = nodeStateEnt
  .omit({ platformId: true })
  .extend({ platformName: platformTypeEnum });
export type NodeState = z.infer<typeof nodeState>;

export const nodeRecord = nodeEnt.omit({ typeId: true }).extend({
  typeName: nodeTypeEnum,
  group: nodeGroupEnt.optional(),
  states: z.array(nodeState).optional(),
});
export type NodeRecord = z.infer<typeof nodeRecord>;

export const nodeAppend = nodeEntAppend.omit({typeId: true}).extend({
  typeName: nodeTypeEnum,
  capacities: z.array(
    z.object({
      platformName: z.string().nonempty(),
      capacity: z.number().nonnegative(),
    }),
  ),
});
export type NodeAppend = z.infer<typeof nodeAppend>;

const nodeGroup = nodeGroupEnt;
export type NodeGroup = z.infer<typeof nodeGroup>;
