import { ColumnDef } from '@tanstack/react-table';
import { createSelectColumn, dateColumnDef } from '@/components/common/table/column_utils.tsx';
import { NotifyOnlyBadge } from '@/components/grade/units/NotifyOnlyBadge.tsx';
import { GradeFieldUpdateForm } from '@/components/grade/units/GradeFieldUpdateForm.tsx';
import { GradeDto } from '@/client/channel/grade.schema.ts';
import { ShouldSaveBadge } from '@/components/grade/units/ShouldSaveBadge.tsx';

const EDITABLE_WIDTH = '10rem';
const EDITABLE_NUM_WIDTH = '6rem';
const BUTTON_WIDTH = '8rem';
const DEFAULT_WIDTH = '9rem';

const nameColumn: ColumnDef<GradeDto> = {
  accessorKey: 'name',
  header: () => <div className="justify-self-center">Name</div>,
  cell: ({ row }) => <GradeFieldUpdateForm type="name" grade={row.original} />,
  meta: { header: { width: EDITABLE_WIDTH } },
};

const shouldSaveColumn: ColumnDef<GradeDto> = {
  accessorKey: 'shouldSave',
  header: () => <div className="justify-self-center">Save</div>,
  cell: ({ row }) => <ShouldSaveBadge grade={row.original} />,
  meta: { header: { width: BUTTON_WIDTH } },
};

const descriptionColumn: ColumnDef<GradeDto> = {
  accessorKey: 'description',
  header: () => <div className="justify-self-center">Description</div>,
  cell: ({ row }) => <GradeFieldUpdateForm type="description" grade={row.original} />,
};

const tierColumn: ColumnDef<GradeDto> = {
  accessorKey: 'tier',
  header: () => <div className="justify-self-center">Tier</div>,
  cell: ({ row }) => <GradeFieldUpdateForm type="tier" grade={row.original} />,
  meta: { header: { width: EDITABLE_NUM_WIDTH } },
};

const seqColumn: ColumnDef<GradeDto> = {
  accessorKey: 'seq',
  header: () => <div className="justify-self-center">Seq</div>,
  cell: ({ row }) => <GradeFieldUpdateForm type="seq" grade={row.original} />,
  meta: { header: { width: EDITABLE_NUM_WIDTH } },
};

const shouldNotifyColumn: ColumnDef<GradeDto> = {
  accessorKey: 'shouldNotify',
  header: () => <div className="justify-self-center">Notify</div>,
  cell: ({ row }) => <NotifyOnlyBadge grade={row.original} />,
  meta: { header: { width: BUTTON_WIDTH } },
};

export const gradeColumns: ColumnDef<GradeDto>[] = [
  createSelectColumn('select'),
  nameColumn,
  shouldSaveColumn,
  tierColumn,
  seqColumn,
  descriptionColumn,
  dateColumnDef<GradeDto>('createdAt', 'CreatedAt', (elem) => new Date(elem.createdAt), DEFAULT_WIDTH),
  dateColumnDef<GradeDto>(
    'updatedAt',
    'UpdatedAt',
    (elem) => (elem.updatedAt ? new Date(elem.updatedAt) : undefined),
    DEFAULT_WIDTH,
  ),
  shouldNotifyColumn,
];
