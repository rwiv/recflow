import { ColumnDef } from '@tanstack/react-table';
import { ChzzkCriterionDto } from '@/client/criterion.schema.ts';

export const nameCid = 'name';

const nameColumn: ColumnDef<ChzzkCriterionDto> = {
  accessorKey: nameCid,
  header: () => <div className="ml-9 my-1">Name</div>,
  cell: ({ row }) => <div className="ml-9 my-1">{row.original.name}</div>,
};

export const chzzkCriterionColumns: ColumnDef<ChzzkCriterionDto>[] = [nameColumn];
