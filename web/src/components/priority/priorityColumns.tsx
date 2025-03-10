import { ColumnDef } from '@tanstack/react-table';
import { createSelectColumn, dateColumnDef } from '@/components/common/table/column_utils.tsx';
import { NotifyOnlyBadge } from '@/components/priority/units/NotifyOnlyBadge.tsx';
import { PriorityFieldUpdateForm } from '@/components/priority/units/PriorityFieldUpdateForm.tsx';
import { PriorityDto } from '@/client/channel/priority.schema.ts';

const EDITABLE_WIDTH = '12rem';
const DEFAULT_WIDTH = '11rem';

const nameColumn: ColumnDef<PriorityDto> = {
  accessorKey: 'name',
  header: () => <div className="justify-self-center">Name</div>,
  cell: ({ row }) => <PriorityFieldUpdateForm type="name" priority={row.original} />,
  meta: { header: { width: EDITABLE_WIDTH } },
};

const tierColumn: ColumnDef<PriorityDto> = {
  accessorKey: 'tier',
  header: () => <div className="justify-self-center">Tier</div>,
  cell: ({ row }) => <PriorityFieldUpdateForm type="tier" priority={row.original} />,
  meta: { header: { width: EDITABLE_WIDTH } },
};

const descriptionColumn: ColumnDef<PriorityDto> = {
  accessorKey: 'description',
  header: () => <div className="justify-self-center">Description</div>,
  cell: ({ row }) => <PriorityFieldUpdateForm type="description" priority={row.original} />,
};

const seqColumn: ColumnDef<PriorityDto> = {
  accessorKey: 'seq',
  header: () => <div className="justify-self-center">Seq</div>,
  cell: ({ row }) => <PriorityFieldUpdateForm type="seq" priority={row.original} />,
  meta: { header: { width: EDITABLE_WIDTH } },
};

const notifyOnlyColumn: ColumnDef<PriorityDto> = {
  accessorKey: 'notifyOnly',
  header: () => <div className="justify-self-center">Notify Only</div>,
  cell: ({ row }) => <NotifyOnlyBadge priority={row.original} />,
  meta: { header: { width: DEFAULT_WIDTH } },
};

export const priorityColumns: ColumnDef<PriorityDto>[] = [
  createSelectColumn('select'),
  nameColumn,
  tierColumn,
  seqColumn,
  descriptionColumn,
  dateColumnDef<PriorityDto>('createdAt', 'CreatedAt', (elem) => new Date(elem.createdAt), DEFAULT_WIDTH),
  dateColumnDef<PriorityDto>(
    'updatedAt',
    'UpdatedAt',
    (elem) => (elem.updatedAt ? new Date(elem.updatedAt) : undefined),
    DEFAULT_WIDTH,
  ),
  notifyOnlyColumn,
];
