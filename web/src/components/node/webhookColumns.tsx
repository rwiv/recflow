import { ColumnDef } from '@tanstack/react-table';
import { NodeRecord } from '@/client/types.ts';
import { baseColumnDef, createSelectColumn } from '@/components/common/table/column_utils.tsx';

export const selectCid = 'select';
export const nameCid = 'name';
export const webhookTypeCid = 'type';

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

export const webhookColumns: ColumnDef<NodeRecord>[] = [
  createSelectColumn(selectCid),
  baseColumnDef(nameCid, 'Name'),
  baseColumnDef(webhookTypeCid, 'Type', 'uppercase'),
  chzzkColumn,
  soopColumn,
];
