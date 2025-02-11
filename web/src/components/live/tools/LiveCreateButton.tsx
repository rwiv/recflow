import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button.tsx';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { createLive } from '@/client/live.client.ts';
import { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx';
import { DialogClose } from '@radix-ui/react-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';
import { Input } from '@/components/ui/input.tsx';
import { LIVES_QUERY_KEY } from '@/common/constants.ts';
import { formItemStyle } from '@/components/common/styles/form.ts';
import { platformEnum } from '@/client/common.schema.ts';

const FormSchema = z.object({
  type: platformEnum,
  uid: z.string().nonempty(),
});

export function LiveCreateButton() {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Add</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Live</DialogTitle>
          <DialogDescription>Click save when you're done.</DialogDescription>
        </DialogHeader>
        <CreateForm cb={() => closeBtnRef.current?.click()} />
        <DialogClose ref={closeBtnRef} />
      </DialogContent>
    </Dialog>
  );
}

export function CreateForm({ cb }: { cb: () => void }) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      type: 'chzzk',
      uid: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    await createLive(data.uid, data.type);
    await queryClient.invalidateQueries({ queryKey: [LIVES_QUERY_KEY] });
    cb();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem css={formItemStyle}>
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
        <FormField
          control={form.control}
          name="uid"
          render={({ field }) => (
            <FormItem css={formItemStyle}>
              <FormLabel>UID</FormLabel>
              <FormControl>
                <Input placeholder="Enter UID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-row justify-end mt-5">
          <Button type="submit" className="px-7">
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}
