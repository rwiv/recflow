import { SerializedStyles } from '@emotion/react';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';

import { formItemStyle } from '@/shared/lib/styles/form.ts';
import { firstLetterUppercase } from '@/shared/lib/types/strings.ts';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/cn/form.tsx';
import { Input } from '@/shared/ui/cn/input.tsx';

interface TextFormFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  className?: string;
  style?: SerializedStyles;
}

export function TextFormField<T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  className,
  style,
}: TextFormFieldProps<T>) {
  label = label || firstLetterUppercase(name);
  style = style || formItemStyle;
  placeholder = placeholder || `Enter ${label}...`;
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className} css={style}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input placeholder={placeholder} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function TextFormFieldNonLabel<T extends FieldValues>({
  form,
  name,
  label,
  className,
  style,
}: TextFormFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className} css={style}>
          <FormControl>
            <Input placeholder={label} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
