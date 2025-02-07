import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button.tsx';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { ReactNode, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx';
import { DialogClose } from '@radix-ui/react-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx';
import { CHANNEL_PRIORITIES } from '@/common/enum.consts.ts';
import { css } from '@emotion/react';
import { useChannelPageStore } from '@/hooks/useChannelPageStore.ts';
import { updateChannelPriority } from '@/client/channel.client.ts';
import { ChannelRecord } from '@/client/channel.types.ts';

const FormSchema = z.object({
  priority: z.enum(CHANNEL_PRIORITIES),
});

export function PriorityUpdateDialog({
  channel,
  children,
}: {
  channel: ChannelRecord;
  children: ReactNode;
}) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Channel Priority</DialogTitle>
          <DialogDescription>Click save when you're done.</DialogDescription>
        </DialogHeader>
        <CreateForm channel={channel} cb={() => closeBtnRef?.current?.click()} />
        <DialogClose ref={closeBtnRef} />
      </DialogContent>
    </Dialog>
  );
}

function CreateForm({ channel, cb }: { channel: ChannelRecord; cb: () => void }) {
  const queryClient = useQueryClient();
  const { pageState } = useChannelPageStore();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      priority: channel.priorityName,
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    await updateChannelPriority(channel.id, data.priority);
    if (!pageState) return;
    await queryClient.invalidateQueries({ queryKey: pageState.queryKeys() });
    cb();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem css={css({ marginTop: '0.4rem', marginBottom: '2rem' })}>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="must">MUST</SelectItem>
                  <SelectItem value="should">SHOULD</SelectItem>
                  <SelectItem value="may">MAY</SelectItem>
                  <SelectItem value="review">REVIEW</SelectItem>
                  <SelectItem value="skip">SKIP</SelectItem>
                  <SelectItem value="none">NONE</SelectItem>
                </SelectContent>
              </Select>
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
