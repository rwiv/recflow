import { ColumnDef } from '@tanstack/react-table';
import { ChzzkCriterionDto } from '@/client/criterion.schema.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { createSelectColumn } from '@/components/common/table/column_utils.tsx';

const nameColumn: ColumnDef<ChzzkCriterionDto> = {
  accessorKey: 'name',
  header: () => <div className="ml-9 my-1">Name</div>,
  cell: ({ row }) => <div className="ml-9 my-1">{row.original.name}</div>,
};

const descriptionColumn: ColumnDef<ChzzkCriterionDto> = {
  accessorKey: 'description',
  header: () => <div className="ml-9 my-1">Description</div>,
  cell: ({ row }) => <div className="ml-9 my-1">{row.original.description}</div>,
};

const enforceCredsColumn: ColumnDef<ChzzkCriterionDto> = {
  accessorKey: 'enforceCreds',
  header: () => <div className="ml-9 my-1">enforceCreds</div>,
  cell: ({ row }) => <div className="ml-9 my-1">{row.original.enforceCreds ? 'Yes' : 'No'}</div>,
};

const minUserCntColumn: ColumnDef<ChzzkCriterionDto> = {
  accessorKey: 'minUserCnt',
  header: () => <div className="ml-9 my-1">minUserCnt</div>,
  cell: ({ row }) => <div className="ml-9 my-1">{row.original.minUserCnt}</div>,
};

const minFollowCntColumn: ColumnDef<ChzzkCriterionDto> = {
  accessorKey: 'minFollowCnt',
  header: () => <div className="ml-9 my-1">minFollowCnt</div>,
  cell: ({ row }) => <div className="ml-9 my-1">{row.original.minFollowCnt}</div>,
};

type ChzzkKey =
  | 'positiveTags'
  | 'negativeTags'
  | 'positiveKeywords'
  | 'negativeKeywords'
  | 'positiveWps'
  | 'negativeWps';

function createUnitColumn(key: ChzzkKey, header: string): ColumnDef<ChzzkCriterionDto> {
  return {
    accessorKey: key,
    header: () => <div className="ml-9 my-1">{header}</div>,
    cell: ({ row }) => (
      <div className="ml-9 my-1">
        {row.original[key].map((value, i) => (
          <Badge key={i} className="cursor-default">
            {value}
          </Badge>
        ))}
      </div>
    ),
  };
}

export const chzzkCriterionColumns: ColumnDef<ChzzkCriterionDto>[] = [
  createSelectColumn('select'),
  nameColumn,
  descriptionColumn,
  enforceCredsColumn,
  minUserCntColumn,
  minFollowCntColumn,
  createUnitColumn('positiveTags', 'p_tags'),
  createUnitColumn('negativeTags', 'n_tags'),
  createUnitColumn('positiveKeywords', 'p_keywords'),
  createUnitColumn('negativeKeywords', 'n_keywords'),
  createUnitColumn('positiveWps', 'p_wps'),
  createUnitColumn('negativeWps', 'n_wps'),
];
