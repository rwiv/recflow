import { ColumnDef } from '@tanstack/react-table';
import { baseColumnDef, createSelectColumn } from '@/components/common/table/column_utils.tsx';
import { NodeRecord } from '@/client/node.schema.ts';

export const selectCid = 'select';
export const nameCid = 'name';
export const weightCid = 'weight';

const chzzkColumn: ColumnDef<NodeRecord> = {
  accessorKey: 'chzzk',
  header: 'Chzzk',
  cell: ({ row }) => {
    const node = row.original;
    const state = node.states?.find((s) => s.platform.name === 'chzzk');
    if (!state) {
      return <div>Not Found</div>;
    }
    const content = `${state.assigned} (${state.capacity})`;
    return <div className="m-1">{content}</div>;
  },
};

const soopColumn: ColumnDef<NodeRecord> = {
  accessorKey: 'soop',
  header: 'Soop',
  cell: ({ row }) => {
    const node = row.original;
    const state = node.states?.find((s) => s.platform.name === 'soop');
    if (!state) {
      return <div>Not Found</div>;
    }
    const content = `${state.assigned} (${state.capacity})`;
    return <div className="m-1">{content}</div>;
  },
};

const group: ColumnDef<NodeRecord> = {
  accessorKey: 'group',
  header: 'Group',
  cell: ({ row }) => {
    const name = row.original.group?.name;
    return <div className="m-1">{name}</div>;
  },
};

const nodeType: ColumnDef<NodeRecord> = {
  accessorKey: 'type',
  header: 'Type',
  cell: ({ row }) => {
    const name = row.original.type.name;
    return <div className="m-1">{name}</div>;
  },
};

export const nodeColumns: ColumnDef<NodeRecord>[] = [
  createSelectColumn(selectCid),
  baseColumnDef(nameCid, 'Name'),
  group,
  nodeType,
  baseColumnDef(weightCid, 'Weight'),
  chzzkColumn,
  soopColumn,
];
