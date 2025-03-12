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
import { Badge } from '@/components/ui/badge.tsx';

export const selectCid = 'select';
export const viewCntCid = 'viewCnt';

const DISABLED_CN = 'opacity-40';
const DEFAULT_WIDTH = '15rem';

const channelColumn: ColumnDef<LiveDto> = {
  accessorKey: 'channel',
  header: () => <div className="">Channel</div>,
  cell: ({ row }) => {
    const live = row.original;
    return <ChannelInfoCell channel={live.channel} className={live.isDisabled ? DISABLED_CN : undefined} />;
  },
  filterFn: (rows, _, filterValue) => {
    return rows.original.channel.username.includes(filterValue);
  },
  meta: { header: { width: DEFAULT_WIDTH } },
};

const priorityColumn: ColumnDef<LiveDto> = {
  accessorKey: 'priority',
  header: () => <div className="ml-1">Priority</div>,
  cell: ({ row }) => (
    <button className="uppercase">
      <Badge variant="default">{row.original.channel.priority.name}</Badge>
    </button>
  ),
  filterFn: (rows, _, filterValue) => {
    return rows.original.channel.priority.name.includes(filterValue);
  },
  meta: { header: { width: '9rem' } },
};

const titleColumn: ColumnDef<LiveDto> = {
  accessorKey: 'title',
  header: 'Title',
  cell: ({ row }) => {
    const live = row.original;
    return (
      <div className={cn('my-1', live.isDisabled && DISABLED_CN)}>
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
  header: () => <div className="justify-self-center">Node</div>,
  cell: ({ row }) => {
    const live = row.original;
    return (
      <div className={cn('my-1 justify-self-center', live.isDisabled && DISABLED_CN)}>
        {live.node ? `${live.node.name} (${live.node.group?.name})` : '-'}
      </div>
    );
  },
  filterFn: (rows, _, filterValue) => {
    return rows.original.node?.name.includes(filterValue) ?? false;
  },
  meta: { header: { width: DEFAULT_WIDTH } },
};

export const liveColumns: ColumnDef<LiveDto>[] = [
  createSelectColumn(selectCid),
  channelColumn,
  priorityColumn,
  titleColumn,
  sortableColumnDef(viewCntCid, 'Viewers', (live) => (live.isDisabled ? DISABLED_CN : undefined)),
  dateColumnDef<LiveDto>(
    'createdAt',
    'CreatedAt',
    (elem) => new Date(elem.createdAt),
    DEFAULT_WIDTH,
    (live) => (live.isDisabled ? DISABLED_CN : undefined),
  ),
  nodeColumn,
];
