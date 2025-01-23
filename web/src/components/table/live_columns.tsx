import { ColumnDef } from '@tanstack/react-table';
import {
  baseColumnDef,
  createSelectColumn,
  sortableColumnDef,
} from '@/components/table/common/column_utils.tsx';
import { LiveInfo } from '@/components/client/types.ts';

export const selectCid = 'select';
export const platformTypeCid = 'type';
export const channelIdCid = 'channelId';
export const channelNameCid = 'channelName';
export const liveTitleCid = 'liveTitle';
export const viewCntCid = 'viewCnt';
export const assignedWebhookNameCid = 'assignedWebhookName';

export const liveColumns: ColumnDef<LiveInfo>[] = [
  createSelectColumn(selectCid),
  baseColumnDef(platformTypeCid, 'Platform'),
  baseColumnDef(channelIdCid, 'ID'),
  baseColumnDef(channelNameCid, 'Channel'),
  baseColumnDef(liveTitleCid, 'Title'),
  sortableColumnDef(viewCntCid, 'Viewers'),
  baseColumnDef(assignedWebhookNameCid, 'Webhook'),
];
