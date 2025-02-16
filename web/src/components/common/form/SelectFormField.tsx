import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { SerializedStyles } from '@emotion/react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';
import { ReactNode } from 'react';
import { firstLetterUppercase } from '@/common/utils.common.ts';
import { formItemStyle } from '@/components/common/styles/form.ts';

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
