import { LiveInfo } from '../../platform/wapper/live.js';

export interface TrackedRecord extends LiveInfo {
  savedAt: string;
  updatedAt: string | undefined;
  deletedAt: string | undefined;
  isDeleted: boolean;
  assignedWebhookName: string;
}
