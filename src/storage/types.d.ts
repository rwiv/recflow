import { LiveInfo } from '../platform/live.js';

export interface TrackedRecord extends LiveInfo {
  savedAt: string;
  assignedWebhookName: string;
}

export interface DeletedRecord extends TrackedRecord {
  deletedAt: string;
}
