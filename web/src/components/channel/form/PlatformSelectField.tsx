import { EditFormProps } from '@/components/channel/form/types.ts';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx';
import { UseFormReturn } from 'react-hook-form';

export function PlatformSelectField({ form }: { form: UseFormReturn<EditFormProps> }) {
  return (
    <FormField
      control={form.control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Type</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="chzzk">CHZZK</SelectItem>
              <SelectItem value="soop">SOOP</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
