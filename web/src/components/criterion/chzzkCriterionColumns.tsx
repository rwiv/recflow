import { ColumnDef } from '@tanstack/react-table';
import { ChzzkCriterionDto } from '@/client/criterion/criterion.schema.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { createSelectColumn } from '@/components/common/table/column_utils.tsx';
import { ActivationBadge } from '@/components/criterion/units/ActivationBadge.tsx';
import { EnforceCredentialsBadge } from '@/components/criterion/units/EnforceCredentialsBadge.tsx';
import { CriterionFieldUpdateForm } from '@/components/criterion/units/CriterionFieldUpdateForm.tsx';

const NORMAL_WIDTH = '6rem';
const EDITABLE_WIDTH = '6rem';

const nameColumn: ColumnDef<ChzzkCriterionDto> = {
  accessorKey: 'name',
  header: () => <div className="justify-self-center">Name</div>,
  cell: ({ row }) => <div className="justify-self-center">{row.original.name}</div>,
  meta: { header: { width: NORMAL_WIDTH } },
};

const enforceCredsColumn: ColumnDef<ChzzkCriterionDto> = {
  accessorKey: 'enforceCreds',
  header: () => <div className="justify-self-center">Credentials</div>,
  cell: ({ row }) => <EnforceCredentialsBadge criterion={row.original} />,
  meta: { header: { width: NORMAL_WIDTH } },
};

const isDeactivatedColumn: ColumnDef<ChzzkCriterionDto> = {
  accessorKey: 'isDeactivated',
  header: () => <div className="justify-self-center">Activated</div>,
  cell: ({ row }) => <ActivationBadge criterion={row.original} />,
  meta: { header: { width: NORMAL_WIDTH } },
};

const minUserCntColumn: ColumnDef<ChzzkCriterionDto> = {
  accessorKey: 'minUserCnt',
  header: () => <div className="justify-self-center">MUC</div>,
  cell: ({ row }) => <CriterionFieldUpdateForm type="minUserCnt" criterion={row.original} />,
  meta: { header: { width: EDITABLE_WIDTH } },
};

const minFollowCntColumn: ColumnDef<ChzzkCriterionDto> = {
  accessorKey: 'miawFollowCnt',
  header: () => <div className="justify-self-center">MFC</div>,
  cell: ({ row }) => <CriterionFieldUpdateForm type="minFollowCnt" criterion={row.original} />,
  meta: { header: { width: EDITABLE_WIDTH } },
};

type RuleKey =
  | 'positiveTags'
  | 'negativeTags'
  | 'positiveKeywords'
  | 'negativeKeywords'
  | 'positiveWps'
  | 'negativeWps';

function createUnitColumn(key: RuleKey, header: string): ColumnDef<ChzzkCriterionDto> {
  return {
    accessorKey: key,
    header: () => <div className="justify-self-center">{header}</div>,
    cell: ({ row }) => (
      <div className="justify-self-center space-x-1">
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
  isDeactivatedColumn,
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
