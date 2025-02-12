import { z } from 'zod';
import { PlatformName } from '../../platform/spec/storage/platform.enum.schema.js';

export const exitCmd = z.enum(['delete', 'cancel', 'finish']);
export type ExitCmd = z.infer<typeof exitCmd>;

export interface ExitMessage {
  cmd: ExitCmd;
  platform: PlatformName;
  uid: string;
}
