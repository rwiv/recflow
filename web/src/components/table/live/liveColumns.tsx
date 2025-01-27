import { ColumnDef } from '@tanstack/react-table';
import {
  baseColumnDef,
  createSelectColumn,
  dateColumnDef,
  sortableColumnDef,
} from '@/components/table/common/column_utils.tsx';
import { LiveRecord } from '@/client/types.ts';

export const selectCid = 'select';
export const platformTypeCid = 'type';
export const viewCntCid = 'viewCnt';
export const assignedWebhookNameCid = 'assignedWebhookName';
export const savedAtCit = 'savedAt';
export const openDateCit = 'openDate';

const channelColumn: ColumnDef<LiveRecord> = {
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

const titleColumn: ColumnDef<LiveRecord> = {
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

export const liveColumns: ColumnDef<LiveRecord>[] = [
  createSelectColumn(selectCid),
  baseColumnDef(platformTypeCid, 'Platform', 'uppercase'),
  channelColumn,
  titleColumn,
  sortableColumnDef(viewCntCid, 'Viewers'),
  dateColumnDef<LiveRecord>(savedAtCit, 'Saved Time', (elem) => new Date(elem.savedAt)),
  dateColumnDef<LiveRecord>(openDateCit, 'Open Time', (elem) => new Date(elem.openDate)),
  baseColumnDef(assignedWebhookNameCid, 'Webhook'),
];
