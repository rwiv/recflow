import { Table } from '@tanstack/react-table';
import { Input } from '@/components/ui/input.tsx';

interface FilterInputProps<T> {
  table: Table<T>;
  columnId: string;
  placeholder: string;
}

export function FilterInput<T>({ table, columnId, placeholder }: FilterInputProps<T>) {
  return (
    <Input
      placeholder={placeholder}
      value={(table.getColumn(columnId)?.getFilterValue() as string) ?? ''}
      onChange={(event) => table.getColumn(columnId)?.setFilterValue(event.target.value)}
      className="max-w-sm"
    />
  );
}
