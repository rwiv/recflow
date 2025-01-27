import { ColumnDef } from '@tanstack/react-table';
import {
  baseColumnDef,
  createSelectColumn,
  sortableColumnDef,
} from '@/components/table/common/column_utils.tsx';
import { TrackedRecord } from '@/client/types.ts';

export const selectCid = 'select';
export const platformTypeCid = 'type';
export const viewCntCid = 'viewCnt';
export const assignedWebhookNameCid = 'assignedWebhookName';

const channelColumn: ColumnDef<TrackedRecord> = {
  accessorKey: 'channel',
  header: 'Channel',
  cell: ({ row }) => {
    const chan = row.original;
    let url = '';
    if (chan.type === 'chzzk') {
      url = `https://chzzk.naver.com/${chan.channelId}`;
    } else if (chan.type === 'soop') {
      url = `https://ch.sooplive.co.kr/${chan.channelId}`;
    } else {
      throw new Error(`Not supported channel type: ${chan.type}`);
    }
    return (
      <div className="font-medium my-1">
        <a href={url}>{chan.channelName}</a>
      </div>
    );
  },
};

const titleColumn: ColumnDef<TrackedRecord> = {
  accessorKey: 'title',
  header: 'Title',
  cell: ({ row }) => {
    const chan = row.original;
    let url = '';
    if (chan.type === 'chzzk') {
      url = `https://chzzk.naver.com/live/${chan.channelId}`;
    } else if (chan.type === 'soop') {
      url = `https://play.sooplive.co.kr/${chan.channelId}`;
    } else {
      throw new Error(`Not supported channel type: ${chan.type}`);
    }
    return (
      <div className="my-1">
        <a href={url}>{chan.liveTitle}</a>
      </div>
    );
  },
};

export const trackedColumns: ColumnDef<TrackedRecord>[] = [
  createSelectColumn(selectCid),
  baseColumnDef(platformTypeCid, 'Platform', 'uppercase'),
  channelColumn,
  titleColumn,
  sortableColumnDef(viewCntCid, 'Viewers'),
  baseColumnDef(assignedWebhookNameCid, 'Webhook'),
];
