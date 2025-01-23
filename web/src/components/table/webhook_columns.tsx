import { ColumnDef } from '@tanstack/react-table';
import { WebhookState } from '@/components/client/types.ts';
import {
  baseColumnDef,
  createSelectColumn,
} from '@/components/table/common/column_utils.tsx';

export const selectCid = 'select';
export const nameCid = 'name';
export const webhookTypeCid = 'type';

const chzzkColumn: ColumnDef<WebhookState> = {
  accessorKey: 'chzzk',
  header: 'Chzzk',
  cell: ({ row }) => {
    const wh = row.original;
    const content = `${wh.chzzkAssignedCnt} (${wh.chzzkCapacity})`;
    return <div>{content}</div>;
  },
};

const soopColumn: ColumnDef<WebhookState> = {
  accessorKey: 'soop',
  header: 'Soop',
  cell: ({ row }) => {
    const wh = row.original;
    const content = `${wh.soopAssignedCnt} (${wh.soopCapacity})`;
    return <div>{content}</div>;
  },
};

export const webhookColumns: ColumnDef<WebhookState>[] = [
  createSelectColumn(selectCid),
  baseColumnDef(nameCid, 'Name'),
  baseColumnDef(webhookTypeCid, 'Type'),
  chzzkColumn,
  soopColumn,
];
