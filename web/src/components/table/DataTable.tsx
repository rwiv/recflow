import { useState } from 'react';
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { columns } from '@/components/table/columns.tsx';
import { data } from '@/components/table/test_data.ts';
import { TableContent } from '@/components/table/TableContent.tsx';
import { FilterInput } from '@/components/table/FilterInput.tsx';
import { ColumnSelector } from '@/components/table/ColumnSelector.tsx';
import { SelectedRowCount } from '@/components/table/SelectedRowCount.tsx';
import { PageNavigation } from '@/components/table/PageNavigation.tsx';

export function DataTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <FilterInput table={table} columnId="email"/>
        <ColumnSelector table={table}/>
      </div>
      <div className="rounded-md border">
        <TableContent table={table}/>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <SelectedRowCount table={table}/>
        <PageNavigation table={table}/>
      </div>
    </div>
  );
}
