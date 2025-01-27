import { PlatformType } from '../../platform/types.js';

export type ExitCmd = 'delete' | 'cancel';

export interface ExitMessage {
  cmd: ExitCmd;
  platform: PlatformType;
  uid: string;
}
