import { z } from 'zod';
import { PlatformType } from '../../platform/platform.types.js';

export const exitCmd = z.enum(['delete', 'cancel', 'finish']);
export type ExitCmd = z.infer<typeof exitCmd>;

export interface ExitMessage {
  cmd: ExitCmd;
  platform: PlatformType;
  uid: string;
}
