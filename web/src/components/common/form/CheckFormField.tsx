import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { SerializedStyles } from '@emotion/react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { formItemStyle } from '@/components/common/styles/form.ts';
import { firstLetterUppercase } from '@/common/utils.strings.ts';

interface TextFormFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label?: string;
  className?: string;
  style?: SerializedStyles;
}

export function CheckFormField<T extends FieldValues>({
  form,
  name,
  label,
  className,
  style,
}: TextFormFieldProps<T>) {
  label = label || firstLetterUppercase(name);
  style = style || formItemStyle;
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className} css={style}>
          <FormItem css={style}>
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel className="ml-2 text-sm font-medium">{label}</FormLabel>
            <FormMessage />
          </FormItem>
        </FormItem>
      )}
    />
  );
}
