import { SerializedStyles } from '@emotion/react';
import { ReactNode } from 'react';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';

import { formItemStyle } from '@/shared/lib/styles/form.ts';
import { firstLetterUppercase } from '@/shared/lib/types/strings.ts';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/cn/form.tsx';
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/shared/ui/cn/select.tsx';

interface SelectFormFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  children: ReactNode;
  label?: string;
  placeholder?: string;
  className?: string;
  style?: SerializedStyles;
  defaultValue?: string;
}

export function SelectFormField<T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  children,
  className,
  style,
  defaultValue,
}: SelectFormFieldProps<T>) {
  label = label || firstLetterUppercase(name);
  style = style || formItemStyle;
  placeholder = placeholder || `Select a ${label}...`;
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className} css={style}>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={defaultValue ?? field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={<span className="text-muted-foreground">{placeholder}</span>} />
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
