import { ColumnDef } from '@tanstack/react-table';
import {
  createSelectColumn,
  dateColumnDef,
  sortableColumnDef,
} from '@/components/common/table/column_utils.tsx';
import { LiveDto } from '@/client/live/live.types.ts';
import { getLiveUrl } from '@/lib/platform.ts';
import { cn } from '@/lib/utils.ts';
import { ChannelInfoCell } from '@/components/channel/content/ChannelInfoCell.tsx';

export const selectCid = 'select';
export const viewCntCid = 'viewCnt';
export const createdAtCit = 'createdAt';

const disabledCn = 'opacity-40';

const channelColumn: ColumnDef<LiveDto> = {
  accessorKey: 'channel',
  header: 'Channel',
  cell: ({ row }) => {
    const live = row.original;
    return <ChannelInfoCell channel={live.channel} className={live.isDisabled ? disabledCn : undefined} />;
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
      <div className={cn('my-1', live.isDisabled && disabledCn)}>
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
    return (
      <div className={cn('my-1', live.isDisabled && disabledCn)}>
        {`${live.node?.name} (${live.node?.group?.name})`}
      </div>
    );
  },
  filterFn: (rows, _, filterValue) => {
    return rows.original.node?.name.includes(filterValue) ?? false;
  },
};

export const liveColumns: ColumnDef<LiveDto>[] = [
  createSelectColumn(selectCid),
  channelColumn,
  titleColumn,
  sortableColumnDef(viewCntCid, 'Viewers', (live) => (live.isDisabled ? disabledCn : undefined)),
  dateColumnDef<LiveDto>(
    createdAtCit,
    'Save Time',
    (elem) => new Date(elem.createdAt),
    (live) => (live.isDisabled ? disabledCn : undefined),
  ),
  nodeColumn,
];
