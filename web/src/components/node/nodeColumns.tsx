import { ColumnDef } from '@tanstack/react-table';
import { NodeDto } from '@/client/node.schema.ts';
import { NodeActions } from '@/components/node/NodeActions.tsx';

export const nameCid = 'name';
export const weightCid = 'weight';

const nameColumn: ColumnDef<NodeDto> = {
  accessorKey: nameCid,
  header: () => <div className="ml-9 my-1">Name</div>,
  cell: ({ row }) => <div className="ml-9 my-1">{row.original.name}</div>,
};

const weightColumn: ColumnDef<NodeDto> = {
  accessorKey: weightCid,
  header: () => <div>Weight</div>,
  cell: ({ row }) => <div>{row.original.weight}</div>,
};

const chzzkColumn: ColumnDef<NodeDto> = {
  accessorKey: 'chzzk',
  header: 'Chzzk',
  cell: ({ row }) => {
    const node = row.original;
    const state = node.states?.find((s) => s.platform.name === 'chzzk');
    if (!state) {
      return <div>Not Found</div>;
    }
    const content = `${state.assigned} (${state.capacity})`;
    return <div>{content}</div>;
  },
};

const soopColumn: ColumnDef<NodeDto> = {
  accessorKey: 'soop',
  header: 'Soop',
  cell: ({ row }) => {
    const node = row.original;
    const state = node.states?.find((s) => s.platform.name === 'soop');
    if (!state) {
      return <div>Not Found</div>;
    }
    const content = `${state.assigned} (${state.capacity})`;
    return <div>{content}</div>;
  },
};

const groupColumn: ColumnDef<NodeDto> = {
  accessorKey: 'group',
  header: 'Group',
  cell: ({ row }) => {
    const name = row.original.group?.name;
    return <div>{name}</div>;
  },
};

const nodeTypeColumn: ColumnDef<NodeDto> = {
  accessorKey: 'type',
  header: 'Type',
  cell: ({ row }) => {
    const name = row.original.type.name;
    return <div>{name}</div>;
  },
};

const cordonedColumn: ColumnDef<NodeDto> = {
  accessorKey: 'isCordoned',
  header: () => <div className="justify-self-center">Cordoned</div>,
  cell: ({ row }) => {
    const value = row.original.isCordoned ? 'Yes' : 'No';
    return <div className="justify-self-center">{value}</div>;
  },
  meta: { header: { width: '10rem' } },
};

const actionColumn: ColumnDef<NodeDto> = {
  accessorKey: 'actions',
  header: () => <div className="justify-self-end mr-6">Actions</div>,
  cell: ({ row }) => {
    return (
      <div className="justify-self-end mr-8">
        <NodeActions node={row.original} />
      </div>
    );
  },
  meta: { header: { width: '10rem' } },
};

export const nodeColumns: ColumnDef<NodeDto>[] = [
  nameColumn,
  groupColumn,
  nodeTypeColumn,
  weightColumn,
  chzzkColumn,
  soopColumn,
  cordonedColumn,
  actionColumn,
];
