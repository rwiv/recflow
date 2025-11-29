import { Table } from '@tanstack/react-table';
import { Button } from '@shared/ui/cn/button.tsx';

export function PageNavigation<T>({ table }: { table: Table<T> }) {
  return (
    <div className="space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        Previous
      </Button>
      <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
        Next
      </Button>
    </div>
  );
}
