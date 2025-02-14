import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { SerializedStyles } from '@emotion/react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';
import { ReactNode } from 'react';

interface SelectFormFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  children: ReactNode;
  className?: string;
  style?: SerializedStyles;
}

export function SelectFormField<T extends FieldValues>({
  form,
  name,
  label,
  children,
  className,
  style,
}: SelectFormFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className} css={style}>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select Platform" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>{children}</SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
