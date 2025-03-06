import { ColumnDef } from '@tanstack/react-table';
import { createSelectColumn } from '@/components/common/table/column_utils.tsx';
import { PriorityDto } from '@/client/channel/channel.types.ts';
import { NotifyBadge } from '@/components/priority/units/NotifyBadge.tsx';
import { PriorityFieldUpdateForm } from '@/components/priority/units/PriorityFieldUpdateForm.tsx';

const EDITABLE_WIDTH = '15rem';

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

const notifyColumn: ColumnDef<PriorityDto> = {
  accessorKey: 'shouldNotify',
  header: () => <div className="justify-self-center">Notify</div>,
  cell: ({ row }) => <NotifyBadge priority={row.original} />,
  meta: { header: { width: '10rem' } },
};

export const priorityColumns: ColumnDef<PriorityDto>[] = [
  createSelectColumn('select'),
  nameColumn,
  tierColumn,
  descriptionColumn,
  seqColumn,
  notifyColumn,
];
