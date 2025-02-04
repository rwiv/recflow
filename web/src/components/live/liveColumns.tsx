import { ColumnDef } from '@tanstack/react-table';
import {
  baseColumnDef,
  createSelectColumn,
  dateColumnDef,
  sortableColumnDef,
} from '@/components/common/table/column_utils.tsx';
import { LiveRecord } from '@/client/types.live.ts';
import { getChannelUrl, getLiveUrl } from '@/lib/platform.ts';

export const selectCid = 'select';
export const platformTypeCid = 'type';
export const viewCntCid = 'viewCnt';
export const assignedWebhookNameCid = 'assignedWebhookName';
export const savedAtCit = 'savedAt';

const channelColumn: ColumnDef<LiveRecord> = {
  accessorKey: 'channel',
  header: 'Channel',
  cell: ({ row }) => {
    const live = row.original;
    return (
      <div className="font-medium my-1">
        <a href={getChannelUrl(live.type, live.channelId)}>{live.channelName}</a>
      </div>
    );
  },
};

const titleColumn: ColumnDef<LiveRecord> = {
  accessorKey: 'title',
  header: 'Title',
  cell: ({ row }) => {
    const live = row.original;
    return (
      <div className="my-1">
        <a href={getLiveUrl(live.type, live.channelId)}>{live.liveTitle}</a>
      </div>
    );
  },
};

export const liveColumns: ColumnDef<LiveRecord>[] = [
  createSelectColumn(selectCid),
  baseColumnDef(platformTypeCid, 'Platform', 'uppercase'),
  channelColumn,
  titleColumn,
  sortableColumnDef(viewCntCid, 'Viewers'),
  dateColumnDef<LiveRecord>(savedAtCit, 'Save Time', (elem) => new Date(elem.savedAt)),
  baseColumnDef(assignedWebhookNameCid, 'Node'),
];
