import { PlatformType } from '../../platform/platform.types.js';

export type ExitCmd = 'delete' | 'cancel' | 'finish';

export interface ExitMessage {
  cmd: ExitCmd;
  platform: PlatformType;
  uid: string;
}
