import { ColumnDef } from '@tanstack/react-table';
import { baseColumnDef, createSelectColumn } from '@/components/common/table/column_utils.tsx';
import { NodeRecord } from '@/client/types.node.ts';

export const selectCid = 'select';
export const nameCid = 'name';
export const nodeTypeCid = 'type';

const chzzkColumn: ColumnDef<NodeRecord> = {
  accessorKey: 'chzzk',
  header: 'Chzzk',
  cell: ({ row }) => {
    const wh = row.original;
    const content = `${wh.chzzkAssignedCnt} (${wh.chzzkCapacity})`;
    return <div className="m-1">{content}</div>;
  },
};

const soopColumn: ColumnDef<NodeRecord> = {
  accessorKey: 'soop',
  header: 'Soop',
  cell: ({ row }) => {
    const wh = row.original;
    const content = `${wh.soopAssignedCnt} (${wh.soopCapacity})`;
    return <div className="m-1">{content}</div>;
  },
};

export const nodeColumns: ColumnDef<NodeRecord>[] = [
  createSelectColumn(selectCid),
  baseColumnDef(nameCid, 'Name'),
  baseColumnDef(nodeTypeCid, 'Type', 'uppercase'),
  chzzkColumn,
  soopColumn,
];
