import { ColumnDef } from '@tanstack/react-table';
import {
  createSelectColumn,
  dateColumnDef,
  sortableColumnDef,
} from '@/components/common/table/column_utils.tsx';
import { getLiveUrl } from '@/lib/platform.ts';
import { cn } from '@/lib/utils.ts';
import { ChannelInfoCell } from '@/components/channel/content/ChannelInfoCell.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { LiveDtoWithNodes } from '@/client/live/live.mapped.schema.ts';

export const selectCid = 'select';
export const viewCntCid = 'viewCnt';

const DISABLED_CN = 'opacity-40';
const DEFAULT_WIDTH = '10rem';
const CHANNEL_WIDTH = '15rem';
const PRIORITY_WIDTH = '9rem';
const NODES_WIDTH = '18rem';

const channelColumn: ColumnDef<LiveDtoWithNodes> = {
  accessorKey: 'channel',
  header: () => <div className="">Channel</div>,
  cell: ({ row }) => {
    const live = row.original;
    return <ChannelInfoCell channel={live.channel} className={live.isDisabled ? DISABLED_CN : undefined} />;
  },
  filterFn: (rows, _, filterValue) => {
    return rows.original.channel.username.includes(filterValue);
  },
  meta: { header: { width: CHANNEL_WIDTH } },
};

const priorityColumn: ColumnDef<LiveDtoWithNodes> = {
  accessorKey: 'priority',
  header: () => <div className="ml-1">Grade</div>,
  cell: ({ row }) => (
    <button className="uppercase">
      <Badge variant="default">{row.original.channel.priority.name}</Badge>
    </button>
  ),
  filterFn: (rows, _, filterValue) => {
    return rows.original.channel.priority.name.includes(filterValue);
  },
  meta: { header: { width: PRIORITY_WIDTH } },
};

const titleColumn: ColumnDef<LiveDtoWithNodes> = {
  accessorKey: 'title',
  header: 'Title',
  cell: ({ row }) => {
    const live = row.original;
    return (
      <div className={cn('my-1', live.isDisabled && DISABLED_CN)}>
        <a href={getLiveUrl(live.platform.name, live.channel.sourceId)}>{live.liveTitle}</a>
      </div>
    );
  },
  filterFn: (rows, _, filterValue) => {
    return rows.original.liveTitle.includes(filterValue);
  },
};

const nodeColumn: ColumnDef<LiveDtoWithNodes> = {
  accessorKey: 'nodes',
  header: () => <div className="justify-self-center">Nodes</div>,
  cell: ({ row }) => {
    const live = row.original;
    const nodes = row.original.nodes;
    if (!nodes) {
      return <div>null</div>;
    }
    return nodes.map((node) => {
      return (
        <span key={node.id} className={cn('my-1 mx-1 justify-self-center', live.isDisabled && DISABLED_CN)}>
          <Badge variant="outline" className="cursor-pointer">
            {node.name}
          </Badge>
        </span>
      );
    });
  },
  meta: { header: { width: NODES_WIDTH } },
};

export const liveColumns: ColumnDef<LiveDtoWithNodes>[] = [
  createSelectColumn(selectCid),
  channelColumn,
  priorityColumn,
  titleColumn,
  sortableColumnDef(
    viewCntCid,
    'Viewers',
    (live) => (live.isDisabled ? DISABLED_CN : undefined),
    DEFAULT_WIDTH,
  ),
  dateColumnDef<LiveDtoWithNodes>(
    'createdAt',
    'CreatedAt',
    (elem) => new Date(elem.createdAt),
    DEFAULT_WIDTH,
    (live) => (live.isDisabled ? DISABLED_CN : undefined),
  ),
  nodeColumn,
];
