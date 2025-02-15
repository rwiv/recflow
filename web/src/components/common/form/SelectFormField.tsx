import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { SerializedStyles } from '@emotion/react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';
import { ReactNode } from 'react';
import { firstLetterUppercase } from '@/common/utils.ts';
import { formItemStyle } from '@/components/common/styles/form.ts';

interface SelectFormFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  children: ReactNode;
  label?: string;
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
  label = label || firstLetterUppercase(name);
  style = style || formItemStyle;
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
                <SelectValue placeholder={`Select ${label}`} />
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
