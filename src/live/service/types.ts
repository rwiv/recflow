import { LiveInfo } from '../../platform/wapper/live.js';

export interface LiveRecord extends LiveInfo {
  savedAt: string;
  updatedAt: string | undefined;
  deletedAt: string | undefined;
  isDeleted: boolean;
  assignedWebhookName: string;
}
