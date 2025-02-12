import { ColumnDef } from '@tanstack/react-table';
import {
  createSelectColumn,
  dateColumnDef,
  sortableColumnDef,
} from '@/components/common/table/column_utils.tsx';
import { LiveDto } from '@/client/live.types.ts';
import { getChannelUrl, getLiveUrl } from '@/lib/platform.ts';

export const selectCid = 'select';
export const viewCntCid = 'viewCnt';
export const createdAtCit = 'createdAt';

const channelColumn: ColumnDef<LiveDto> = {
  accessorKey: 'channel',
  header: 'Channel',
  cell: ({ row }) => {
    const live = row.original;
    return (
      <div className="font-medium my-1">
        <a href={getChannelUrl(live.platform.name, live.channel.pid)}>{live.channel.username}</a>
      </div>
    );
  },
  filterFn: (rows, _, filterValue) => {
    return rows.original.channel.username.includes(filterValue);
  },
};

const titleColumn: ColumnDef<LiveDto> = {
  accessorKey: 'title',
  header: 'Title',
  cell: ({ row }) => {
    const live = row.original;
    return (
      <div className="my-1">
        <a href={getLiveUrl(live.platform.name, live.channel.pid)}>{live.liveTitle}</a>
      </div>
    );
  },
  filterFn: (rows, _, filterValue) => {
    return rows.original.liveTitle.includes(filterValue);
  },
};

const nodeColumn: ColumnDef<LiveDto> = {
  accessorKey: 'node',
  header: 'Node',
  cell: ({ row }) => {
    const live = row.original;
    return <div className="my-1">{`${live.node?.name} (${live.node?.group?.name})`}</div>;
  },
  filterFn: (rows, _, filterValue) => {
    return rows.original.node?.name.includes(filterValue) ?? false;
  },
};

const platformColumn: ColumnDef<LiveDto> = {
  accessorKey: 'platform',
  header: 'Platform',
  cell: ({ row }) => {
    const live = row.original;
    return <div className="my-1 uppercase">{live.platform.name}</div>;
  },
  filterFn: (rows, _, filterValue) => {
    return rows.original.platform.name.includes(filterValue);
  },
};

export const liveColumns: ColumnDef<LiveDto>[] = [
  createSelectColumn(selectCid),
  platformColumn,
  channelColumn,
  titleColumn,
  sortableColumnDef(viewCntCid, 'Viewers'),
  dateColumnDef<LiveDto>(createdAtCit, 'Save Time', (elem) => new Date(elem.createdAt)),
  nodeColumn,
];
