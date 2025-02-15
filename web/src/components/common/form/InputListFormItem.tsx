import { ControllerRenderProps, FieldValues } from 'react-hook-form';
import { useState } from 'react';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';
import { formItemStyle } from '@/components/common/styles/form.ts';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { SerializedStyles } from '@emotion/react';

interface InputListFormItemProps<T extends FieldValues> {
  field: ControllerRenderProps<T>;
  values: string[];
  label?: string;
  style?: SerializedStyles;
}

export function InputListFormItem<T extends FieldValues>({
  field,
  label,
  values,
  style,
}: InputListFormItemProps<T>) {
  style = style || formItemStyle;
  const [input, setInput] = useState('');
  const addValue = () => {
    if (!input) return;
    field.onChange([...field.value, input]);
    setInput('');
  };
  return (
    <FormItem css={style}>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="flex flex-col">
          <div className="flex flex-row space-x-2">
            <Input value={input} onChange={(ev) => setInput(ev.target.value)} />
            <Button type="button" onClick={() => addValue()}>
              Add
            </Button>
          </div>
          <div className="flex space-x-1 mt-2">
            {values.map((value, i) => (
              <Badge key={i}>{value}</Badge>
            ))}
          </div>
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
