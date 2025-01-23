import { Table } from '@tanstack/react-table';
import { Payment } from '@/components/table/types.ts';
import { Button } from '@/components/ui/button.tsx';

export function PageNavigation({ table }: { table: Table<Payment> }) {
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
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        Next
      </Button>
    </div>
  );
}
