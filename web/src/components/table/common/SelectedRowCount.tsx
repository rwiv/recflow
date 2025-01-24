import { Table } from '@tanstack/react-table';

export function SelectedRowCount<T>({ table }: { table: Table<T> }) {
  return (
    <div className="flex-1 text-sm text-muted-foreground">
      {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length}{' '}
      row(s) selected.
    </div>
  );
}
