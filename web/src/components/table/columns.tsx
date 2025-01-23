import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { Payment } from '@/components/table/types.ts';

export const selectCid = 'select';
export const statusCid = 'status';
export const emailCid = 'email';
export const amountCid = 'amount';
export const actionsCid = 'actions';

const selectColumn: ColumnDef<Payment> = {
  id: selectCid,
  header: ({ table }) => (
    <Checkbox
      checked={
        table.getIsAllPageRowsSelected() ||
        (table.getIsSomePageRowsSelected() && 'indeterminate')
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

const statusColumn: ColumnDef<Payment> = {
  accessorKey: statusCid,
  header: 'Status',
  cell: ({ row }) => (
    <div className="capitalize">{row.getValue(statusCid)}</div>
  ),
};

const emailColumn: ColumnDef<Payment> = {
  accessorKey: emailCid,
  header: ({ column }) => {
    return (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Email
        <ArrowUpDown />
      </Button>
    );
  },
  cell: ({ row }) => <div className="lowercase">{row.getValue(emailCid)}</div>,
};

const amountColumn: ColumnDef<Payment> = {
  accessorKey: amountCid,
  header: () => <div className="text-right">Amount</div>,
  cell: ({ row }) => {
    const amount = parseFloat(row.getValue(amountCid));

    // Format the amount as a dollar amount
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

    return <div className="text-right font-medium">{formatted}</div>;
  },
};

const actionsColumn: ColumnDef<Payment> = {
  id: actionsCid,
  enableHiding: false,
  cell: ({ row }) => {
    const payment = row.original;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(payment.id)}
          >
            Copy payment ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>View customer</DropdownMenuItem>
          <DropdownMenuItem>View payment details</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

export const columns: ColumnDef<Payment>[] = [
  selectColumn,
  statusColumn,
  emailColumn,
  amountColumn,
  actionsColumn,
];
