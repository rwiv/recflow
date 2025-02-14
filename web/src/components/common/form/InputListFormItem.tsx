import { ControllerRenderProps, FieldValues } from 'react-hook-form';
import { useState } from 'react';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';
import { formItemStyle } from '@/components/common/styles/form.ts';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Badge } from '@/components/ui/badge.tsx';

interface InputListFormItemProps<T extends FieldValues> {
  field: ControllerRenderProps<T>;
  label: string;
  values: string[];
}

export function InputListFormItem<T extends FieldValues>({
  field,
  label,
  values,
}: InputListFormItemProps<T>) {
  const [input, setInput] = useState('');
  const addValue = () => {
    if (!input) return;
    field.onChange([...field.value, input]);
    setInput('');
  };
  return (
    <FormItem css={formItemStyle}>
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
