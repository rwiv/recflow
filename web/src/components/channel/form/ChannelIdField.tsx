import { EditForm } from '@/components/channel/form/types.ts';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';
import { Input } from '@/components/ui/input.tsx';

export function ChannelIdField({ form }: { form: EditForm }) {
  return (
    <FormField
      control={form.control}
      name="uid"
      render={({ field }) => (
        <FormItem>
          <FormLabel>UID</FormLabel>
          <FormControl>
            <Input placeholder="Enter UID" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
