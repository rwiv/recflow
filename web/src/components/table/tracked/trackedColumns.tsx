import { ColumnDef } from '@tanstack/react-table';
import {
  baseColumnDef,
  createSelectColumn,
  sortableColumnDef,
} from '@/components/table/common/column_utils.tsx';
import { TrackedRecord } from '@/client/types.ts';
import { dateToTimestamp } from '@/lib/date.ts';
import { Button } from '@/components/ui/button.tsx';
import { ArrowUpDown } from 'lucide-react';

export const selectCid = 'select';
export const platformTypeCid = 'type';
export const viewCntCid = 'viewCnt';
export const assignedWebhookNameCid = 'assignedWebhookName';
export const savedAtCit = 'savedAt';

const channelColumn: ColumnDef<TrackedRecord> = {
  accessorKey: 'channel',
  header: 'Channel',
  cell: ({ row }) => {
    const live = row.original;
    let url = '';
    if (live.type === 'chzzk') {
      url = `https://chzzk.naver.com/${live.channelId}`;
    } else if (live.type === 'soop') {
      url = `https://ch.sooplive.co.kr/${live.channelId}`;
    } else {
      throw new Error(`Not supported channel type: ${live.type}`);
    }
    return (
      <div className="font-medium my-1">
        <a href={url}>{live.channelName}</a>
      </div>
    );
  },
};

const titleColumn: ColumnDef<TrackedRecord> = {
  accessorKey: 'title',
  header: 'Title',
  cell: ({ row }) => {
    const live = row.original;
    let url = '';
    if (live.type === 'chzzk') {
      url = `https://chzzk.naver.com/live/${live.channelId}`;
    } else if (live.type === 'soop') {
      url = `https://play.sooplive.co.kr/${live.channelId}`;
    } else {
      throw new Error(`Not supported channel type: ${live.type}`);
    }
    return (
      <div className="my-1">
        <a href={url}>{live.liveTitle}</a>
      </div>
    );
  },
};

const savedAtColumn: ColumnDef<TrackedRecord> = {
  accessorKey: savedAtCit,
  header: ({ column }) => {
    return (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Saved At
        <ArrowUpDown />
      </Button>
    );
  },
  cell: ({ row }) => {
    const live = row.original;
    const date = new Date(live.savedAt);
    return <div>{dateToTimestamp(date)}</div>;
  },
  sortingFn: (rowA, rowB, _) => {
    const dateA = new Date(rowA.original.savedAt);
    const dateB = new Date(rowB.original.savedAt);
    return dateA.getTime() - dateB.getTime(); // Ascending
  },
};

export const trackedColumns: ColumnDef<TrackedRecord>[] = [
  createSelectColumn(selectCid),
  baseColumnDef(platformTypeCid, 'Platform', 'uppercase'),
  channelColumn,
  titleColumn,
  sortableColumnDef(viewCntCid, 'Viewers'),
  baseColumnDef(assignedWebhookNameCid, 'Webhook'),
  savedAtColumn,
];
