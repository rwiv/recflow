import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';
import { SerializedStyles } from '@emotion/react';
import { firstLetterUppercase } from '@/common/utils.strings.ts';
import { formItemStyle } from '@/components/common/styles/form.ts';
import { Textarea } from '@/components/ui/textarea.tsx';
import { cn } from '@/lib/utils';

interface TextFormFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  className?: string;
  style?: SerializedStyles;
  contentClassName?: string;
  contentStyle?: SerializedStyles;
}

export function TextAreaFormField<T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  className,
  style,
  contentClassName,
  contentStyle,
}: TextFormFieldProps<T>) {
  label = label || firstLetterUppercase(name);
  style = style || formItemStyle;
  placeholder = placeholder || `Write about ${label}...`;
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className} css={style}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              className={cn('resize-none', contentClassName)}
              css={contentStyle}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
