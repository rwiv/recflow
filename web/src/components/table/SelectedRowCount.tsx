import { Table } from '@tanstack/react-table';
import { Payment } from '@/components/table/types.ts';

export function SelectedRowCount({ table }: { table: Table<Payment> }) {
  return (
    <div className="flex-1 text-sm text-muted-foreground">
      {table.getFilteredSelectedRowModel().rows.length} of{' '}
      {table.getFilteredRowModel().rows.length} row(s) selected.
    </div>
  );
}
