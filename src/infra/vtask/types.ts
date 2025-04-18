import { z } from 'zod';
import { platformNameEnum } from '../../platform/spec/storage/platform.enum.schema.js';

const stdlDoneStatusEnum = z.enum(['complete', 'canceled']);

const stdlDoneMessage = z.object({
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
