import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { Button } from '@/components/ui/button.tsx';
import { ArrowUpDown } from 'lucide-react';
import { formatTimeAgo } from '@/lib/date.ts';

export function baseColumnDef<T>(
  cid: string,
  header: string | undefined = undefined,
  className: string = '',
): ColumnDef<T> {
  if (!header) {
    header = firstLetterUppercase(cid);
  }
  return {
    accessorKey: cid,
    header,
    cell: ({ row }) => <div className={className}>{row.getValue(cid)}</div>,
  };
}

export function sortableColumnDef<T>(
  cid: string,
  header: string | undefined = undefined,
): ColumnDef<T> {
  if (!header) {
    header = firstLetterUppercase(cid);
  }
  return {
    accessorKey: cid,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {header}
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue(cid)}</div>,
  };
}

function firstLetterUppercase(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function createSelectColumn<T>(cid: string, className: string = 'mx-2'): ColumnDef<T> {
  return {
    id: cid,
    header: ({ table }) => (
      <Checkbox
        className={className}
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className={className}
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };
}

export function dateColumnDef<T>(
  cid: string,
  header: string,
  getDate: (elem: T) => Date,
): ColumnDef<T> {
  return {
    accessorKey: cid,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
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
