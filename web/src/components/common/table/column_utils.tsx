import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { Button } from '@/components/ui/button.tsx';
import { ArrowUpDown } from 'lucide-react';
import { prettyDate } from '@/lib/date.ts';
import { firstLetterUppercase } from '@/common/utils.strings.ts';
import { cn } from '@/lib/utils.ts';
import { ColumnMetaStyle } from '@/components/common/styles/meta.ts';

export function sortableColumnDef<T>(
  cid: string,
  header: string | undefined = undefined,
  getCellCn: (origin: T) => string | undefined,
  width?: string,
): ColumnDef<T> {
  if (!header) {
    header = firstLetterUppercase(cid);
  }
  if (!width) {
    width = '15em';
  }
  return {
    accessorKey: cid,
    header: ({ column }) => {
      return (
        <div className="justify-self-center">
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            {header}
            <ArrowUpDown />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const className = cn(getCellCn(row.original), 'justify-self-center');
      return <div className={className}>{row.getValue(cid)}</div>;
    },
    meta: { header: { width } },
  };
}

export function createSelectColumn<T>(cid: string, meta?: ColumnMetaStyle, className?: string): ColumnDef<T> {
  const globalCn = cn('ml-3', className);
  meta = meta ?? { header: { width: '4rem' } };
  return {
    id: cid,
    header: ({ table }) => (
      <Checkbox
        className={globalCn}
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className={globalCn}
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta,
  };
}

export function dateColumnDef<T>(
  cid: string,
  header: string,
  getDate: (elem: T) => Date | undefined,
  width?: string,
  getCellCn?: (origin: T) => string | undefined,
): ColumnDef<T> {
  if (!width) {
    width = '15em';
  }
  return {
    accessorKey: cid,
    header: ({ column }) => {
      return (
        <div className="justify-self-center">
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            {header}
            <ArrowUpDown />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const inputCn = getCellCn ? getCellCn(row.original) : undefined;
      const className = cn(inputCn, 'justify-self-center');
      const date = getDate(row.original);
      if (!date) {
        return <div className={className}>-</div>;
      }
      return <div className={className}>{prettyDate(date)}</div>;
    },
    sortingFn: (rowA, rowB, _) => {
      const dateA = getDate(rowA.original);
      const dateB = getDate(rowB.original);
      if (!dateA || !dateB) {
        return 0;
      }
      return dateA.getTime() - dateB.getTime(); // Ascending
    },
    meta: { header: { width } },
  };
}
