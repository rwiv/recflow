import { z } from 'zod';
import { platformNameEnum } from '../../platform/spec/storage/platform.enum.schema.js';

export const stdlDoneStatusEnum = z.enum(['complete', 'canceled']);
export type StdlDoneStatus = z.infer<typeof stdlDoneStatusEnum>;

export const stdlDoneMessage = z.object({
  status: stdlDoneStatusEnum,
  platform: platformNameEnum,
  uid: z.string().nonempty(),
  videoName: z.string().nonempty(),
  fsName: z.string().nonempty(),
});

export type StdlDoneMessage = z.infer<typeof stdlDoneMessage>;

export interface Vtask {
  addTask(doneMessage: StdlDoneMessage): Promise<void>;
}
