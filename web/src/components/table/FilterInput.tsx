import { Table } from '@tanstack/react-table';
import { Payment } from '@/components/table/types.ts';
import { Input } from '@/components/ui/input.tsx';

interface FilterInputProps {
  table: Table<Payment>;
  columnId: string;
  placeholder: string;
}

export function FilterInput({
  table,
  columnId,
  placeholder,
}: FilterInputProps) {
  return (
    <Input
      placeholder={placeholder}
      value={(table.getColumn(columnId)?.getFilterValue() as string) ?? ''}
      onChange={(event) =>
        table.getColumn(columnId)?.setFilterValue(event.target.value)
      }
      className="max-w-sm"
    />
  );
}
