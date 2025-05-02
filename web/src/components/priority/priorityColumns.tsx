import { ColumnDef } from '@tanstack/react-table';
import { createSelectColumn, dateColumnDef } from '@/components/common/table/column_utils.tsx';
import { NotifyOnlyBadge } from '@/components/priority/units/NotifyOnlyBadge.tsx';
import { PriorityFieldUpdateForm } from '@/components/priority/units/PriorityFieldUpdateForm.tsx';
import { PriorityDto } from '@/client/channel/priority.schema.ts';
import { ShouldSaveBadge } from '@/components/priority/units/ShouldSaveBadge.tsx';

const EDITABLE_WIDTH = '10rem';
const EDITABLE_NUM_WIDTH = '6rem';
const BUTTON_WIDTH = '8rem';
const DEFAULT_WIDTH = '9rem';

const nameColumn: ColumnDef<PriorityDto> = {
  accessorKey: 'name',
  header: () => <div className="justify-self-center">Name</div>,
  cell: ({ row }) => <PriorityFieldUpdateForm type="name" priority={row.original} />,
  meta: { header: { width: EDITABLE_WIDTH } },
};

const shouldSaveColumn: ColumnDef<PriorityDto> = {
  accessorKey: 'shouldSave',
  header: () => <div className="justify-self-center">Save</div>,
  cell: ({ row }) => <ShouldSaveBadge priority={row.original} />,
  meta: { header: { width: BUTTON_WIDTH } },
};

const descriptionColumn: ColumnDef<PriorityDto> = {
  accessorKey: 'description',
  header: () => <div className="justify-self-center">Description</div>,
  cell: ({ row }) => <PriorityFieldUpdateForm type="description" priority={row.original} />,
};

const tierColumn: ColumnDef<PriorityDto> = {
  accessorKey: 'tier',
  header: () => <div className="justify-self-center">Tier</div>,
  cell: ({ row }) => <PriorityFieldUpdateForm type="tier" priority={row.original} />,
  meta: { header: { width: EDITABLE_NUM_WIDTH } },
};

const seqColumn: ColumnDef<PriorityDto> = {
  accessorKey: 'seq',
  header: () => <div className="justify-self-center">Seq</div>,
  cell: ({ row }) => <PriorityFieldUpdateForm type="seq" priority={row.original} />,
  meta: { header: { width: EDITABLE_NUM_WIDTH } },
};

const shouldNotifyColumn: ColumnDef<PriorityDto> = {
  accessorKey: 'shouldNotify',
  header: () => <div className="justify-self-center">Notify</div>,
  cell: ({ row }) => <NotifyOnlyBadge priority={row.original} />,
  meta: { header: { width: BUTTON_WIDTH } },
};

export const priorityColumns: ColumnDef<PriorityDto>[] = [
  createSelectColumn('select'),
  nameColumn,
  shouldSaveColumn,
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
  shouldNotifyColumn,
];
