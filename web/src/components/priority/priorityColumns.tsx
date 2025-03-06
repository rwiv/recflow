import { ColumnDef } from '@tanstack/react-table';
import { createSelectColumn } from '@/components/common/table/column_utils.tsx';
import { PriorityDto } from '@/client/channel/channel.types.ts';

const EDITABLE_WIDTH = '15rem';

const nameColumn: ColumnDef<PriorityDto> = {
  accessorKey: 'name',
  header: () => <div className="justify-self-center">Name</div>,
  cell: ({ row }) => <div className="justify-self-center">{row.original.name}</div>,
  meta: { header: { width: EDITABLE_WIDTH } },
};

const tierColumn: ColumnDef<PriorityDto> = {
  accessorKey: 'tier',
  header: () => <div className="justify-self-center">Tier</div>,
  cell: ({ row }) => <div className="justify-self-center">{row.original.tier}</div>,
  meta: { header: { width: EDITABLE_WIDTH } },
};

const descriptionColumn: ColumnDef<PriorityDto> = {
  accessorKey: 'description',
  header: () => <div className="justify-self-center">Description</div>,
  cell: ({ row }) => <div className="justify-self-center">{row.original.description}</div>,
};

const seqColumn: ColumnDef<PriorityDto> = {
  accessorKey: 'seq',
  header: () => <div className="justify-self-center">Seq</div>,
  cell: ({ row }) => <div className="justify-self-center">{row.original.seq}</div>,
  meta: { header: { width: EDITABLE_WIDTH } },
};

export const priorityColumns: ColumnDef<PriorityDto>[] = [
  createSelectColumn('select'),
  nameColumn,
  tierColumn,
  descriptionColumn,
  seqColumn,
];
