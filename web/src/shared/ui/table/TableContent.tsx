import { css } from '@emotion/react';
import { Table as TableType, flexRender } from '@tanstack/react-table';

import { getStyleCell, getStyleHeader } from '@/shared/lib/styles/meta.ts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/cn/table.tsx';

interface TableContentProps<T> {
  table: TableType<T>;
  columnLength: number;
}

export function TableContent<T>({ table, columnLength }: TableContentProps<T>) {
  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const { cn, style } = getStyleHeader(header);
              return (
                <TableHead key={header.id} className={cn} css={style}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && 'selected'}
              css={css({ height: '3rem' })}
            >
              {row.getVisibleCells().map((cell) => {
                const { cn, style } = getStyleCell(cell);
                return (
                  <TableCell key={cell.id} className={cn} css={style}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columnLength} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
