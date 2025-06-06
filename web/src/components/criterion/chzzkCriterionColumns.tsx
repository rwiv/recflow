import { ColumnDef } from '@tanstack/react-table';
import { ChzzkCriterionDto } from '@/client/criterion/criterion.schema.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { createSelectColumn } from '@/components/common/table/column_utils.tsx';
import { CriterionFieldUpdateForm } from '@/components/criterion/units/CriterionFieldUpdateForm.tsx';
import {
  CriterionActivationBadge,
  CriterionDomesticOnlyBadge,
  CriterionEnforceCredentialsBadge,
  CriterionLoggingOnlyBadge,
  CriterionOverseasFirstBadge,
} from '@/components/criterion/units/criterion_badges.tsx';

const NORMAL_WIDTH = '6rem';
const EDITABLE_WIDTH = '6rem';

const nameColumn: ColumnDef<ChzzkCriterionDto> = {
  accessorKey: 'name',
  header: () => <div className="justify-self-center">Name</div>,
  cell: ({ row }) => <div className="justify-self-center">{row.original.name}</div>,
  meta: { header: { width: NORMAL_WIDTH } },
};

const isDeactivatedColumn: ColumnDef<ChzzkCriterionDto> = {
  accessorKey: 'isDeactivated',
  header: () => <div className="justify-self-center">Activated</div>,
  cell: ({ row }) => <CriterionActivationBadge criterion={row.original} />,
  meta: { header: { width: NORMAL_WIDTH } },
};

const enforceCredsColumn: ColumnDef<ChzzkCriterionDto> = {
  accessorKey: 'enforceCreds',
  header: () => <div className="justify-self-center">CredentialsOnly</div>,
  cell: ({ row }) => <CriterionEnforceCredentialsBadge criterion={row.original} />,
  meta: { header: { width: NORMAL_WIDTH } },
};

// const adultOnlyColumn: ColumnDef<ChzzkCriterionDto> = {
//   accessorKey: 'adultOnly',
//   header: () => <div className="justify-self-center">AdultOnly</div>,
//   cell: ({ row }) => <CriterionAdultOnlyBadge criterion={row.original} />,
//   meta: { header: { width: NORMAL_WIDTH } },
// };

const domesticOnlyColumn: ColumnDef<ChzzkCriterionDto> = {
  accessorKey: 'domesticOnly',
  header: () => <div className="justify-self-center">DomesticOnly</div>,
  cell: ({ row }) => <CriterionDomesticOnlyBadge criterion={row.original} />,
  meta: { header: { width: NORMAL_WIDTH } },
};

const overseasFirstColumn: ColumnDef<ChzzkCriterionDto> = {
  accessorKey: 'overseasFirst',
  header: () => <div className="justify-self-center">OverseasFirst</div>,
  cell: ({ row }) => <CriterionOverseasFirstBadge criterion={row.original} />,
  meta: { header: { width: NORMAL_WIDTH } },
};

const loggingOnlyColumn: ColumnDef<ChzzkCriterionDto> = {
  accessorKey: 'loggingOnly',
  header: () => <div className="justify-self-center">LoggingOnly</div>,
  cell: ({ row }) => <CriterionLoggingOnlyBadge criterion={row.original} />,
  meta: { header: { width: NORMAL_WIDTH } },
};

const sufficientUserCntColumn: ColumnDef<ChzzkCriterionDto> = {
  accessorKey: 'sufficientUserCnt',
  header: () => <div className="justify-self-center">SUC</div>,
  cell: ({ row }) => <CriterionFieldUpdateForm type="sufficientUserCnt" criterion={row.original} />,
  meta: { header: { width: EDITABLE_WIDTH } },
};

const minUserCntColumn: ColumnDef<ChzzkCriterionDto> = {
  accessorKey: 'minUserCnt',
  header: () => <div className="justify-self-center">MUC</div>,
  cell: ({ row }) => <CriterionFieldUpdateForm type="minUserCnt" criterion={row.original} />,
  meta: { header: { width: EDITABLE_WIDTH } },
};

const minFollowCntColumn: ColumnDef<ChzzkCriterionDto> = {
  accessorKey: 'minFollowCnt',
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
          <Badge key={i} variant="secondary" className="cursor-default">
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
  // adultOnlyColumn,
  domesticOnlyColumn,
  overseasFirstColumn,
  loggingOnlyColumn,
  sufficientUserCntColumn,
  minUserCntColumn,
  minFollowCntColumn,
  createUnitColumn('positiveTags', 'p_tags'),
  createUnitColumn('negativeTags', 'n_tags'),
  createUnitColumn('positiveKeywords', 'p_keywords'),
  createUnitColumn('negativeKeywords', 'n_keywords'),
  createUnitColumn('positiveWps', 'p_wps'),
  createUnitColumn('negativeWps', 'n_wps'),
];
