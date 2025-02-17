import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { Button } from '@/components/ui/button.tsx';
import { ArrowUpDown } from 'lucide-react';
import { formatTimeAgo } from '@/lib/date.ts';
import { firstLetterUppercase } from '@/common/utils.strings.ts';
import { cn } from '@/lib/utils.ts';
import { ColumnMetaStyle } from '@/components/common/styles/meta.ts';

export function sortableColumnDef<T>(cid: string, header: string | undefined = undefined): ColumnDef<T> {
  if (!header) {
    header = firstLetterUppercase(cid);
  }
  return {
    accessorKey: cid,
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          {header}
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue(cid)}</div>,
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

export function dateColumnDef<T>(cid: string, header: string, getDate: (elem: T) => Date): ColumnDef<T> {
  return {
    accessorKey: cid,
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          {header}
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div>{formatTimeAgo(getDate(row.original))}</div>;
    },
    sortingFn: (rowA, rowB, _) => {
      const dateA = getDate(rowA.original);
      const dateB = getDate(rowB.original);
      return dateA.getTime() - dateB.getTime(); // Ascending
    },
  };
}
