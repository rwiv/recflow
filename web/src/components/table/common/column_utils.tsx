import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { Button } from '@/components/ui/button.tsx';
import { ArrowUpDown } from 'lucide-react';

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

export function createSelectColumn<T>(cid: string): ColumnDef<T> {
  return {
    id: cid,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };
}
