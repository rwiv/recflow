import { LiveInfo } from '../platform/live.js';

export interface TrackedRecord extends LiveInfo {
  assignedWebhookName: string;
}
