import { ColumnDef } from '@tanstack/react-table';
import { NodeDto } from '@/client/node.schema.ts';
import { createSelectColumn } from '@/components/common/table/column_utils.tsx';
import { CordonedBadge } from '@/components/node/units/CordonedBadge.tsx';
import { NodeGroupBadge } from '@/components/node/units/GroupUpdateDialog.tsx';

const EDITABLE_WIDTH = '20rem';

const nameColumn: ColumnDef<NodeDto> = {
  accessorKey: 'name',
  header: () => <div className="justify-self-center">Name</div>,
  cell: ({ row }) => <div className="justify-self-center">{row.original.name}</div>,
  meta: { header: { width: EDITABLE_WIDTH } },
};

const groupColumn: ColumnDef<NodeDto> = {
  accessorKey: 'group',
  header: () => <div className="justify-self-center">Group</div>,
  cell: ({ row }) => <NodeGroupBadge node={row.original} />,
  meta: { header: { width: '10rem' } },
};

const nodeTypeColumn: ColumnDef<NodeDto> = {
  accessorKey: 'type',
  header: () => <div className="justify-self-center">Type</div>,
  cell: ({ row }) => {
    const name = row.original.type.name;
    return <div className="justify-self-center">{name}</div>;
  },
  meta: { header: { width: '10rem' } },
};

const weightColumn: ColumnDef<NodeDto> = {
  accessorKey: 'weight',
  header: () => <div className="justify-self-center">Weight</div>,
  cell: ({ row }) => <div className="justify-self-center">{row.original.weight}</div>,
  meta: { header: { width: EDITABLE_WIDTH } },
};

const chzzkColumn: ColumnDef<NodeDto> = {
  accessorKey: 'chzzk',
  header: () => <div className="justify-self-center">Chzzk</div>,
  cell: ({ row }) => {
    const node = row.original;
    const state = node.states?.find((s) => s.platform.name === 'chzzk');
    if (!state) {
      return <div className="justify-self-center">Not Found</div>;
    }
    const content = `${state.assigned} (${state.capacity})`;
    return <div className="justify-self-center">{content}</div>;
  },
  meta: { header: { width: EDITABLE_WIDTH } },
};

const soopColumn: ColumnDef<NodeDto> = {
  accessorKey: 'soop',
  header: () => <div className="justify-self-center">Soop</div>,
  cell: ({ row }) => {
    const node = row.original;
    const state = node.states?.find((s) => s.platform.name === 'soop');
    if (!state) {
      return <div className="justify-self-center">Not Found</div>;
    }
    const content = `${state.assigned} (${state.capacity})`;
    return <div className="justify-self-center">{content}</div>;
  },
  meta: { header: { width: EDITABLE_WIDTH } },
};

const cordonedColumn: ColumnDef<NodeDto> = {
  accessorKey: 'isCordoned',
  header: () => <div className="justify-self-center">Activated</div>,
  cell: ({ row }) => <CordonedBadge node={row.original} />,
};

export const nodeColumns: ColumnDef<NodeDto>[] = [
  createSelectColumn('select'),
  nameColumn,
  groupColumn,
  nodeTypeColumn,
  weightColumn,
  chzzkColumn,
  soopColumn,
  cordonedColumn,
];
