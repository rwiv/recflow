import { SerializedStyles } from '@emotion/react';
import { useState } from 'react';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';

import { formItemStyle } from '@/shared/lib/styles/form.ts';
import { Badge } from '@/shared/ui/cn/badge.tsx';
import { Button } from '@/shared/ui/cn/button.tsx';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/shared/ui/cn/form.tsx';
import { Input } from '@/shared/ui/cn/input.tsx';

interface InputListFormItemProps<T extends FieldValues> {
  field: ControllerRenderProps<T>;
  values: string[];
  label?: string;
  placeholder?: string;
  style?: SerializedStyles;
}

export function InputListFormItem<T extends FieldValues>({
  field,
  label,
  placeholder,
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
            <Input placeholder={placeholder} value={input} onChange={(ev) => setInput(ev.target.value)} />
            <Button type="button" variant="outline" onClick={() => addValue()}>
              Add
            </Button>
          </div>
          <div className="flex space-x-1 mt-2">
            {values.map((value, i) => (
              <Badge variant="secondary" key={i}>
                {value}
              </Badge>
            ))}
          </div>
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
